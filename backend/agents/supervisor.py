"""
supervisor.py  —  v4

Keyword-based query classification supervisor.
Routes queries to: RAG only | Web only | Both | LLM fallback

Changes from v3
───────────────
Fix 1  _calculate_rag_confidence() — confidence is now the average of the
       top-3 similarity scores, not max().  Prevents a single strong chunk
       from masking a poor overall retrieval.

Fix 2  Route is updated to "both" when low RAG confidence triggers web
       escalation, so the returned route always reflects the tools actually used.

Fix 3  _is_document_focused_query() — queries mentioning "chapter", "section",
       "clause", "page", etc. skip web escalation even if confidence is low.

Fix 4  _call_web() now returns (text, web_sources).  Result dict sources key
       is now {"rag": [...], "web": [...]} instead of a flat list.

Fix 5  External-entity detection no longer uses a capitalization heuristic.
       Only EXTERNAL_ENTITIES (explicit list) is matched.
       "Leave Policy" / "Attendance Policy" no longer cause false positives.
"""

from __future__ import annotations

import re
import logging
from typing import Literal, Optional

from agents.rag_agent import rag_search
from agents.web_search_agent import web_search
from agents.synthesis import SynthesisAgent
from agents.critic_agent import CriticAgent

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 0.  TUNABLES
# ─────────────────────────────────────────────────────────────────────────────

# Cosine similarity threshold; below this → also run web search
RAG_CONFIDENCE_THRESHOLD: float = 0.45

# Set > 1.0 to always run the critic (recommended until synthesis is trusted)
# Set to e.g. 0.70 to skip critic for high-confidence RAG-only answers
CRITIC_SKIP_THRESHOLD: float = 1.1   # Fix 3: always run critic


# ─────────────────────────────────────────────────────────────────────────────
# 1.  KEYWORD LISTS
# ─────────────────────────────────────────────────────────────────────────────

RAG_KEYWORDS: list[str] = [
    "pdf", "document", "report", "manual", "file", "uploaded",
    "attachment", "paper", "chapter", "section", "page",
    "summarize", "summary", "extract", "according to", "based on",
    "what does the document", "what does the report", "what does the file",
    "policy", "specification", "spec", "guideline", "procedure",
]

# Fix 1: these are STRONG web signals — they win even when docs are present
WEB_KEYWORDS: list[str] = [
    "latest", "recent", "news", "today", "current", "now",
    "2024", "2025", "2026", "this year", "this month", "this week",
    "price", "stock", "weather", "score", "trending", "update",
    "announcement", "release", "launch", "new version",
    "how does", "explain", "tutorial", "guide", "example",
    "best", "top", "review", "opinion",
]

# Fix 4: comparison words handled contextually, not in WEB_KEYWORDS
COMPARISON_KEYWORDS: list[str] = [
    "compare", "comparison", "difference between", "vs", "versus",
]

# Fix 5: Explicit external-entity list — no capitalization heuristic.
# "Leave Policy" / "Attendance Policy" no longer trigger false positives.
# Add entries here as needed; all matches are case-insensitive whole-word.
EXTERNAL_ENTITIES: list[str] = [
    # AI models
    "gpt-4", "gpt-3", "gpt-4o", "gpt4", "gpt3",
    "chatgpt", "claude", "gemini", "llama", "mistral",
    "copilot", "bard", "falcon", "phi-3", "phi3",
    # AI / tech companies
    "openai", "anthropic", "google", "microsoft", "amazon",
    "meta", "apple", "nvidia", "hugging face", "huggingface",
    # cloud platforms
    "aws", "azure", "gcp",
]

# Pre-compiled patterns: plain words use \b word boundaries;
# hyphenated tokens (gpt-4) use re.escape only.
_EXTERNAL_ENTITY_RE: list[re.Pattern[str]] = [
    re.compile(
        r"\b" + re.escape(e) + r"\b" if "-" not in e and " " not in e
        else re.escape(e),
        re.IGNORECASE,
    )
    for e in EXTERNAL_ENTITIES
]

DOC_ONLY_KEYWORDS: list[str] = [
    "in the pdf only", "only from the document", "only from the pdf",
    "from the uploaded", "this document only", "this pdf only",
    "the uploaded document", "the uploaded pdf", "the uploaded report",
    "the uploaded file",
]

WEB_ONLY_KEYWORDS: list[str] = [
    "search the web", "search online", "look it up", "find online",
    "google", "internet", "web search",
]


# ─────────────────────────────────────────────────────────────────────────────
# 2.  HELPERS
# ─────────────────────────────────────────────────────────────────────────────

RouteType = Literal["rag_only", "web_only", "both", "llm_fallback"]

# Number of top chunks used to compute RAG confidence (Fix 1).
RAG_CONFIDENCE_TOP_K: int = 3


def _calculate_rag_confidence(scores: list[float], top_k: int = RAG_CONFIDENCE_TOP_K) -> float:
    """Return the average similarity of the top-k scores (Fix 1).

    Using only max(scores) can mask a poor overall retrieval — one strong
    chunk hides several weak ones.  Averaging the top-k gives a more
    representative signal.

    Example
    -------
    scores = [0.91, 0.42, 0.39, 0.31]
    top_3  = [0.91, 0.42, 0.39]
    result = (0.91 + 0.42 + 0.39) / 3 ≈ 0.57   (was 0.91 with max)
    """
    if not scores:
        return 0.0
    top = sorted(scores, reverse=True)[:top_k]
    return sum(top) / len(top)


def _matches(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    for kw in keywords:
        pattern = r"\b" + re.escape(kw) + r"\b" if " " not in kw else re.escape(kw)
        if re.search(pattern, lower):
            return True
    return False


def _has_external_entity(query: str) -> bool:
    """Return True if the query mentions a known external entity (Fix 5).

    Matches against EXTERNAL_ENTITIES only — no capitalization heuristics.
    """
    for pattern in _EXTERNAL_ENTITY_RE:
        if pattern.search(query):
            return True
    return False


# ── Fix 3 helper ──────────────────────────────────────────────────────────────

# Words that indicate the question is anchored to the uploaded document.
# When present, low RAG confidence should NOT trigger web escalation.
_DOC_FOCUSED_TERMS: list[str] = [
    "chapter", "section", "clause", "page", "paragraph",
    "document", "pdf", "uploaded file", "uploaded document",
]

def _is_document_focused_query(query: str) -> bool:
    """Return True when the query is clearly about the uploaded document's
    own structure or content, making web escalation inappropriate even if
    RAG confidence is low (Fix 3).
    """
    return _matches(query, _DOC_FOCUSED_TERMS)


# ─────────────────────────────────────────────────────────────────────────────
# 3.  CLASSIFIER
# ─────────────────────────────────────────────────────────────────────────────

def classify_query(
    query: str,
    has_documents: bool = False,
) -> RouteType:
    """
    Classify a query into one of four routing categories.

    Priority order (highest → lowest)
    ──────────────────────────────────
    1.  doc_only override               → rag_only
    2.  web_only override               → web_only
    3.  strong web signal (Fix 1)
        ├── also has RAG signal         → both
        └── web only                    → web_only
        (has_documents does NOT override strong web signals)
    4.  RAG signal only                 → rag_only
    5.  Comparison keyword (Fix 4)
        ├── external entity + docs      → both
        ├── external entity, no docs    → web_only
        └── no external entity + docs   → rag_only
        └── no external entity, no docs → web_only
    6.  has_documents tie-breaker       → rag_only
    7.  nothing matched                 → llm_fallback
    """
    has_rag      = _matches(query, RAG_KEYWORDS)
    has_web      = _matches(query, WEB_KEYWORDS)       # strong web signal
    has_compare  = _matches(query, COMPARISON_KEYWORDS)
    doc_only     = _matches(query, DOC_ONLY_KEYWORDS)
    web_only_sig = _matches(query, WEB_ONLY_KEYWORDS)
    has_external = _has_external_entity(query)

    # ── hard overrides ────────────────────────────────────────────────────────
    if doc_only:
        return "rag_only"

    if web_only_sig:
        return "web_only"

    # ── strong web signal wins regardless of has_documents (Fix 1) ───────────
    if has_web:
        if has_rag:
            return "both"
        return "web_only"

    # ── RAG-only signal (no web signal) ───────────────────────────────────────
    if has_rag:
        return "rag_only"

    # ── comparison routing (Fix 4) ────────────────────────────────────────────
    if has_compare:
        if has_external:
            # Comparing external things; docs may still add useful context
            return "both" if has_documents else "web_only"
        else:
            # Comparing things inside the document (chapters, sections, clauses)
            return "rag_only" if has_documents else "web_only"

    # ── tie-breaker: docs exist but no keyword fired (Fix 1 safe zone) ────────
    if has_documents:
        return "rag_only"

    return "llm_fallback"


# ─────────────────────────────────────────────────────────────────────────────
# 4.  SUPERVISOR
# ─────────────────────────────────────────────────────────────────────────────

class Supervisor:
    """
    Orchestrates tool calls and agent invocations based on query routing.

    Flow
    ────
    classify(query, has_documents)
        → fetch context(s)
        → [RAG confidence check → also run web if low confidence]
        → synthesize
        → critique  (always, unless CRITIC_SKIP_THRESHOLD is lowered)
        → return result dict  ← now includes "sources" (Fix 5)
    """

    def __init__(self):
        self.synthesis_agent = SynthesisAgent()
        self.critic_agent    = CriticAgent()

    # ── public entry point ────────────────────────────────────────────────────

    def run(
        self,
        query: str,
        session_id: Optional[str] = None,
        has_documents: bool = False,
        doc_count: int = 0,
    ) -> dict:
        """
        Process a query end-to-end.

        Returns
        -------
        {
            "route":              str,
            "rag_context":        str,
            "web_context":        str,
            "synthesized_answer": str,
            "critique":           str,
            "rag_confidence":     float,
            "critic_skipped":     bool,
            "sources": {                    # Fix 4: structured by tool
                "rag": list[dict],          #   [{id, similarity, snippet, ...}]
                "web": list[dict],          #   [{source, snippet}]
            },
        }
        """
        route = classify_query(query, has_documents=has_documents)
        logger.info(
            "[Supervisor] session=%s  docs=%d  route=%r  query=%r",
            session_id, doc_count, route, query,
        )

        rag_context    = ""
        web_context    = ""
        rag_confidence = 0.0
        sources: list[dict] = []
        critic_skipped = False

        # ── fetch context ──────────────────────────────────────────────────
        if route == "rag_only":
            rag_context, rag_confidence, rag_sources = self._call_rag(query, session_id)

            # Fix 3: never escalate to web for document-structural questions
            # ("What is chapter 2 about?" should stay RAG-only even if confidence is low)
            doc_focused = _is_document_focused_query(query)

            if rag_confidence < RAG_CONFIDENCE_THRESHOLD and not doc_focused:
                logger.info(
                    "[Supervisor] RAG confidence %.2f < threshold %.2f, "
                    "query not doc-focused → also running web",
                    rag_confidence, RAG_CONFIDENCE_THRESHOLD,
                )
                web_context, web_sources = self._call_web(query)
                route = "both"   # Fix 2: reflect the actual tools used in the result
            else:
                web_sources = []
                if doc_focused and rag_confidence < RAG_CONFIDENCE_THRESHOLD:
                    logger.info(
                        "[Supervisor] RAG confidence %.2f low but query is "
                        "doc-focused → skipping web escalation (Fix 3)",
                        rag_confidence,
                    )

        elif route == "web_only":
            web_context, web_sources = self._call_web(query)
            rag_sources = []

        elif route == "both":
            rag_context, rag_confidence, rag_sources = self._call_rag(query, session_id)
            web_context, web_sources = self._call_web(query)

        else:  # llm_fallback
            rag_sources = []
            web_sources = []
            if has_documents:
                logger.info("[Supervisor] llm_fallback but session has docs → trying RAG")
                rag_context, rag_confidence, rag_sources = self._call_rag(query, session_id)
            else:
                logger.info("[Supervisor] No signals, no docs → pure LLM fallback")

        # Fix 4: structured sources dict with separate rag and web lists
        sources = {"rag": rag_sources, "web": web_sources}

        # ── synthesize ────────────────────────────────────────────────────
        synthesized = self.synthesis_agent.synthesize(
            query=query,
            rag_context=rag_context,
            web_context=web_context,
        )
        logger.info("[Supervisor] Synthesis complete.")

        # ── critic ────────────────────────────────────────────────────────
        critique = ""
        if rag_confidence >= CRITIC_SKIP_THRESHOLD and not web_context:
            critic_skipped = True
            logger.info("[Supervisor] Critic skipped (confidence %.2f ≥ threshold).", rag_confidence)
        else:
            critique = self.critic_agent.critic(
                query=query,
                synthesized_answer=synthesized,
                rag_context=rag_context,
                web_context=web_context,
            )
            logger.info("[Supervisor] Critique complete.")

        return {
            "route":              route,
            "rag_context":        rag_context,
            "web_context":        web_context,
            "synthesized_answer": synthesized,
            "critique":           critique,
            "rag_confidence":     rag_confidence,
            "critic_skipped":     critic_skipped,
            "sources":            sources,          # Fix 5
        }

    # ── private helpers ───────────────────────────────────────────────────────

    def _call_rag(
        self,
        query: str,
        session_id: Optional[str] = None,
    ) -> tuple[str, float, list[dict]]:
        """
        Invoke the RAG tool.

        Handles the RagGenerator result format:
            [{"id": ..., "content": ..., "similarity": ...}, ...]

        Returns
        -------
        (combined_context_text, highest_similarity_score, sources_list)
        """
        logger.info("[Supervisor] Calling RAG tool (session=%s) …", session_id)
        try:
            payload: dict = {"query": query}
            if session_id:
                payload["session_id"] = session_id

            result = rag_search.invoke(payload)

            # ── Case A: list of chunk dicts from RagGenerator (Fix 2) ────────
            if isinstance(result, list) and result:
                texts:   list[str]   = []
                scores:  list[float] = []
                sources: list[dict]  = []

                for i, chunk in enumerate(result):
                    if not isinstance(chunk, dict):
                        continue

                    content    = chunk.get("content", "") or ""
                    similarity = float(chunk.get("similarity", 0.0))
                    source_id  = chunk.get("id", f"chunk_{i}")

                    if content:
                        texts.append(content)
                    scores.append(similarity)

                    # Fix 5: collect source metadata
                    sources.append({
                        "id":         source_id,
                        "similarity": similarity,
                        "snippet":    content[:200].strip() if content else "",
                        # add "filename" or "page" here if your chunks carry them
                        **({"filename": chunk["filename"]} if "filename" in chunk else {}),
                        **({"page":     chunk["page"]}     if "page"     in chunk else {}),
                    })

                combined_text  = "\n\n---\n\n".join(texts)
                best_score     = _calculate_rag_confidence(scores)   # Fix 1: avg top-k
                return combined_text, best_score, sources

            # ── Case B: dict with "text" and "score" keys ─────────────────────
            if isinstance(result, dict):
                text    = result.get("text", "") or ""
                score   = float(result.get("score", 0.0))
                sources = [{"id": "result_0", "similarity": score, "snippet": text[:200]}]
                return text, score, sources

            # ── Case C: plain string (no score available) ─────────────────────
            if isinstance(result, str) and result:
                sources = [{"id": "result_0", "similarity": 0.0, "snippet": result[:200]}]
                return result, 0.0, sources

            return "", 0.0, []

        except Exception as e:
            logger.error("[Supervisor] RAG tool error: %s", e)
            return "", 0.0, []

    def _call_web(self, query: str) -> tuple[str, list[dict]]:
        """Invoke the web-search tool.

        Returns
        -------
        (web_context_text, web_sources)
        web_sources is a list with a single entry carrying a snippet (Fix 4).
        Returns ("", []) on failure.
        """
        logger.info("[Supervisor] Calling Web search tool …")
        try:
            result = web_search.invoke({"query": query})
            text = result or ""
            web_sources = (
                [{"source": "web_search", "snippet": text[:200].strip()}]
                if text else []
            )
            return text, web_sources
        except Exception as e:
            logger.error("[Supervisor] Web search error: %s", e)
            return "", []



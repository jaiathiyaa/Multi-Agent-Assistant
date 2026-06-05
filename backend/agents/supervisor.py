"""
supervisor.py

Keyword-based query classification supervisor.
Routes queries to: RAG only | Web only | Both | LLM fallback
"""

import re
from typing import Literal

# ── Tool imports ──────────────────────────────────────────────────────────────
from agents.rag_agent import rag_search
from agents.web_search_agent import web_search
# ── Agent imports ─────────────────────────────────────────────────────────────
from agents.synthesis import SynthesisAgent
from agents.critic_agent import CriticAgent


# ─────────────────────────────────────────────────────────────────────────────
# 1.  KEYWORD LISTS
# ─────────────────────────────────────────────────────────────────────────────

# Queries that should hit the local RAG (PDF) store
RAG_KEYWORDS: list[str] = [
    # document references
    "pdf", "document", "report", "manual", "file", "uploaded",
    "attachment", "paper", "chapter", "section", "page",
    # content verbs
    "summarize", "summary", "extract", "according to", "based on",
    "what does the document", "what does the report", "what does the file",
    # domain-specific (add your project terms here)
    "policy", "specification", "spec", "guideline", "procedure",
]

# Queries that should hit the live web search
WEB_KEYWORDS: list[str] = [
    # recency signals
    "latest", "recent", "news", "today", "current", "now",
    "2024", "2025", "2026", "this year", "this month", "this week",
    # live data
    "price", "stock", "weather", "score", "trending", "update",
    "announcement", "release", "launch", "new version",
    # research / comparison
    "compare", "difference between", "vs", "versus",
    "how does", "explain", "tutorial", "guide", "example",
    "best", "top", "review", "opinion",
]

# Strong "document-only" signals that suppress web search.
# These must appear as the *primary* intent, not just be present alongside web signals.
# Kept as exact phrases so incidental occurrences (e.g. "… in the document with recent news")
# are not treated as doc-only.
DOC_ONLY_KEYWORDS: list[str] = [
    "in the pdf only", "only from the document", "only from the pdf",
    "from the uploaded", "this document only", "this pdf only",
    "the uploaded document", "the uploaded pdf", "the uploaded report",
    "the uploaded file",
]

# Strong "web-only" signals that suppress RAG
WEB_ONLY_KEYWORDS: list[str] = [
    "search the web", "search online", "look it up", "find online",
    "google", "internet", "web search",
]


# ─────────────────────────────────────────────────────────────────────────────
# 2.  CLASSIFIER
# ─────────────────────────────────────────────────────────────────────────────

RouteType = Literal["rag_only", "web_only", "both", "llm_fallback"]


def _matches(text: str, keywords: list[str]) -> bool:
    """Return True if any keyword appears as a whole-word / phrase match."""
    lower = text.lower()
    for kw in keywords:
        # phrase match (allow word boundaries for single words)
        pattern = r"\b" + re.escape(kw) + r"\b" if " " not in kw else re.escape(kw)
        if re.search(pattern, lower):
            return True
    return False


def classify_query(query: str) -> RouteType:
    """
    Classify a query into one of four routing categories.

    Priority order (highest → lowest):
      1. doc_only  → rag_only
      2. web_only  → web_only
      3. rag + web → both
      4. rag only  → rag_only
      5. web only  → web_only
      6. nothing   → llm_fallback
    """
    has_rag  = _matches(query, RAG_KEYWORDS)
    has_web  = _matches(query, WEB_KEYWORDS)
    doc_only = _matches(query, DOC_ONLY_KEYWORDS)
    web_only = _matches(query, WEB_ONLY_KEYWORDS)

    if doc_only:
        return "rag_only"
    if web_only:
        return "web_only"
    if has_rag and has_web:
        return "both"
    if has_rag:
        return "rag_only"
    if has_web:
        return "web_only"
    return "llm_fallback"


# ─────────────────────────────────────────────────────────────────────────────
# 3.  SUPERVISOR
# ─────────────────────────────────────────────────────────────────────────────

class Supervisor:
    """
    Orchestrates tool calls and agent invocations based on query routing.

    Flow:
      classify → fetch context(s) → synthesize → critique → return
    """

    def __init__(self):
        self.synthesis_agent = SynthesisAgent()
        self.critic_agent    = CriticAgent()

    # ── public entry point ────────────────────────────────────────────────────

    def run(self, query: str) -> dict:
        """
        Process a query end-to-end.

        Returns a dict with keys:
          route, rag_context, web_context,
          synthesized_answer, critique
        """
        route = classify_query(query)
        print(f"[Supervisor] Route: {route!r}  |  Query: {query!r}")

        rag_context = ""
        web_context = ""

        # ── fetch context ──────────────────────────────────────────────────
        if route == "rag_only":
            rag_context = self._call_rag(query)

        elif route == "web_only":
            web_context = self._call_web(query)

        elif route == "both":
            rag_context = self._call_rag(query)
            web_context = self._call_web(query)

        else:  # llm_fallback – no external context; agents get empty strings
            print("[Supervisor] No keywords matched → LLM fallback (no tools called)")

        # ── synthesize ────────────────────────────────────────────────────
        synthesized = self.synthesis_agent.synthesize(
            query=query,
            rag_context=rag_context,
            web_context=web_context,
        )
        print("[Supervisor] Synthesis complete.")

        # ── critique ──────────────────────────────────────────────────────
        critique = self.critic_agent.critic(
            query=query,
            synthesized_answer=synthesized,
            rag_context=rag_context,
            web_context=web_context,
        )
        print("[Supervisor] Critique complete.")

        return {
            "route":              route,
            "rag_context":        rag_context,
            "web_context":        web_context,
            "synthesized_answer": synthesized,
            "critique":           critique,
        }

    # ── private helpers ───────────────────────────────────────────────────────

    def _call_rag(self, query: str) -> str:
        print("[Supervisor] Calling RAG tool …")
        try:
            result = rag_search.invoke({"query": query})
            return result or "No relevant PDF content found."
        except Exception as e:
            print(f"[Supervisor] RAG tool error: {e}")
            return f"RAG search failed: {e}"

    def _call_web(self, query: str) -> str:
        print("[Supervisor] Calling Web search tool …")
        try:
            result = web_search.invoke({"query": query})
            return result or "No web results found."
        except Exception as e:
            print(f"[Supervisor] Web search error: {e}")
            return f"Web search failed: {e}"


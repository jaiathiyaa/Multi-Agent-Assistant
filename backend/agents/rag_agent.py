from langchain.tools import tool
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from services.pdf_loader import RagGenerator

_rag_instance = None

def get_rag_instance():
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RagGenerator()
    return _rag_instance

@tool("rag_search_tool", description="Search the indexed PDF documents and answer questions using information from those documents. Use this tool when the user asks about uploaded PDFs, reports, manuals, or document contents.")
def rag_search(query: str) -> str:
   """
    Search the indexed PDF documents and answer questions
    using information from those documents.
    Use this tool when the user asks about uploaded PDFs,
    reports, manuals, or document contents.
    """
   return get_rag_instance().generate_answer(query)

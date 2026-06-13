from langchain.tools import tool
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from services.rag_service import get_rag_instance


@tool("rag_search_tool", description="Search the indexed PDF documents and answer questions using information from those documents. Use this tool when the user asks about uploaded PDFs, reports, manuals, or document contents.")
def rag_search(query: str,session_id) -> str:
   """
    Search the indexed PDF documents and answer questions
    using information from those documents.
    Use this tool when the user asks about uploaded PDFs,
    reports, manuals, or document contents.
    """
   return get_rag_instance().retrieve(query,session_id)

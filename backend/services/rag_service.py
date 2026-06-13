from services.pdf_loader import RagGenerator

_rag_instance = None

def get_rag_instance():
    global _rag_instance

    if _rag_instance is None:
        print("Loading RAG instance...")
        _rag_instance = RagGenerator()

    return _rag_instance
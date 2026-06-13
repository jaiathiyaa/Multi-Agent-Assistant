import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_groq import ChatGroq
import chromadb
import uuid
from pathlib import Path

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

BASE_DIR = Path(__file__).resolve().parent.parent
VECTOR_STORE_PATH = BASE_DIR / "db" / "vector_store"


class RagGenerator:

    def __init__(self):
        self.llm = ChatGroq(api_key=groq_api_key, model="llama-3.1-8b-instant", temperature=0.1, max_tokens=1024)
        print("RagGenerator CREATED")
        # Step 1: Load embedding model (always needed for querying)
        print("Loading embedding model: all-MiniLM-L6-v2...")
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded successfully.")

        # Step 2: Connect to vector store
        self.client = chromadb.PersistentClient(path=str(VECTOR_STORE_PATH))
        print(f"Vector store initialized at {VECTOR_STORE_PATH}.")

    def ingest_document(
            self,
            file_path: str,
            session_id: str,
            document_id: str,
            filename: str
    ):
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        collection = self.client.get_or_create_collection(
            name=session_id,
            metadata={"hnsw:space": "cosine"}
        )

        existing = collection.get(
            where={"document_id": document_id},
            limit=1
        )

        if existing["ids"]:
            print(f"Document {filename} already indexed. Skipping ingestion.")
            return 0
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100
        )
        chunks = splitter.split_documents(docs)
        texts = [chunk.page_content for chunk in chunks]
        embeddings = self.embedding_model.encode(texts)
        collection.add(
            ids=[str(uuid.uuid4()) for _ in chunks],
            documents=texts,
            embeddings=[
                emb.tolist()
                for emb in embeddings
            ],
            metadatas=[{
                    "document_id": document_id,
                    "filename": filename
                } for _ in chunks]
            )
        return len(chunks)

    def retrieve(self, query, session_id:str,top_k=5):
        collection = self.client.get_collection(
            name=session_id,
        )
        results = collection.query(
            query_embeddings=[
                self.embedding_model.encode(query).tolist()
            ],
            n_results=top_k
        )
        retrieved = []
        if results['documents'] and results['documents'][0]:
            for doc_id, content, metadata, distance in zip(
                results['ids'][0],
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            ):
                retrieved.append({
                    'id': doc_id,
                    'content': content,
                    'metadata': metadata,
                    'similarity': 1 - distance
                })

        return retrieved

    def generate_answer(self, query, session_id,top_k=5):
        retrieved_docs = self.retrieve(query, session_id,top_k)
        if not retrieved_docs:
            return "I couldn't find any relevant information in the documents."

        context = "\n\n".join(
            [f"Document {i+1}:\n{doc['content']}" for i, doc in enumerate(retrieved_docs)]
        )
        messages = [
            SystemMessage(content="You are a helpful assistant. Answer only using the provided context. If the answer isn't in the context, say so."),
            HumanMessage(content=f"Context:\n{context}\n\nQuestion: {query}")
        ]
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            print(f"Error generating answer: {e}")
            return "Error generating answer."

    def delete_document_chunks(
            self,
            session_id,
            document_id
    ):
        collection = self.client.get_collection(
            name=session_id
        )

        collection.delete(
            where={
                "document_id": document_id
            }
        )
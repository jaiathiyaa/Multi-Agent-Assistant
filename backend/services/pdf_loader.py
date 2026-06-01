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
        
        # Step 1: Load embedding model (always needed for querying)
        print("Loading embedding model: all-MiniLM-L6-v2...")
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded successfully.")

        # Step 2: Connect to vector store
        self.client = chromadb.PersistentClient(path=str(VECTOR_STORE_PATH))
        self.collection = self.client.get_or_create_collection(name="pdf_documents")
        print(f"Vector store initialized at {VECTOR_STORE_PATH}.")

        # Step 3: Only load + embed PDFs if collection is empty
        if self.collection.count() == 0:
            print("Vector store empty — loading and embedding PDFs...")
            chunks = self._load_and_split()
            self._embed_and_store(chunks)
        else:
            print("Vector store already populated, skipping.")

    def _load_and_split(self):
        pdf_dir = Path(__file__).parent / "pdf"
        all_docs = []
        for pdf_file in pdf_dir.glob("*.pdf"):
            print(f"Processing {pdf_file}...")
            try:
                loader = PyPDFLoader(str(pdf_file))
                docs = loader.load()
                for doc in docs:
                    doc.metadata['source_file'] = pdf_file.name
                all_docs.extend(docs)
            except Exception as e:
                print(f"Error processing {pdf_file}: {e}")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_documents(all_docs)
        print(f"Split {len(all_docs)} pages into {len(chunks)} chunks.")
        return chunks

    def _embed_and_store(self, chunks):
        texts = [chunk.page_content for chunk in chunks]
        embeddings = self.embedding_model.encode(texts)

        ids, metadatas, documents, embeddings_list = [], [], [], []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            ids.append(str(uuid.uuid4()))
            meta = dict(chunk.metadata)
            meta['doc_index'] = i
            metadatas.append(meta)
            documents.append(chunk.page_content)
            embeddings_list.append(emb.tolist())

        self.collection.add(
            ids=ids,
            embeddings=embeddings_list,
            metadatas=metadatas,
            documents=documents
        )
        print(f"Added {len(chunks)} chunks to vector store.")

    def retrieve(self, query, top_k=5):
        query_embedding = self.embedding_model.encode(query).tolist()
        results = self.collection.query(
            query_embeddings=[query_embedding],
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

    def generate_answer(self, query, top_k=5):
        retrieved_docs = self.retrieve(query, top_k)
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
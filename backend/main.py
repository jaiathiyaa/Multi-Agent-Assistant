from contextlib import asynccontextmanager
from pathlib import Path
from typing import List
from uuid import UUID
import shutil

from starlette.middleware.cors import CORSMiddleware

from agents.supervisor import Supervisor
from services.pdf_loader import RagGenerator, VECTOR_STORE_PATH
from auth.auth import verify_token, create_access_token
import uvicorn
from datetime import datetime, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from models.database import engine, create_db_and_tables
from sqlmodel import Session, select
from models.model import User, UserRead, UserCreate, UserLogin, SessionRead, SessionCreate, DBSession, DocumentRead, \
    Document, Query, QueryCreate, QueryResponse
# from services.rag_singleton import rag_instance as rag
from services.rag_service import get_rag_instance
import sqlite3

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    create_db_and_tables()
    yield
    print("Shutting Down...")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)
supervisor = Supervisor()



def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_segment_dir(session_id: str):

    db_file = VECTOR_STORE_PATH / "chroma.sqlite3"

    with sqlite3.connect(db_file) as conn:

        cursor = conn.cursor()

        cursor.execute("""
            SELECT s.id
            FROM collections c
            JOIN segments s
                ON c.id = s.collection
            WHERE c.name = ?
            AND s.type = 'urn:chroma:segment/vector/hnsw-local-persisted'
        """, (session_id,))

        row = cursor.fetchone()

    if row:
        return VECTOR_STORE_PATH / row[0]

    return None

# User SignUp
@app.post("/signup",response_model=UserRead,status_code=201)
def create_user(user:UserCreate):
    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.email == user.email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            password_hash=hashed_password
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

# Login User
@app.post("/login")
def login_user(user: UserLogin):
    with Session(engine) as session:
        db_user = session.exec(select(User).where(User.email == user.email)).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Sign UP")
        password = verify_password(user.password, db_user.password_hash)
        if not password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token = create_access_token(
            {
                "sub":db_user.email,
                "user_id":str(db_user.id),
                "username":db_user.username,
            }
        )
        return {"access_token":access_token, "token_type":"bearer"}

security = HTTPBearer()

@app.post("/sessions",response_model=SessionRead)
def create_session(session_data : SessionCreate,credentials : HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    with Session(engine) as db:
        session_obj = DBSession(
            user_id=payload["user_id"],
            title= session_data.title
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)
        return session_obj



@app.get("/sessions",response_model=List[SessionRead])
def get_sessions(credentials : HTTPAuthorizationCredentials = Depends(security)):
    payload=verify_token(credentials.credentials)
    with Session(engine) as db:
        sessions = db.exec(select(DBSession).where(DBSession.user_id == payload["user_id"])).all()
        return sessions

@app.get("/sessions/{session_id}",response_model=SessionRead)
def get_session(session_id: UUID , credentials : HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    with Session(engine) as db:
        session_obj = db.exec(select(DBSession).where(DBSession.user_id == payload["user_id"] , DBSession.id == session_id)).first()
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_obj



@app.delete("/sessions/{session_id}")
def delete_session(
    session_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:

        session_obj = db.exec(
            select(DBSession).where(
                DBSession.user_id == payload["user_id"],
                DBSession.id == session_id
            )
        ).first()

        if not session_obj:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )

        documents = db.exec(
            select(Document).where(
                Document.session_id == session_id
            )
        ).all()

        segment_dir = get_segment_dir(
            str(session_id)
        )

        try:
            get_rag_instance().client.delete_collection(
                name=str(session_id)
            )
        except Exception as e:
            print(f"Collection deletion error: {e}")

        if segment_dir and segment_dir.exists():
            try:
                shutil.rmtree(segment_dir)
                print(f"Deleted segment dir: {segment_dir}")
            except Exception as e:
                print(f"Segment deletion error: {e}")

        for doc in documents:

            try:
                file_path = Path(doc.file_path)

                if file_path.exists():
                    file_path.unlink()

            except Exception as e:
                print(f"File deletion error: {e}")

            db.delete(doc)

        db.delete(session_obj)

        db.commit()

        return {
            "message": "Session deleted successfully"
        }

@app.post("/documents/uploads",response_model=DocumentRead)
async def create_document(session_id:UUID,file : UploadFile = File(...),credentials : HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    with Session(engine) as db:
        session_obj = db.exec(
            select(DBSession).where(
                DBSession.id == session_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not session_obj:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        file_path = UPLOAD_DIR / file.filename

        with open(file_path,"wb") as f:
            f.write(await file.read())

        doc = Document(
            session_id=session_id,
            filename=str(file.filename),
            file_path=str(file_path)
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)

        chunk_count = get_rag_instance().ingest_document(
            file_path=str(file_path),
            session_id=str(session_id),
            document_id=str(doc.id),
            filename=str(file.filename)
        )

        doc.chunk_count = chunk_count

        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc



@app.get("/sessions/{session_id}/documents",response_model=List[DocumentRead])
def get_documents(session_id : UUID ,credentials : HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    with Session(engine) as db:
        session_obj = db.exec(
            select(DBSession).where(
                DBSession.id == session_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not session_obj:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        doc = db.exec(select(Document).where(Document.session_id == session_id)).all()
        return doc

from pathlib import Path

@app.delete("/documents/{document_id}")
def delete_document(
    document_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:

        doc = db.exec(
            select(Document)
            .join(DBSession)
            .where(
                Document.id == document_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document Not Found"
            )

        session_id = str(doc.session_id)

        segment_dir = get_segment_dir(
            session_id
        )

        get_rag_instance().delete_document_chunks(
            session_id,
            str(doc.id)
        )

        try:
            file_path = Path(doc.file_path)

            if file_path.exists():
                file_path.unlink()

        except Exception as e:
            print(f"File deletion error: {e}")

        try:
            collection = get_rag_instance().client.get_collection(
                name=session_id
            )

            if collection.count() == 0:

                get_rag_instance().client.delete_collection(
                    name=session_id
                )

                if segment_dir and segment_dir.exists():
                    shutil.rmtree(segment_dir)

        except Exception:
            # Collection may already be deleted
            pass

        db.delete(doc)
        db.commit()

        return {
            "message": "Document deleted successfully"
        }

@app.post("/query", response_model=QueryResponse)
def ask_question(
    query_data: QueryCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:

        session_obj = db.exec(
            select(DBSession).where(
                DBSession.id == query_data.session_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not session_obj:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )

        docs = db.exec(
            select(Document).where(
                Document.session_id == query_data.session_id
            )
        ).all()

        result = supervisor.run(
            query=query_data.question,
            session_id=str(query_data.session_id),
            has_documents=len(docs) > 0,
            doc_count=len(docs)
        )

        final_answer = result["synthesized_answer"]

        if result["critique"]:
            final_answer += "\n\n" + result["critique"]

        query_record = Query(
            session_id=query_data.session_id,
            question=query_data.question,

            route=result["route"],
            rag_confidence=result["rag_confidence"],

            rag_context=result["rag_context"],
            web_context=result["web_context"],

            synthesized_answer=result["synthesized_answer"],
            critique=result["critique"],

            final_answer=final_answer,
            sources_used=result["sources"]
        )

        db.add(query_record)
        db.commit()
        db.refresh(query_record)

        return query_record

@app.get("/profile")
def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = verify_token(
            credentials.credentials
        )

        return {
            "email": payload["sub"],
            "user_id": payload["user_id"],
            "username": payload["username"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )



# ─────────────────────────────────────────────
# 1. Document Embedding Status
# ─────────────────────────────────────────────
@app.get("/documents/{document_id}/status")
def get_document_status(
    document_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:
        doc = db.exec(
            select(Document)
            .join(DBSession)
            .where(
                Document.id == document_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Check actual chunk count in ChromaDB
        try:
            collection = get_rag_instance().client.get_collection(
                name=str(doc.session_id)
            )
            result = collection.get(
                where={"document_id": str(document_id)}
            )
            indexed_chunks = len(result["ids"])
            is_indexed = indexed_chunks > 0
        except Exception:
            indexed_chunks = 0
            is_indexed = False

        return {
            "document_id": str(document_id),
            "filename": doc.filename,
            "status": "indexed" if is_indexed else "not_indexed",
            "chunk_count_db": doc.chunk_count,       # what was saved to DB at upload time
            "chunk_count_vector": indexed_chunks,     # live count from ChromaDB
            "is_indexed": is_indexed
        }


# ─────────────────────────────────────────────
# 2. Session Query History
# ─────────────────────────────────────────────
@app.get("/sessions/{session_id}/queries")
def get_session_queries(
    session_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:
        # Ownership check
        session_obj = db.exec(
            select(DBSession).where(
                DBSession.id == session_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")

        queries = db.exec(
            select(Query).where(Query.session_id == session_id)
        ).all()

        return queries   # serialises via QueryResponse model automatically


# ─────────────────────────────────────────────
# 3. Query Routing Trace (Supervisor Debug)
# ─────────────────────────────────────────────
@app.get("/queries/{query_id}/trace")
def get_query_trace(
    query_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:
        query_record = db.exec(
            select(Query)
            .join(DBSession)
            .where(
                Query.id == query_id,
                DBSession.user_id == payload["user_id"]
            )
        ).first()

        if not query_record:
            raise HTTPException(status_code=404, detail="Query not found")

        return {
            "query_id":      str(query_id),
            "question":      query_record.question,
            "route":         query_record.route,          # "rag" | "web" | "llm"
            "rag_confidence": query_record.rag_confidence,
            "sources_used":  query_record.sources_used,
            "agents_fired": {
                "rag_agent":  query_record.rag_context is not None,
                "web_agent":  query_record.web_context is not None,
                "critic":     query_record.critique is not None,
            },
            "context_lengths": {
                "rag_context_chars": len(query_record.rag_context or ""),
                "web_context_chars": len(query_record.web_context or ""),
            },
            "final_answer_preview": (query_record.final_answer or "")[:200]
        }


# ─────────────────────────────────────────────
# 4a. GET /users/me  — current user profile
# ─────────────────────────────────────────────
@app.get("/users/me", response_model=UserRead)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)

    with Session(engine) as db:
        user = db.exec(
            select(User).where(User.id == payload["user_id"])
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user


# ─────────────────────────────────────────────
# 4b. POST /auth/refresh  — issue a new JWT
# ─────────────────────────────────────────────
@app.post("/auth/refresh")
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # verify_token will raise 401 automatically if token is invalid/expired
    payload = verify_token(credentials.credentials)

    new_token = create_access_token({
        "sub":      payload["sub"],
        "user_id":  payload["user_id"],
        "username": payload["username"],
    })

    return {"access_token": new_token, "token_type": "bearer"}


# ─────────────────────────────────────────────
# 5. Health Check
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    checks = {}

    # SQLite
    try:
        with Session(engine) as db:
            db.exec(select(User).limit(1))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # ChromaDB
    try:
        collections = get_rag_instance().client.list_collections()
        checks["vector_store"] = f"ok ({len(collections)} collections)"
    except Exception as e:
        checks["vector_store"] = f"error: {e}"

    # Embedding model
    try:
        get_rag_instance().embedding_model.encode("ping")
        checks["embedding_model"] = "ok"
    except Exception as e:
        checks["embedding_model"] = f"error: {e}"

    overall = "healthy" if all("ok" in v for v in checks.values()) else "degraded"

    return {
        "status":    overall,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks":    checks
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
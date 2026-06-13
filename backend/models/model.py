from decimal import Decimal
from uuid import uuid4 , UUID
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import Text, Column, Numeric
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlmodel import Relationship
from sqlmodel import SQLModel , Field

class User(SQLModel,table=True):
    __tablename__ = "users"
    id : UUID = Field(default_factory=uuid4,primary_key=True)
    username : str = Field(index=True,max_length=50)
    password_hash : str
    email : str = Field(unique=True,index=True,max_length=255)
    sessions : list["DBSession"] = Relationship(back_populates="user")

class UserCreate(SQLModel):
    username : str
    password : str
    email : EmailStr

class UserRead(SQLModel):
    id : UUID
    username : str
    email : EmailStr

class UserLogin(SQLModel):
    email : EmailStr
    password : str

class DBSession(SQLModel,table=True):
    __tablename__ = "sessions"
    id : UUID = Field(default_factory=uuid4, primary_key=True)
    user_id : UUID = Field(foreign_key="users.id",index=True)
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc),index=True)
    title : str = Field(index=True,max_length=255,default="New Session")
    documents: list["Document"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )
    queries: list["Query"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )
    user : User = Relationship(back_populates="sessions")

class Document(SQLModel,table=True):
    __tablename__ = "documents"
    id : UUID = Field(default_factory=uuid4,primary_key=True)
    session_id : UUID = Field(foreign_key="sessions.id",index=True)
    filename : str = Field(max_length=255)
    file_path : str = Field(max_length=500)
    chunk_count: int = Field(default=0)
    uploaded_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc),index=True)
    session: DBSession = Relationship(
        back_populates="documents"
    )

class Query(SQLModel, table=True):
    __tablename__ = "queries"
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True
    )
    session_id: UUID = Field(
        foreign_key="sessions.id",
        index=True
    )
    question: str = Field(
        sa_column=Column(Text, nullable=False)
    )
    route: str = Field(
        max_length=50
    )
    rag_confidence: float = Field(
        default=0.0
    )
    rag_context: str | None = Field(
        default=None,
        sa_column=Column(Text)
    )
    web_context: str | None = Field(
        default=None,
        sa_column=Column(Text)
    )
    synthesized_answer: str = Field(
        default="",
        sa_column=Column(Text)
    )

    critique: str = Field(
        default="",
        sa_column=Column(Text)
    )

    final_answer: str = Field(
        default="",
        sa_column=Column(Text)
    )
    sources_used: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True
    )
    session: "DBSession" = Relationship(
        back_populates="queries"
    )
class SessionCreate(SQLModel):
    title : str = Field(default="New Session")


class QueryCreate(SQLModel):
    session_id : UUID
    question : str

class QueryResponse(SQLModel):
    id: UUID
    question: str
    route: str
    rag_confidence: float
    final_answer: str
    critique: str
    synthesized_answer : str
    sources_used: dict
    created_at: datetime

class SessionRead(SQLModel):
    id: UUID
    title: str
    created_at: datetime

class DocumentRead(SQLModel):
    id: UUID
    filename: str
    chunk_count: int
    uploaded_at: datetime


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
    documents : list["Document"] = Relationship(back_populates="session")
    queries : list["Query"] = Relationship(back_populates="session")
    user : User = Relationship(back_populates="sessions")

class Document(SQLModel,table=True):
    __tablename__ = "documents"
    id : UUID = Field(default_factory=uuid4,primary_key=True)
    session_id : UUID = Field(foreign_key="sessions.id",index=True)
    filename : str = Field(max_length=255)
    chunk_count : int
    uploaded_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc),index=True)
    collection_name : str = Field(max_length=255)
    session: DBSession = Relationship(
        back_populates="documents"
    )

class Query(SQLModel,table=True):
    __tablename__ = "queries"
    id : UUID = Field(default_factory=uuid4,primary_key=True)
    session_id : UUID = Field(foreign_key="sessions.id",index=True)
    question : str = Field(sa_column=Column(Text,nullable=False))
    final_answer : str = Field(sa_column=Column(Text,nullable=False))
    confidence_score : Decimal = Field(sa_column=Column(Numeric(5,2),nullable=False))
    unsupported_claims : list[str] = Field(default_factory=list,sa_column=Column(ARRAY(Text),nullable=False))
    sources_used : dict = Field(default_factory=dict,sa_column=Column(JSONB,nullable=False))
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc),index=True)
    session : DBSession = Relationship(back_populates="queries")

class SessionCreate(SQLModel):
    title : str = Field(default="New Session")

class DocumentCreate(SQLModel):
    session_id : UUID
    filename : str
    collection_name : str

class QueryCreate(SQLModel):
    session_id : UUID
    question : str

class QueryResponse(SQLModel):
    id : UUID
    question : str
    final_answer : str
    confidence_score : Decimal
    unsupported_claims : list[str]
    sources_used : dict
    created_at : datetime

class SessionRead(SQLModel):
    id: UUID
    title: str
    created_at: datetime

class DocumentRead(SQLModel):
    id: UUID
    filename: str
    chunk_count: int
    uploaded_at: datetime


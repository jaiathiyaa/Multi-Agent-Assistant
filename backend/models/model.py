from pydantic import EmailStr
from sqlmodel import SQLModel , Field

class User(SQLModel,table=True):
    __tablename__ = "users"
    id : int | None = Field(default=None,primary_key=True)
    username : str = Field(index=True)
    password_hash : str
    email : EmailStr = Field(unique=True)

class UserCreate(SQLModel):
    username : str
    password : str
    email : EmailStr

class UserRead(SQLModel):
    id : int
    username : str
    email : EmailStr

class UserLogin(SQLModel):
    email : EmailStr
    password : str


from contextlib import asynccontextmanager
from auth.auth import verify_token, create_access_token
import jwt
import uvicorn
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends
from models.database import engine, create_db_and_tables
from sqlmodel import Session, select
from models.model import User, UserRead, UserCreate, UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    create_db_and_tables()
    yield
    print("Shutting Down...")

app = FastAPI(lifespan=lifespan)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


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
                "user_id":db_user.id,
                "username":db_user.username,
            }
        )
        return {"access_token":access_token, "token_type":"bearer"}



security = HTTPBearer()

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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
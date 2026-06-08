import os

import jwt
from datetime import datetime, timedelta , timezone
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

ACCESS_TOKEN_SECRET = 30
alg = os.getenv("ALGORITHM")
secret = os.getenv("SUPER_KEY")

def create_access_token(data: dict):
    payload = data.copy()
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_SECRET)
    payload["exp"] = exp
    token = jwt.encode(payload,secret,algorithm=alg)
    return token

def verify_token(token: str):
    try:
        payload = jwt.decode(token,secret,algorithms=[alg])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
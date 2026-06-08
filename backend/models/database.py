from sqlmodel import SQLModel , Session , create_engine
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

if db_url is None:
    raise ValueError("DATABASE_URL is not set")
engine = create_engine(db_url,echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)




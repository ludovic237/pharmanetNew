from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/pharmanet1?charset=utf8mb4"
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/pharmanet1?charset=utf8mb4"

try:
  engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,
  )
  SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
  Base = declarative_base()
  print("Connection to the database was successful!")
except Exception as e:
  print(f"Error connecting to the database: {e}")

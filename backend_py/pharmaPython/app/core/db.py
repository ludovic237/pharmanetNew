# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
#
# DATABASE_URL = "postgresql+psycopg2://user:pwd@localhost:5432/mydb"  # ou sqlite:///dev.db
#
# engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True)
# SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
# Base = declarative_base()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Format MySQL via PyMySQL :
# mysql+pymysql://<user>:<password>@<host>:<port>/<database>?charset=utf8mb4
DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/pharmanet1?charset=utf8mb4"

engine = create_engine(
  DATABASE_URL,
  future=True,
  pool_pre_ping=True,       # évite les connexions mortes
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

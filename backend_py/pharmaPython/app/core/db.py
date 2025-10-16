import json
import os.path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/pharmanet1?charset=utf8mb4"
# DATABASE_URL = "mysql+pymysql://root:@localhost:3306/pharmanet1?charset=utf8mb4"

# def get_db_config():
#   config_path = os.path.join(os.path.dirname(__file__), "config", "config.json")
#   with open(config_path, "r") as f:
#     return json.load(f)
#
#
# def get_engine():
#   cfg = get_db_config()
#   if cfg["db_type"] == "sqlite":
#     return create_engine(f"sqlite:///{cfg['db_name']}.db", echo=True)
#   elif cfg["db_type"] == "postgresql":
#     return create_engine(f"postgresql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}")
#   elif cfg["db_type"] == "mysql":
#     return create_engine(f"mysql+pymysql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}")
#   else:
#     raise Exception("Type de base de donnees non supporte")

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

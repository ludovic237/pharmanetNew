import json
import os.path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/pharmanet1?charset=utf8mb4"


# DATABASE_URL = "mysql+pymysql://root:@localhost:3306/pharmanet1?charset=utf8mb4"

def get_db_config():
  config_path = os.path.join(os.path.dirname(__file__), "conf", "config.json")
  with open(config_path, "r") as f:
    return json.load(f)


def get_engine():
  cfg = get_db_config()
  if cfg["db_type"] == "sqlite":
    return create_engine(f"sqlite:///{cfg['db_name']}.db", echo=True)
  elif cfg["db_type"] == "postgresql":
    return create_engine(
      f"postgresql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}")
  elif cfg["db_type"] == "mysql":
    return create_engine(
      f"mysql+pymysql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}?charset=utf8mb4")
  else:
    raise Exception("Type de base de donnees non supporte")


try:
  # engine = create_engine(
  #   DATABASE_URL,
  #   future=True,
  #   pool_pre_ping=True,
  # )
  engine = get_engine()
  SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
  Base = declarative_base()
  print("Connection to the database was successful!")
except Exception as e:
  print(f"Error connecting to the database: {e}")


def init_db():
  global engine
  try:
    engine = get_engine()
    print("Base de donnee configuree")
  except Exception as e:
    print("impossible de configurer la base de donnee")


def test_db_connection():
  # global engine
  engine = get_engine()
  if not engine:
    return {"status": "error", "message": "Aucune configuration de la base de donnee"}
  try:
    with engine.connect() as conn:
      conn.execute(text("SELECT 1"))
    return {"status": "ok", "message": "Connexion DB reussie"}
  except Exception as e:
    return {"status": "error", "message": str(e)}

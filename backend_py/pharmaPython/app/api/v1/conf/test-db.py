import json
import os.path

from sqlalchemy import create_engine


def get_db_config():
    config_path = os.path.join(os.path.dirname(__file__), "conf", "config.json")
    with open(config_path, "r") as f:
        return json.load(f)


def get_engine():
    cfg = get_db_config()
    if cfg["db_type"] == "sqlite":
        return create_engine(f"sqlite:///{cfg['db_name']}.db")
    elif cfg["db_type"] == "postgresql":
        return create_engine(f"postgresql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}")
    elif cfg["db_type"] == "mysql":
        return create_engine(f"mysql+pymysql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}")
    else:
        raise Exception("Type de base de donnees non supporte")


engine = get_engine()

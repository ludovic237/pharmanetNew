import json
import os.path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.db import engine, test_db_connection

router = APIRouter(prefix="/config", tags=["CONFIG"])

config_path = os.path.join(os.path.dirname(__file__), "conf", "config.json")


@router.get("/test")
def read_root():
  return {"message": "Backend operationnel !"}


@router.post("/save")
async def save_config(request: Request):
  print("save_config")
  print(request)
  data = await request.json()
  print("data")
  print(data)
  with open(config_path, "w") as f:
    json.dump(data, f, indent=4)
  return {"status": "ok", "message": "Configuration enregistree"}


@router.get("/data")
def get_config():
  with open(config_path, "r", encoding="utf-8") as f:
    data = json.load(f)
  return JSONResponse(content=data)

@router.get("/ping_db")
def ping_db():
  result = test_db_connection()
  return result


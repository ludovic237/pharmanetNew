import json
import os.path

from fastapi import APIRouter, Request, Depends, HTTPException, Query

router = APIRouter(prefix="/config", tags=["CONFIG"])

config_path = os.path.join(os.path.dirname(__file__), "config", "config.json")

@router.get("/test")
def read_root():
  return {"message":"Backend operationnel !"}

@router.post("/save")
async def save_config(request: Request):
  data = await request.json()
  with open(config_path, "w") as f:
    json.dump(data, f, indent=4)
  return {"status": "ok","message":"Configuration enregistree"}

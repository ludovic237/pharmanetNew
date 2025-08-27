from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.db import SessionLocal
from app.services.product_service import ProductService

def get_db() -> Session:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

def get_product_service() -> ProductService:
  # On instancie le service sans exposer son __init__ à FastAPI
  return ProductService()

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_product_service
from app.core.pagination import Page, PageParams
from app.schemas.product import ProductIn, ProductOut
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=Page)
def list_products(
  page: int = 0, size: int = 20, q: str | None = Query(None),
  db: Session = Depends(get_db),
  svc: ProductService = Depends(get_product_service),
):
  return svc.list(db, PageParams(page=page, size=size), q)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(
  product_id: int,
  db: Session = Depends(get_db),
  svc: ProductService = Depends(get_product_service),
):
  return svc.get(db, product_id)

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
  data: ProductIn,
  db: Session = Depends(get_db),
  svc: ProductService = Depends(get_product_service),
):
  return svc.create(db, data)

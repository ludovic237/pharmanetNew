# app/api/v1/insight_controller.py
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.insight_service import kpis, sales_by_category, weekly_seasonality, basket_pairs, sales_monthly
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/insights",
  tags=["insights"],
  # dependencies=[Depends(jwt_authentication)],
)


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), days: int = 30):
  return kpis(db, days)


@router.get("/sales-by-category")
def get_sales_by_category(db: Session = Depends(get_db), days: int = 600):
  return sales_by_category(db, days)


@router.get("/weekly-seasonality")
def get_weekly_seasonality(db: Session = Depends(get_db), weeks: int = 30):
  return weekly_seasonality(db, weeks)


@router.get("/sales_monthly")
def get_sales_monthly(db: Session = Depends(get_db), since: date = (date.today() - timedelta(days=260)),
                      until: date = date.today()):
  return sales_monthly(db, since, until)


@router.get("/basket-pairs")
def get_basket_pairs(db: Session = Depends(get_db), days: int = 30, min_support: int = 10):
  return basket_pairs(db, days, min_support)

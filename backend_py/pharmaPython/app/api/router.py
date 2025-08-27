from fastapi import APIRouter
from app.api.v1 import product_controller

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(product_controller.router)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, Dict, List
from app.api.deps import get_db
from app.models.app_setting import AppSettingSchema
from app.services.app_setting_service import AppSettingService

router = APIRouter(
  prefix="/api/admin/setting",
  # tags=["AppSetting"]
)


@router.get("/{key}", response_model=Dict[str, Any])
def get_param(key: str, db: Session = Depends(get_db)):
  service = AppSettingService(db)
  data = service.get_param(key)
  if data is None:
    raise HTTPException(status_code=404, detail=f"Paramètre '{key}' introuvable")
  return {"key": data}


@router.post("/{key}", response_model=AppSettingSchema)
def set_param(key: str, value: str, db: Session = Depends(get_db)):
  service = AppSettingService(db)
  return service.update_param(key, value)


@router.get("/", response_model=List[AppSettingSchema])
def get_all(db: Session = Depends(get_db)):
  service = AppSettingService(db)
  return service.get_all()

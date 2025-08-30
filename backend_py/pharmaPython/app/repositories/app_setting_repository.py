# repositories/app_setting_repository.py
from typing import Optional, List, Type
from sqlalchemy.orm import Session

from app.models.app_setting import AppSetting


class AppSettingRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> list[Type[AppSetting]]:
    return self.db.query(AppSetting).all()

  def find_by_key_name(self, key: str) -> Optional[AppSetting]:
    return self.db.query(AppSetting).filter(AppSetting.keyName == key).first()

  # helpers CRUD
  def find_by_id(self, id_: int) -> Optional[AppSetting]:
    return self.db.query(AppSetting).get(id_)
  def save(self, entity: AppSetting) -> AppSetting:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: AppSetting) -> None:
    self.db.delete(entity); self.db.commit()

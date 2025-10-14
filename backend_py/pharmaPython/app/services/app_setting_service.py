# services/app_setting_service.py
from __future__ import annotations
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.app_setting import AppSetting
from app.repositories.app_setting_repository import AppSettingRepository


class AppSettingService:

  def __init__(self, db: Session):
    self.app_setting_repo = AppSettingRepository(db)

  # getParam(key:String): String?
  def get_param(self, key: str) -> Optional[str]:
    setting = self.app_setting_repo.find_by_key_name(key)
    return setting.value if setting else None

  # getBoolean(key:String): Boolean
  def get_boolean(self, key: str) -> bool:
    setting = self.app_setting_repo.find_by_key_name(key)
    raw = (setting.value if setting else "") or ""
    return raw.strip().lower() in {"true", "1", "yes", "y", "on"}

  # updateParam(key:String, value:String): AppSetting
  def update_param(self, key: str, value: str):
    setting = self.app_setting_repo.find_by_key_name(key)
    if setting is None:
      # modèle minimal attendu par le repo (ex. SQLAlchemy)
      setting = AppSetting()  # ex.: AppSetting()
      setting.keyName = key
    setting.value = value
    return self.app_setting_repo.save(setting)

  # getAll(): List<AppSetting>
  def get_all(self) -> list[dict[str, Any]]:
    datas = self.app_setting_repo.find_all()
    mapped: List[Dict[str, Any]] = []
    for d in datas:
      mapped.append({
        "id": getattr(d, "id", None),
        "keyName": getattr(d, "key_name", None),
        "value": getattr(d, "value", None),
        "type": getattr(d, "type", None),
      })
    return mapped

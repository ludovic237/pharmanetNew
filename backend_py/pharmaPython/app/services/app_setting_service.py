from sqlalchemy.orm import Session
from models import AppSetting
from repositories.app_setting_repository import find_by_key_name, save, find_all

class AppSettingService:
  def __init__(self, db: Session):
    self.db = db

  def get_param(self, key: str) -> str | None:
    param = find_by_key_name(self.db, key)
    return param.value if param else None

  def get_boolean(self, key: str) -> bool:
    param = find_by_key_name(self.db, key)
    return param.value.lower() == "true" if param and param.value else False

  def update_param(self, key: str, value: str) -> AppSetting:
    param = find_by_key_name(self.db, key)
    if param is None:
      param = AppSetting(key_name=key, value=value)
    else:
      param.value = value
    return save(self.db, param)

  def get_all(self) -> list[AppSetting]:
    return find_all(self.db)

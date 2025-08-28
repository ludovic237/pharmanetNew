# services/app_setting_service.py
from __future__ import annotations
from typing import Optional, List

class AppSettingService:

  def __init__(self, *, app_setting_repo):
    self.app_setting_repo = app_setting_repo

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
      setting = self.app_setting_repo.model()  # ex.: AppSetting()
      setting.keyName = key
    setting.value = value
    return self.app_setting_repo.save(setting)

  # getAll(): List<AppSetting>
  def get_all(self) -> List:
    return self.app_setting_repo.find_all()

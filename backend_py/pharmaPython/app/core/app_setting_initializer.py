from app.models.app_setting import AppSetting
from app.repositories import app_setting_repository


def initialize_app_settings(db):
  default_settings = [
    {"key_name": "app_name", "value": "ALSA", "type": "string"},
    {"key_name": "vente_mode", "value": "differe", "type": "string"},
    {"key_name": "show_menu_stats", "value": "true", "type": "boolean"}
  ]

  for s in default_settings:
    existing = db.query(AppSetting).filter(AppSetting.key_name == s["key_name"]).first()
    if existing is None:
      new_setting = AppSetting(**s)
      db.add(new_setting)
      print(f"✅ Paramètre initialisé : {s['key_name']} = {s['value']}")
    else:
      print(f"⚙️ Paramètre déjà présent : {existing.key_name}")
    db.commit()

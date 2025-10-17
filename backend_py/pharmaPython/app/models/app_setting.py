from pydantic import BaseModel
from sqlalchemy import Column, String, Integer

from app.api.v1.db import Base


class AppSetting(Base):
  __tablename__ = "application_settings"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
  key_name = Column(String, nullable=True, index=True)
  value = Column(String, nullable=True)
  type = Column(String, nullable=True)


class AppSettingSchema(BaseModel):
  id: int
  key_name: str | None
  value: str | None
  type: str

  # Pydantic v2
  model_config = {"from_attributes": True}
  # (en v1: class Config: orm_mode = True)

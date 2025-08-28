from sqlalchemy import Column, Integer, String, Text
from app.core.db import Base

class AppSetting(Base):
  __tablename__ = "application_settings"

  id = Column(Integer, primary_key=True, index=True)
  key_name = Column(String(255), nullable=True)
  value = Column(Text, nullable=True)
  type = Column(String(50), default="0")

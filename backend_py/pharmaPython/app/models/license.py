from sqlalchemy import Column, Integer, DateTime
from app.core.db import Base

class License(Base):
  __tablename__ = "license"

  id = Column(Integer, primary_key=True)
  cle = Column(DateTime, nullable=False)

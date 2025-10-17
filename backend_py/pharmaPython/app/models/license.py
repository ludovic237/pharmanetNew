from sqlalchemy import Column, Integer, DateTime
from app.api.v1.db import Base

class License(Base):
  __tablename__ = "license"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  cle = Column(DateTime, nullable=False)

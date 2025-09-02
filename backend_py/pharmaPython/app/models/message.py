from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class Message(Base):
  __tablename__ = "message"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  type = Column(String(32))
  description = Column(String(64))
  datemsg = Column(DateTime)

from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class Message(Base):
  __tablename__ = "message"

  id = Column(Integer, primary_key=True)
  type = Column(String(32))
  description = Column(String(64))
  datemsg = Column(DateTime)

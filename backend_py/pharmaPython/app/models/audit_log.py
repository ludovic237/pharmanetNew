from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, nullable=True, index=True)
    action = Column(String(50), nullable=True)
    method_name = Column(String(255), nullable=True)
    arguments = Column(Text, nullable=True)
    result = Column(Text, nullable=True)
    exception = Column(Text, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=True)
    created_date = Column(DateTime, nullable=True)
    updated_date = Column(DateTime, nullable=True)

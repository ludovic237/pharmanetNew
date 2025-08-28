from sqlalchemy.orm import Session
from app.domain.audit_log import AuditLog
from repositories.audit_log_repository import save

class AuditLogService:
  def __init__(self, db: Session):
    self.db = db

  def save_log(self, log: AuditLog):
    return save(self.db, log)

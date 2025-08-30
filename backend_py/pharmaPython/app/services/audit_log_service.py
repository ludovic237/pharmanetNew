from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
  def __init__(self, db: Session):
    self.db = db
    self.auditLogRepository = AuditLogRepository(db)

  def save_log(self, log: AuditLog):
    return self.auditLogRepository.save(self.db, log)

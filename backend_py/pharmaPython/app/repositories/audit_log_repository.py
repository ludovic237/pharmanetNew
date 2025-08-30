# repositories/audit_log_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog  # adapte

class AuditLogRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[AuditLog]:
    return self.db.query(AuditLog).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[AuditLog], int]:
    q = self.db.query(AuditLog)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[AuditLog]:
    return self.db.query(AuditLog).get(id_)
  def save(self, entity: AuditLog) -> AuditLog:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: AuditLog) -> None:
    self.db.delete(entity); self.db.commit()

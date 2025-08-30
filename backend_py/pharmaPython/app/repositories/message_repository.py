# repositories/message_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.message import Message

class MessageRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Message]:
    return self.db.query(Message).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Message], int]:
    q = self.db.query(Message)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Message]:
    return self.db.query(Message).get(id_)

  def save(self, entity: Message) -> Message:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Message) -> None:
    self.db.delete(entity); self.db.commit()

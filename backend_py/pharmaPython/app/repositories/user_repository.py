# repositories/user_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User  # adapte le chemin


class UserRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_email(self, email: str) -> Optional[User]:
    return (
      self.db.query(User)
      .filter(func.lower(User.email) == email.lower())
      .first()
    )

  def exists_by_email(self, email: str) -> bool:
    return (
      self.db.query(User.id)
      .filter(func.lower(User.email) == email.lower())
      .first()
      is not None
    )

  # helpers génériques
  def find_by_id(self, user_id: int) -> Optional[User]:
    return self.db.query(User).get(user_id)

  def save(self, entity: User) -> User:
    self.db.add(entity)
    self.db.commit()
    self.db.refresh(entity)
    return entity

  def delete(self, entity: User) -> None:
    self.db.delete(entity)
    self.db.commit()

from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User


class UserRepository:

  def __init__(self, db: Session):
    self.db = db

  def find_by_email(self, email: str) -> Optional[User]:
    return self.db.query(User).filter(User.email == email).first()

  def exists_by_email(self, email: str) -> bool:
    return self.db.query(User).filter(User.email == email).count() > 0

  def save(self, user: User) -> User:
    self.db.add(user)
    self.db.commit()
    self.db.refresh(user)
    return user

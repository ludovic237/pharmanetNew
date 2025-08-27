from typing import Generic, TypeVar, Type, Sequence
from sqlalchemy.orm import Session

T = TypeVar("T")

class BaseRepository(Generic[T]):
  def __init__(self, model: Type[T]):
    self.model = model

  def get(self, db: Session, id: int) -> T | None:
    return db.get(self.model, id)

  def list(self, db: Session, skip: int = 0, limit: int = 100) -> Sequence[T]:
    return db.query(self.model).offset(skip).limit(limit).all()

  def count(self, db: Session) -> int:
    return db.query(self.model).count()

  def create(self, db: Session, obj: T) -> T:
    db.add(obj); db.commit(); db.refresh(obj); return obj

  def delete(self, db: Session, obj: T) -> None:
    db.delete(obj); db.commit()

from sqlalchemy.orm import Session
from typing import Sequence
from app.models.product import Product
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
  def __init__(self):
    super().__init__(Product)

  def search_by_name(self, db: Session, term: str, skip: int, limit: int) -> Sequence[Product]:
    q = db.query(Product)
    if term:
      q = q.filter(Product.nom.ilike(f"%{term}%"))
    return q.offset(skip).limit(limit).all()

  def count_by_name(self, db: Session, term: str) -> int:
    q = db.query(Product)
    if term:
      q = q.filter(Product.nom.ilike(f"%{term}%"))
    return q.count()

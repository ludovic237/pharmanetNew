from sqlalchemy.orm import Session
from app.core.pagination import Page, PageParams
from app.core.exceptions import NotFoundError
from app.models.product import Product
from app.schemas.product import ProductIn, ProductOut
from app.repositories.product_repo import ProductRepository

class ProductService:
  def __init__(self, repo: ProductRepository | None = None):
    self.repo = repo or ProductRepository()

  def get(self, db: Session, id: int) -> ProductOut:
    obj = self.repo.get(db, id)
    if not obj:
      raise NotFoundError("Product")
    return ProductOut.model_validate(obj)

  def create(self, db: Session, data: ProductIn) -> ProductOut:
    obj = Product(name=data.name)
    obj = self.repo.create(db, obj)
    return ProductOut.model_validate(obj)

  def list(self, db: Session, p: PageParams, term: str | None = None) -> Page:
    skip = p.page * p.size
    items = self.repo.search_by_name(db, term or "", skip, p.size)
    total = self.repo.count_by_name(db, term or "")
    return Page(items=[ProductOut.model_validate(i) for i in items],
                total=total, page=p.page, size=p.size)

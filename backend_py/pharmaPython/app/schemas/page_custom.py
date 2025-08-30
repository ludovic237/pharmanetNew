# app/schemas/paging.py
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PageableCustom(BaseModel, Generic[T]):
  totalElements: int
  totalPages: int
  pageSize: int
  pageNumber: int


class PageCustom(BaseModel, Generic[T]):
  content: List[T]
  totalElements: int
  totalPages: int
  pageSize: int
  pageable: PageableCustom
  pageNumber: int
  # Si tu veux aussi des totaux globaux :
  totalAmountRecu: Optional[float] = None
  totalAmountCommande: Optional[float] = None
  totalQteRecu: Optional[int] = None
  totalQteCommande: Optional[int] = None


from typing import Generic, TypeVar, List
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

class PageParams(BaseModel):
  page: int = 0
  size: int = 20

class Page(BaseModel, Generic[T]):
  items: List[T]
  total: int
  page: int
  size: int

  model_config = ConfigDict(arbitrary_types_allowed=True)

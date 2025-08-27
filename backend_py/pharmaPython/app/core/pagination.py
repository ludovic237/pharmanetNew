from pydantic import BaseModel

class PageParams(BaseModel):
  page: int = 0
  size: int = 20

class Page(BaseModel):
  items: list
  total: int
  page: int
  size: int

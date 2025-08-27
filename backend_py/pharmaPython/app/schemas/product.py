from pydantic import BaseModel

class ProductIn(BaseModel):
  name: str

class ProductOut(ProductIn):
  id: int
  class Config:
    from_attributes = True

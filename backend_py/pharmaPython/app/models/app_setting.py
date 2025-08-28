from pydantic import BaseModel


class AppSettingSchema(BaseModel):
  id: int
  key_name: str | None
  value: str | None
  type: str

  # Pydantic v2
  model_config = {"from_attributes": True}
  # (en v1: class Config: orm_mode = True)

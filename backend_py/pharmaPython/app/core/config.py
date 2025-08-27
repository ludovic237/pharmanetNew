from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  # app_name: str = "My API"
  # secret_key: str = "CHANGE_ME"
  # cors_origins: list[str] = ["http://localhost:4200"]
  #
  # class Config:
  #   env_file = ".env"

  app_name: str = "Pharma API"
  database_url: str = "mysql+pymysql://root:root@localhost:3306/pharmanet1?charset=utf8mb4"
  cors_origins: list[str] = ["http://localhost:4200"]
  class Config:
    env_file = ".env"

settings = Settings()

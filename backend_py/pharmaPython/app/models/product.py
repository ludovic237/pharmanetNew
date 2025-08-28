from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Product(Base):
  __tablename__ = "produit"
  id = Column(Integer, primary_key=True, index=True)
  name = Column(String(255), nullable=False, index=True)

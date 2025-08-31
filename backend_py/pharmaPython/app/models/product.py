from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Product(Base):
  __tablename__ = "produit"
  id = Column(Integer, primary_key=True, index=True)
  nom = Column(String(255), nullable=False, index=True)

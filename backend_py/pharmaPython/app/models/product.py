from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class Product(Base):
  __tablename__ = "produit"
  id = Column(Integer, primary_key=True, index=True)
  nom = Column(String(255), nullable=False, index=True)

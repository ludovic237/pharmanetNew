from sqlalchemy import Column, Integer
from app.core.db import Base

class Gerer(Base):
  __tablename__ = "gerer"
  __table_args__ = {"extend_existing": True}

  id_uti = Column(Integer, primary_key=True)
  id_produit = Column(Integer, nullable=False)

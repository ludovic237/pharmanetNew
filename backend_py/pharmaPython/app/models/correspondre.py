from sqlalchemy import Column, Integer
from app.core.db import Base

class Correspondre(Base):
  __tablename__ = "correspondre"

  id_vente = Column(Integer, primary_key=True, index=True)
  id_fac = Column(Integer, nullable=False)

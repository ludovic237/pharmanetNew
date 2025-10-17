from sqlalchemy import Column, Integer
from app.api.v1.db import Base

class Correspondre(Base):
  __tablename__ = "correspondre"
  __table_args__ = {"extend_existing": True}

  id_vente = Column(Integer, primary_key=True, index=True)
  id_fac = Column(Integer, nullable=False)

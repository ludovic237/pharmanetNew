from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class SortieStock(Base):
  __tablename__ = "sortie_stock"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  en_rayon_id = Column(Integer, ForeignKey("en_rayon.id"))
  type_sortie_id = Column(Integer, ForeignKey("type_sortie.id"))
  quantite = Column(Integer)
  date_sortie = Column(DateTime)
  detail_id = Column(String(20))
  supprimer = Column(Integer, default=0)

  en_rayon = relationship("EnRayon")
  type_sortie = relationship("TypeSortie")

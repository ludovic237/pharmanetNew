from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class EnRayonInventaire(Base):
  __tablename__ = "en_rayon_inventaire"

  id = Column(Integer, primary_key=True, autoincrement=True)
  inventaire_id = Column(Integer)
  en_rayon_id = Column(String)
  employe_id = Column(Integer)
  quantite_rayon = Column(Integer)
  quantite_inventaire = Column(Integer)
  date_debut = Column(DateTime)
  date_fin = Column(DateTime)
  type = Column(String(100))
  statut = Column(String(100))
  supprimer = Column(Integer, default=0)

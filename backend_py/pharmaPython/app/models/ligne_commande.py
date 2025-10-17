from sqlalchemy import Column, Integer, String, DateTime
from app.api.v1.db import Base

class LigneCommande(Base):
  __tablename__ = "ligne_commande"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  type = Column(String(50))
  date_derniere = Column(DateTime)
  supprimer = Column(Integer, default=0)

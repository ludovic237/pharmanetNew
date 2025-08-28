from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class LigneCommande(Base):
  __tablename__ = "ligne_commande"

  id = Column(Integer, primary_key=True)
  type = Column(String(50))
  date_derniere = Column(DateTime)
  supprimer = Column(Integer, default=0)

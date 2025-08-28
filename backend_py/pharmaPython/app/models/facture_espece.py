from sqlalchemy import Column, Integer
from app.core.db import Base

class FactureEspece(Base):
  __tablename__ = "facture_espece"

  id = Column(Integer, primary_key=True)
  facturation_id = Column(Integer)
  montant = Column(Integer)
  supprimer = Column(Integer, default=0)

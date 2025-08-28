from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base

class BonCaisse(Base):
  __tablename__ = "bon_caisse"

  id = Column(Integer, primary_key=True, index=True)
  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  caisse = relationship("Caisse", lazy="joined")
  caisse_id_encaisser = Column(Integer)
  nom_client = Column(String(100))
  codebarre_id = Column(String(50))
  montant = Column(Integer)
  date_generer = Column(DateTime)
  date_encaisser = Column(DateTime)
  type = Column(String(50))
  supprimer = Column(Integer, default=0)

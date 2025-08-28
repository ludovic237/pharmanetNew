from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Malade(Base):
  __tablename__ = "malade"

  id = Column(Integer, primary_key=True)
  nom = Column(String(32))
  telephone = Column(String(32), nullable=False)
  mode_reglement = Column(String(32), nullable=False)
  poid = Column(Float, default=0.0)
  taille = Column(Float, default=0.0)
  code_postal_id = Column(Integer, ForeignKey("code_postal.id"))
  code_postal = relationship("CodePostal", lazy="select")
  reduction = Column(String(32), nullable=False)
  supprimer = Column(Integer, default=0)

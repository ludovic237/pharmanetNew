from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base

class Caisse(Base):
  __tablename__ = "caisse"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("employe.id"), nullable=False)
  user = relationship("Employe", lazy="joined")
  ouverture_caisse = Column(String)
  fermeture_caisse = Column(String)
  date_ouvert = Column(DateTime)
  date_ferme = Column(DateTime)
  session = Column(String(32))
  fond_caisse_ouvert = Column(Float, default=0.0)
  fond_caisse_ferme = Column(Float, default=0.0)
  etat = Column(String(16))
  supprimer = Column(Integer, default=0)

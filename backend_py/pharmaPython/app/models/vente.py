from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.api.v1.db import Base

class Vente(Base):
  __tablename__ = "vente"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  prix_total = Column(Float, default=0.0)
  prix_percu = Column(Float, default=0.0)
  date_vente = Column(DateTime)
  date_encaissement = Column(DateTime)
  commentaire = Column(String)
  malade_id = Column(Integer, ForeignKey("malade.id"), nullable=True)
  etat = Column(String(16))
  reference = Column(String(16))
  nouveau_info = Column(String(16))
  user_id = Column(Integer, ForeignKey("user.id"))
  prescripteur_id = Column(Integer, ForeignKey("prescripteur.id"), nullable=True)
  employe_id = Column(Integer, ForeignKey("employe.id"))
  reduction = Column(String(32))
  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  supprimer = Column(Integer, default=0)

  # malade = relationship("Malade")
  user = relationship("User")
  caisse = relationship("Caisse")
  # malade = relationship("Malade")
  prescripteur = relationship("Prescripteur")
  employe = relationship("Employe")
  # caisse = relationship("Caisse")

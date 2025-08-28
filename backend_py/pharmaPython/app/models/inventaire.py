from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base


class Inventaire(Base):
  __tablename__ = "inventaire"

  id = Column(Integer, primary_key=True)
  etat = Column(String(15))
  supprimer = Column(Integer, default=0)
  date_debut = Column(DateTime)
  date_fin = Column(DateTime)
  employe_id = Column(Integer, ForeignKey("employe.id"))
  rayon_id = Column(Integer, ForeignKey("rayon.id"))
  categorie_id = Column(Integer, ForeignKey("categorie.id"))
  fabriquant_id = Column(Integer, ForeignKey("fabriquant.id"))
  forme_id = Column(Integer, ForeignKey("forme.id"))
  fournisseur_id = Column(Integer, ForeignKey("fournisseur.id"))
  commentaire = Column(String)

  # employe = relationship("Employe", lazy="select")
  # rayon = relationship("Rayon", lazy="select")
  # categorie = relationship("Categorie", lazy="select")
  # fabriquant = relationship("Fabriquant", lazy="select")
  # forme = relationship("Forme", lazy="select")
  # fournisseur = relationship("Fournisseur", lazy="select")

  # constantes d'état
  INVENTAIRE_EN_COURS = "EN_COURS"
  INVENTAIRE_CLOTURER = "CLOTURER"
  INVENTAIRE_TERMINER = "TERMINER"


class InventaireSchema(BaseModel):
  id: int
  etat: str
  supprimer: int
  date_debut: datetime
  date_fin: datetime
  employe_id: int
  rayon_id: int
  categorie_id: int
  fabriquant_id: int
  forme_id: int
  fournisseur_id: int
  commentaire: str

class InventaireIn(BaseModel):

  etat: str
  date_debut: datetime
  date_fin: datetime
  employe_id: int
  rayon_id: int
  categorie_id: int
  fabriquant_id: int
  forme_id: int
  fournisseur_id: int
  commentaire: str

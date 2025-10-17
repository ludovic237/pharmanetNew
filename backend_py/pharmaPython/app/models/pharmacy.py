from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.api.v1.db import Base

class Pharmacy(Base):
  __tablename__ = "pharmacy"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  nom = Column(String(64))
  telephone = Column(String(128), nullable=False)
  adresse = Column(String(128), nullable=False)
  logo = Column(String(64), nullable=False)
  code_postal_id = Column(Integer, ForeignKey("code_postal.id"))
  code_postal = relationship("CodePostal", lazy="select")
  slogan = Column(String(128), nullable=False)
  docteur = Column(String(128), nullable=False)
  contribuable = Column(String(128), nullable=False)

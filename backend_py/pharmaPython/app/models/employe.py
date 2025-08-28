from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Employe(Base):
  __tablename__ = "employe"

  id = Column(Integer, primary_key=True)
  identifiant = Column(String(100))
  password = Column(String(50))
  codebarre_id = Column(String)
  type = Column(String(100))
  user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
  user = relationship("User", lazy="joined")
  etat = Column(String(20))
  faire_reduction_max = Column(Integer)
  supprimer = Column(Integer, default=0)

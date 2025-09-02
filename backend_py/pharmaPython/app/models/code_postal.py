from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class CodePostal(Base):
  __tablename__ = "code_postal"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  code = Column(String(16))
  nom = Column(String(32), nullable=False)
  ville_id = Column(Integer, ForeignKey("ville.id"))
  ville = relationship("Ville", lazy="joined")

from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base
from app.models.user import User


class Employe(Base):
  __tablename__ = "employe"
  __table_args__ = {"extend_existing": True}

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

class EmployeSchema(BaseModel):

  id : Optional[int]
  identifiant : Optional[str]
  password : Optional[str]
  codebarre_id : Optional[str]
  type : Optional[str]
  user_id : Optional[int]
  etat : Optional[str]
  faire_reduction_max : Optional[int]
  supprimer : Optional[int]

  model_config = {"from_attributes": True}

class EmployeIn(BaseModel):

  identifiant : Optional[str]
  password : Optional[str]
  codebarre_id : Optional[str]
  type : Optional[str]
  user_id : Optional[int]
  etat : Optional[str]
  faire_reduction_max : Optional[int]


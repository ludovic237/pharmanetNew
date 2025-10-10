from http.client import HTTPException

import jwt
import unicodedata
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.caisse import Caisse
from app.models.employe import Employe
from app.repositories.employe_repository import EmployeRepository
from app.services.jwt_service import create_access_token
from app.utility.jwt_authentication import security, jwt_util, jwt_authentication


def to_camel_case(name: str) -> str:
  parts = name.split('_')
  return parts[0] + ''.join(word.capitalize() for word in parts[1:])


def to_camel_dict(obj):
  if isinstance(obj, dict):
    return {to_camel_case(k): to_camel_dict(v) for k, v in obj.items()}
  elif isinstance(obj, list):
    return [to_camel_dict(i) for i in obj]
  else:
    return obj

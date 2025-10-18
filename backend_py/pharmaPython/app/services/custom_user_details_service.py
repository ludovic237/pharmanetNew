# custom_user_details_service.py

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from typing import List
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.api.deps import get_db
from app.models.employe import Employe

# Exemple de configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def load_user_by_username(email: str, db: Session = Depends(get_db)):
  employe = db.query(Employe).filter(Employe.identifiant == email).first()
  if not employe:
    raise HTTPException(status_code=404, detail=f"Employé non trouvé avec l'email : {email}")

  user = employe.user
  if user is None or user.fonction is None:
    raise HTTPException(status_code=403, detail="Aucune fonction définie pour cet utilisateur")

  authorities: List[str] = [str(f) for f in user.fonction]
  return {
    "username": employe.identifiant,
    "password": employe.password,
    "roles": authorities
  }

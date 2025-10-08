from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, time
from passlib.context import CryptContext
from app.api.deps import get_db
from app.core.security import jwt_util
from app.models.caisse import Caisse
from app.models.employe import Employe
from app.models.user import User
from app.repositories.caisse_repository import CaisseRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth_dto import CodebarreRequest
from app.services.caisse_service import CaisseService
from app.services.jwt_service import create_access_token
from app.utility.jwt_util import JwtUtil
from app.utility.user_utils import UserUtils

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret"
ALGORITHM = "HS256"


# ---------------------------
# Vérifier le token
# ---------------------------
@router.get("/check")
def check_session(request: Request):
  auth_header = request.headers.get("Authorization")
  if not auth_header or not auth_header.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Token manquant")
  token = auth_header.replace("Bearer ", "")
  if jwt_util.validate_token(token):
    return {"message": "Token is valid"}
  else:
    raise HTTPException(status_code=401, detail="EXPIRED")


# ---------------------------
# Login avec identifiant/codebarre
# ---------------------------
@router.post("/login/codebarre")
def login_codebarre(data: CodebarreRequest, db: Session = Depends(get_db)):
  if not data.codebarre:
    raise HTTPException(status_code=400, detail="Codebarre obligatoire")
  employe = EmployeRepository(db).find_by_codebarre_id(data.codebarre)
  if not employe:
    raise HTTPException(status_code=404, detail="Employé non trouvé")
  # token = create_access_token({"sub": employe.identifiant})
  token = JwtUtil.generate_token("", employe.identifiant)

  active_caisse = CaisseService.get_caisse_active_db(db)
  caisse_en_cours = CaisseRepository(db).find_by_user_and_etat(employe, "En cours")
  caisse_fermer = CaisseService.get_caisse_fermer(db)

  if active_caisse is None and caisse_en_cours and caisse_en_cours.user.id != employe.id:
    nouvelle_caisse = Caisse(
      user=employe,
      fond_caisse_ouvert=0.0,
      ouverture_caisse="0",
      date_ouvert=datetime.now(),
      session=generer_session_id(),
      etat="Ouvert",
      supprimer=0
    )
    db.add(nouvelle_caisse)
    db.commit()

  return {
    "message": "Login successful",
    "role": employe.type,
    "token": token,
    "nom": f"{employe.user.nom if employe.user else 'Unknown'} {employe.user.prenom if employe.user else ''}"
  }


@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
  employe = EmployeRepository(db).find_by_identifiant(username)
  if not employe:
    raise HTTPException(status_code=400, detail="Login failed: Invalid username or password")

  if not pwd_context.verify(password, employe.password):
    raise HTTPException(status_code=400, detail="Login failed: Invalid username or password")

  token = create_access_token({"sub": employe.identifiant})

  active_caisse = CaisseService.get_caisse_active_db(db)
  caisse_en_cours = CaisseRepository(db).find_by_user_and_etat(employe, "En cours")
  caisse_fermer = CaisseService.get_caisse_fermer(db)

  if active_caisse is None and caisse_en_cours and caisse_en_cours.user.id != employe.id:
    nouvelle_caisse = Caisse(
      user=employe,
      fond_caisse_ouvert=0.0,
      ouverture_caisse="0",
      date_ouvert=datetime.now(),
      session=generer_session_id(),
      etat="Ouvert",
      supprimer=0
    )
    db.add(nouvelle_caisse)
    db.commit()

  return {
    "message": "Login successful",
    "role": employe.type,
    "token": token,
    "nom": f"{employe.user.nom if employe.user else 'Unknown'} {employe.user.prenom if employe.user else ''}"
  }


# ---------------------------
# Logout
# ---------------------------
@router.post("/logout")
def logout(db: Session = Depends(get_db), employe: Employe = Depends(UserUtils.get_current_employe)):
  employe = employe
  if not employe:
    return {"message": "Not user connected"}
  service = CaisseService(db)
  active_caisse = service.get_caisse_active()
  if active_caisse and active_caisse.user.id == employe.id:
    active_caisse.date_ferme = datetime.now()
    active_caisse.etat = "Clot"
    db.commit()

  return {"message": "Logout successful"}


# ---------------------------
# Register
# ---------------------------
@router.post("/register")
def register(first_name: str, last_name: str, role: str, phone: str, email: str, password: str,
             db: Session = Depends(get_db)):
  user_repo = UserRepository(db)
  if user_repo.exists_by_email(email):
    raise HTTPException(status_code=400, detail="Email déjà utilisé")

  user = User(
    nom=first_name,
    prenom=last_name,
    telephone=phone,
    email=email,
    fonction=role,
    supprimer=0
  )
  db.add(user)
  db.commit()
  db.refresh(user)

  employe = Employe(
    user_id=user.id,
    identifiant=email,
    codebarre_id="0",
    supprimer=0,
    password=pwd_context.hash(password)
  )
  db.add(employe)
  db.commit()

  return {"message": "User registered successfully"}


# ---------------------------
# Générateur de session ID
# ---------------------------
def generer_session_id() -> str:
  heure = datetime.now().time()
  if time(5, 0) <= heure <= time(11, 59):
    return "matin"
  elif time(12, 0) <= heure <= time(23, 59):
    return "soir"
  else:
    return "soir"


class CodebarreRequest(BaseModel):
  codebarre: str

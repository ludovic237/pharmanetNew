from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.employe_repository import EmployeRepository
from app.utility.jwt_util import JwtUtil

security = HTTPBearer()
jwt_util = JwtUtil()

async def jwt_authentication(request: Request, db: Session = Depends(get_db)):
  auth_header = request.headers.get("Authorization")
  if not auth_header or not auth_header.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Token manquant")

  token = auth_header.split(" ")[1]
  if not jwt_util.validate_token(token):
    raise HTTPException(status_code=401, detail="Token invalide ou expiré")

  username = jwt_util.get_username_from_token(token)
  employe = EmployeRepository(db).find_by_identifiant(username)
  if not employe:
    raise HTTPException(status_code=404, detail=f"Employé non trouvé : {username}")

  return employe

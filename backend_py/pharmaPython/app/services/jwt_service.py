from datetime import datetime, timedelta
from jose import jwt

# Paramètres du token (à sécuriser dans un fichier de config ou variables d'environnement)
SECRET_KEY = "votre_secret_a_changer"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
  """
  Génère un JWT signé avec SECRET_KEY
  :param data: dictionnaire contenant les données (payload) du token
  :param expires_delta: durée personnalisée de validité
  :return: token JWT (str)
  """
  to_encode = data.copy()

  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

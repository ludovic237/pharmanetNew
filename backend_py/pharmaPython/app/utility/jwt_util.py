from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "secret_a_remplacer"
ALGORITHM = "HS512"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class JwtUtil:

  def generate_token(self, username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

  def validate_token(self, token: str) -> bool:
    try:
      jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
      return True
    except JWTError:
      return False

  def get_username_from_token(self, token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")

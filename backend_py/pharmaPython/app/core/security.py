from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import JwtUtil

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
jwt_util = JwtUtil()

@app.middleware("http")
async def jwt_auth_middleware(request, call_next):
  token = request.headers.get("Authorization")
  if token:
    try:
      jwt_util.verify_token(token.split(" ")[1])
    except Exception as e:
      return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
  return await call_next(request)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:4200"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

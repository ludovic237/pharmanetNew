from pydantic import BaseModel


class LoginRequest(BaseModel):
  username: str
  password: str


class CodebarreRequest(BaseModel):
  codebarre: str


class RegisterRequest(BaseModel):
  firstName: str
  lastName: str
  role: str
  phone: str
  email: str
  password: str


class AuthenticationRequest(BaseModel):
  username: str
  password: str


class AuthenticationResponse(BaseModel):
  jwt: str

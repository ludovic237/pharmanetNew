from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.user import User
from app.schemas.user_dto import UserNewDto
from app.services.user_service import UserService

router = APIRouter(
  prefix="/api/admin/users",
  tags=["Users"],
  # dependencies=[Depends(jwt_authentication)],
)

@router.get("/", response_model=List[User])
def get_all_users(db: Session = Depends(get_db)):
  return UserService(db, user_repo=... ).get_all_users()

@router.get("/{id}", response_model=User)
def get_user_by_id(id: int = Path(..., ge=1), db: Session = Depends(get_db)):
  user = UserService(db, user_repo=... ).get_user_by_id(id)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user

@router.post("/", response_model=User, status_code=201)
def create_user(user: User, db: Session = Depends(get_db)):
  # print("Creating user:", user)  # si tu veux garder le println
  return UserService(db, user_repo=... ).create_user(user)

@router.put("/{id}", response_model=User)
def update_user(id: int, updated_user: UserNewDto, db: Session = Depends(get_db)):
  return UserService(db, user_repo=... ).update_user(id, updated_user)

@router.delete("/{id}", status_code=204)
def delete_user(id: int, db: Session = Depends(get_db)):
  UserService(db, user_repo=... ).delete_user(id)
  return {"message": "deleted"}

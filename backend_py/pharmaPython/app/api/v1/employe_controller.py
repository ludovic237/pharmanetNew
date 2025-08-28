from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from services.user_service import UserService
from schemas.employe import EmployeNewDto, Employe
from schemas.user import RegisterRequest  # équivalent de ton DTO d’inscription

from app.api.deps import get_db
from app.services.employe_service import EmployeService

router = APIRouter(
  prefix="/api/admin/users-employees",
  tags=["Users & Employees"],
  # dependencies=[Depends(jwt_authentication)]  # équivalent de @PreAuthorize("isAuthenticated()")
)

# ----------------------------
# DTOs Python pour la requête combinée
# ----------------------------
from pydantic import BaseModel

class EmployeDto(BaseModel):
  identifiant: str

class UserEmployeeRequest(BaseModel):
  registerRequest: RegisterRequest
  employee: EmployeDto


# ----------------------------
# Créer un utilisateur + employé
# ----------------------------
@router.post("/", response_model=Dict[str, Any])
def create_user_and_employee(request: UserEmployeeRequest, db: Session = Depends(get_db)):
  employee_service = EmployeService(db)
  user_service = UserService(db)
  try:
    employee = employee_service.create_employee(request.registerRequest, request.employee)
    return {"employee": employee}
  except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))


# ----------------------------
# Récupérer tous les employés
# ----------------------------
@router.get("/", response_model=List[Employe])
def get_all_employees(db: Session = Depends(get_db)):
  employee_service = EmployeService(db)
  return employee_service.get_all_employees()


# ----------------------------
# Récupérer un employé par ID
# ----------------------------
@router.get("/{id}", response_model=Employe)
def get_employee_by_id(id: int, db: Session = Depends(get_db)):
  employee_service = EmployeService(db)
  emp = employee_service.get_employee_by_id(id)
  if not emp:
    raise HTTPException(status_code=404, detail="Employee not found")
  return emp


# ----------------------------
# Mettre à jour un employé
# ----------------------------
@router.put("/{id}", response_model=Employe)
def update_employee(id: int, updated_user: EmployeNewDto, db: Session = Depends(get_db)):
  employee_service = EmployeService(db)
  try:
    return employee_service.update_employee(id, updated_user)
  except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))


# ----------------------------
# Supprimer un employé
# ----------------------------
@router.delete("/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
  employee_service = EmployeService(db)
  try:
    employee_service.delete_employee(id)
    return {"message": "Employee deleted"}
  except Exception as e:
    raise HTTPException(status_code=404, detail=str(e))

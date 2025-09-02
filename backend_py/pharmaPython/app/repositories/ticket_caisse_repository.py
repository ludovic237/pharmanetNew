# repositories/ticket_caisse_repository.py
from datetime import datetime
from typing import Optional, Type, Tuple, List
from sqlalchemy.orm import Session
from app.models.ticket_caisse import TicketCaisse  # adapte le chemin

class TicketCaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> list[Type[TicketCaisse]]:
    return self.db.query(TicketCaisse).all()

  def filter_ticket_caisse_range(
    self,
    *,
    codebarre: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[TicketCaisse], int]:
    q = self.db.query(TicketCaisse)

    # plage de dates sur date_vente (Kotlin parse LocalDateTime des strings données)
    if start_date and end_date:
      start_dt = datetime.fromisoformat(start_date.strip())
      end_dt = datetime.fromisoformat(end_date.strip())
      q = q.filter(TicketCaisse.date_genere.between(start_dt, end_dt))

    if codebarre and codebarre != "null":
      q = q.filter(TicketCaisse.codebarre == codebarre)

    total = q.count()

    col = getattr(TicketCaisse, sort_by, TicketCaisse.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_codebarre(self, codebarre: int) -> Optional[TicketCaisse]:
    return (
      self.db.query(TicketCaisse)
      .filter(TicketCaisse.codebarre == codebarre)
      .first()
    )

  # helpers CRUD
  def save(self, entity: TicketCaisse) -> TicketCaisse:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[TicketCaisse]:
    return self.db.query(TicketCaisse).get(id_)
  def delete(self, entity: TicketCaisse) -> None:
    self.db.delete(entity); self.db.commit()

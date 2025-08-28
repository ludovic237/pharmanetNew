
from sqlalchemy.orm import Session
from models import EnRayonInventaire

def ajouter_produits_en_rayon(db: Session, produits: list[EnRayonInventaire]):
    db.add_all(produits)
    db.commit()
    return produits

def mettre_a_jour_produits_en_rayon(db: Session, produits: list[EnRayonInventaire]):
    for p in produits:
        if p.id:
            existing = db.query(EnRayonInventaire).get(p.id)
            if existing:
                for attr, value in p.__dict__.items():
                    if attr != "_sa_instance_state":
                        setattr(existing, attr, value)
    db.commit()
    new_items = [p for p in produits if not p.id]
    db.add_all(new_items)
    db.commit()
    return new_items

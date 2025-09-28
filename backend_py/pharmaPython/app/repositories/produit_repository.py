# repositories/produit_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple, Dict, Any, Iterable
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, select, union_all

from app.models.commandeout import Commande
from app.models.concerner import Concerner
from app.models.produit import Produit
from app.models.en_rayon import EnRayon
from sqlalchemy.sql.elements import BinaryExpression

from app.models.produit_detail import ProduitDetail


class ProduitRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all_by_spec(
    self,
    spec: Dict[str, Any] | Iterable[BinaryExpression] | None = None,
    page: int = 0,
    size: int = 10,
    sort: str = "dateVente",
    direction: str = "DESC",
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit)

    # Accepte dict OU liste/tuple de filtres SQLAlchemy
    if spec:
      # cas 1: dictionnaire clé/valeur
      if isinstance(spec, dict):
        for key, value in spec.items():
          if value is None or (isinstance(value, str) and value.lower() == "null"):
            continue
          column = getattr(Produit, key, None)
          if column is not None:
            q = q.filter(column == value)
      # cas 2: itérable de BinaryExpression (ex: [Vente.etat == "VALIDE", Vente.supprimer == 0])
      elif isinstance(spec, (list, tuple)):
        from sqlalchemy.sql.elements import BinaryExpression
        filters = [f for f in spec if isinstance(f, BinaryExpression)]
        if filters:
          q = q.filter(*filters)

    total = q.count()

    sort_col = getattr(Produit, sort, getattr(Produit, "id", Produit.id))
    sort_col = sort_col.desc() if direction.upper() == "DESC" else sort_col.asc()
    rows = q.order_by(sort_col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_code_ubipharm_and_supprimer(self, codebarre: str, supprimer: int = 0) -> Optional[Produit]:
    return (
      self.db.query(Produit)
      .filter(Produit.codeUbipharm == codebarre, Produit.supprimer == supprimer)
      .first()
    )

  def get_total_count(self) -> int:
    return self.db.query(Produit).count()

  def find_all_by_supprimer(self, supprimer: int = 0) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.supprimer == supprimer).all()

  def find_by_nom_containing_ignore_case_and_supprimer(self, nom: str, supprimer: int = 0) -> List[Produit]:
    return (
      self.db.query(Produit)
      .filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"), Produit.supprimer == supprimer)
      .all()
    )

  def find_by_nom_containing_ignore_case(self, nom: str) -> List[Produit]:
    return (
      self.db.query(Produit)
      .filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"))
      .all()
    )

  def find_by_nom_containing(self, nom: str) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.nom.like(f"%{nom}%")).all()

  def find_by_detail_id(self, detail_id: int) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.detail_id == detail_id).all()

  def find_by_id_and_detail_id(self, product_id: int, product_detail_id: int) -> Optional[Produit]:
    return (
      self.db.query(Produit)
      .filter(Produit.id == product_id, Produit.detail_id == product_detail_id)
      .first()
    )

  def find_by_nom_containing_ignore_case_pageable(
    self, nom: str, page: int, size: int
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit).filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_produits_non_en_rayon(self) -> List[Produit]:
    subq = self.db.query(EnRayon.produit_id).subquery()
    return self.db.query(Produit).filter(~Produit.id.in_(subq)).all()

  # ---- "Specification" Kotlin: withFilters(...) ----
  def filter_with_spec(
    self,
    query: Optional[str],
    rayon_id: Optional[str],
    fabriquant_id: Optional[str],
    etagere_id: Optional[str],
    forme_id: Optional[str],
    magasin_id: Optional[str],
    categorie_id: Optional[str],
    page: int,
    size: int,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit)

    if query:
      q = q.filter(func.lower(Produit.nom).like(f"%{query.lower()}%"))
    if rayon_id and rayon_id != "null":
      q = q.filter(Produit.rayon_id == int(rayon_id))
    if fabriquant_id and fabriquant_id != "null":
      q = q.filter(Produit.fabriquant_id == int(fabriquant_id))
    if etagere_id and etagere_id != "null":
      q = q.filter(Produit.etagere_id == int(etagere_id))
    if forme_id and forme_id != "null":
      q = q.filter(Produit.forme_id == int(forme_id))
    if magasin_id and magasin_id != "null":
      q = q.filter(Produit.magasin_id == int(magasin_id))
    if categorie_id and categorie_id != "null":
      q = q.filter(Produit.categorie_id == int(categorie_id))

    total = q.count()
    col = getattr(Produit, sort_by, Produit.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # helpers
  def find_by_id(self, id_: int) -> Optional[Produit]:
    return self.db.query(Produit).get(id_)

  def save(self, entity: Produit) -> Produit:
    self.db.add(entity);
    self.db.commit();
    self.db.refresh(entity);
    return entity

  def find_all(self) -> List:
    return self.db.query(Produit).all()

  def find_top_n(self, limit: int = 100) -> List[Produit]:
    """
    Retourne les top produits par quantité vendue (concerner.quantite),
    en se basant sur l’ID produit récupéré via:
      - EnRayon.produit_id si la ligne Concerner pointe vers EnRayon
      - sinon ProduitDetail.produit_id
    Fallback: si aucune vente, renvoie les N premiers produits (par id décroissant).
    """
    # produit_id = COALESCE(en_rayon.produit_id, produit_detail.produit_id)
    # prod_id_expr = func.coalesce(EnRayon.produit_id, ProduitDetail.id)
    prod_id_expr = func.coalesce(EnRayon.produit_id, Produit.id)

    # Agrégation des quantités vendues par produit
    sub = (
      self.db.query(
        prod_id_expr.label("produit_id"),
        func.sum(Concerner.quantite).label("qty")
      )
      .outerjoin(EnRayon, EnRayon.id == Concerner.en_rayon_id)
      .outerjoin(Produit, Produit.id == EnRayon.produit_id)
      # .outerjoin(ProduitDetail, ProduitDetail.id == Concerner.en_rayon_id)
      .group_by(prod_id_expr)
      .subquery()
    )

    # Joindre sur Produit pour obtenir les objets Produit complets
    q = (
      self.db.query(Produit)
      .join(sub, sub.c.produit_id == Produit.id)
      .order_by(desc(sub.c.qty))
      .limit(limit)
    )
    results = q.all()

    if results:
      return results

    # Fallback si pas de ventes: retourner quelques produits (ex: par id desc)
    return (
      self.db.query(Produit)
      .order_by(Produit.id.desc())
      .limit(limit)
      .all()
    )

    # (existant)

  def find_all_basic(self, limit: int = 1000) -> List[Produit]:
    """
    Optionnel: utilisé par l'IA pour récupérer id/nom rapidement.
    """
    return (
      self.db.query(Produit)
      .order_by(Produit.id.desc())
      .limit(limit)
      .all()
    )

  def sum_stock_by_product(
    self,
    product_ids: Optional[List[int]] = None,
  ) -> Dict[int, float]:
    """
    Même logique que la version EnRayonRepository, mais exposée côté ProduitRepository.
    """

    stmt_enrayon = (
      select(
        EnRayon.produit_id.label("produit_id"),
        func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("qty")
      )
      .group_by(EnRayon.produit_id)
    )
    if product_ids:
      stmt_enrayon = stmt_enrayon.where(EnRayon.produit_id.in_(product_ids))

    stmt_pdetail = (
      select(
        ProduitDetail.id.label("produit_id"),
        func.coalesce(func.sum(ProduitDetail.stock), 0).label("qty")
      )
      .group_by(ProduitDetail.id)
    )
    if product_ids:
      stmt_pdetail = stmt_pdetail.where(ProduitDetail.id.in_(product_ids))

    union_stmt = union_all(stmt_enrayon, stmt_pdetail).subquery()

    final_stmt = (
      select(
        union_stmt.c.produit_id,
        func.sum(union_stmt.c.qty).label("stock_total")
      )
      .group_by(union_stmt.c.produit_id)
    )

    rows: List[Tuple[int, float]] = self.db.execute(final_stmt).all()
    return {int(pid): float(stock or 0) for pid, stock in rows}

  def list_id_and_name_with_synonyms(self) -> List[Tuple[int, str]]:
    """
    Retourne une liste (id, label) où label = nom + synonymes concaténés
    Utile pour indexer dans FAISS ou matcher des ordonnances
    """
    produits = self.db.query(Produit.id, Produit.nom, Produit.synonymes).all()
    rows: List[Tuple[int, str]] = []
    for pid, nom, syns in produits:
      label = nom or ""
      if syns:
        # si synonymes est une string "Doliprane,Paracetamol,Acetaminophen"
        label += " " + syns.replace(",", " ")
      rows.append((pid, label.strip()))
    return rows

  def find_all_sellable_ids_and_names(
    self,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
  ) -> List[Dict]:
    """
    Retourne une liste de dicts {id, nom} pour les produits vendables.
    Hypothèses:
      - Produit.vendable == True (si le champ existe)
      - Produit.supprimer == 0 (produits actifs)
    """

    q = self.db.query(Produit.id, Produit.nom)

    # Filtre "actif" si présent dans ton modèle
    if hasattr(Produit, "supprimer"):
      q = q.filter(Produit.supprimer == 0)

    # Filtre "vendable" si présent dans ton modèle
    if hasattr(Produit, "vendable"):
      q = q.filter(Produit.vendable.is_(True))

    # Recherche plein-texte sur le nom
    if search:
      q = q.filter(func.lower(Produit.nom).like(f"%{search.lower()}%"))

    q = q.order_by(Produit.nom.asc()).offset(offset).limit(limit)

    rows = q.all()
    return [{"id": r[0], "nom": r[1]} for r in rows]

  def find_all_sellable_ids_and_names_by_stock(
    self,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    min_stock: int = 1,
  ) -> List[Dict]:
    """
    Retourne {id, nom} pour les produits qui ont du stock en rayon (quantite >= min_stock).
    Combine l'état actif/vendable si ces colonnes existent.
    """

    q = (
      self.db.query(Produit.id, Produit.nom)
      .join(EnRayon, EnRayon.produit_id == Produit.id)
      .group_by(Produit.id, Produit.nom)
      .having(func.sum(func.coalesce(EnRayon.quantite, 0)) >= min_stock)
    )

    if hasattr(Produit, "supprimer"):
      q = q.filter(Produit.supprimer == 0)

    if hasattr(Produit, "vendable"):
      q = q.filter(Produit.vendable.is_(True))

    if search:
      q = q.filter(func.lower(Produit.nom).like(f"%{search.lower()}%"))

    q = q.order_by(Produit.nom.asc()).offset(offset).limit(limit)

    rows = q.all()
    return [{"id": r[0], "nom": r[1]} for r in rows]

  def sum_quantites_restantes_en_rayon(self) -> List[Dict[str, Any]]:
    """
    Retourne pour chaque produit la somme des quantités restantes en rayon.
    Format : [{"produitId": 1, "nom": "Doliprane", "quantiteTotale": 120}, ...]
    """
    rows = (
      self.db.query(
        Produit.id.label("produitId"),
        Produit.nom.label("nom"),
        Produit.stock_max.label("stock_max"),
        Produit.stock_min.label("stock_min"),
        func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("quantiteTotale")
      )
      .join(EnRayon, EnRayon.produit_id == Produit.id)
      .group_by(Produit.id, Produit.nom)
      .all()
    )
    return [
      {"id": pid, "nom": nom, "max": stock_max, "min": stock_min, "stock": float(qty or 0)}
      for pid, nom, stock_max, stock_min, qty, in rows
    ]

  def find_produits_stock_critique(self, low: int = 0) -> List[Dict[str, Any]]:
    """
    Retourne les produits dont la somme des quantités restantes en rayon
    est négative ou inférieure à une valeur donnée (low).
    Format : [{"produitId": 1, "nom": "Doliprane", "quantiteTotale": -3}, ...]
    """
    rows = (
      self.db.query(
        Produit.id.label("produitId"),
        Produit.nom.label("nom"),
        Produit.stock_max.label("stock_max"),
        Produit.stock_min.label("stock_min"),
        func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("quantiteTotale")
      )
      .join(EnRayon, EnRayon.produit_id == Produit.id)
      .group_by(Produit.id, Produit.nom)
      .having(func.coalesce(func.sum(EnRayon.quantite_restante), 0) < low)
      .all()
    )
    return [
      {"id": pid, "nom": nom, "max": stock_max, "min": stock_min, "stock": float(qty or 0)}
      for pid, nom, stock_max, stock_min, qty, in rows
    ]

  def sum_quantites_restantes_en_rayon_pageable(
    self,
    page: int = 0,
    size: int = 10,
    search: Optional[str] = None
  ) -> Tuple[List[Dict[str, Any]], int]:
    """
    Retourne pour chaque produit la somme des quantités restantes en rayon.
    Résultats paginés + filtre optionnel sur le nom.
    """
    q = (self.db.query(
      Produit.id.label("id"),
      Produit.nom.label("nom"),
      Produit.stock_max.label("stock_max"),
      Produit.stock_min.label("stock_min"),
      func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("stock"),
      func.coalesce(func.sum(EnRayon.quantite_restante*EnRayon.prix_vente), 0).label("valeur"),
      func.avg(func.datediff(EnRayon.date_livraison, Commande.date_creation)).label("lead_time"),
      func.count().label("n")
    )
      .join(EnRayon, EnRayon.produit_id == Produit.id)
      .join(Commande, Commande.id == EnRayon.commande_id)
      .group_by(Produit.id, Produit.nom, Produit.stock_max, Produit.stock_min))

    # 🔎 filtre inséré dès la construction de la query
    if search:
      q = q.filter(func.lower(Produit.nom).like(f"%{search.lower()}%"))

    total = q.count()

    rows = (
      # q.order_by(Produit.nom.asc())
      q.order_by(Produit.id.desc())
      .offset(page * size)
      .limit(size)
      .all()
    )

    return [
      {"id": pid, "nom": nom, "max": stock_max, "min": stock_min, "stock": float(stock or 0), "valeur": float(valeur or 0), "lead_time": float(lead_time or 0), "n": float(n or 0)}
      for pid, nom, stock_max, stock_min, stock, valeur, lead_time, n in rows
    ], total

  def find_produits_stock_critique_pageable(
    self,
    low: int = 0,
    page: int = 0,
    size: int = 10,
    search: Optional[str] = None
  ) -> Tuple[List[Dict[str, Any]], int]:
    """
    Retourne les produits dont la somme des quantités restantes est < low (ou négative).
    Résultats paginés + filtre optionnel sur le nom.
    """
    q = self.db.query(
      Produit.id.label("id"),
      Produit.nom.label("nom"),
      Produit.stock_max.label("stock_max"),
      Produit.stock_min.label("stock_min"),
      func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("stock")
    ) \
      .join(EnRayon, EnRayon.produit_id == Produit.id) \
      .group_by(Produit.id, Produit.nom, Produit.stock_max, Produit.stock_min) \
      .having(func.coalesce(func.sum(EnRayon.quantite_restante), 0) < low)

    # 🔎 filtre inséré directement
    if search:
      q = q.filter(func.lower(Produit.nom).like(f"%{search.lower()}%"))

    total = q.count()

    rows = (
      q.order_by(Produit.nom.asc())
      .offset(page * size)
      .limit(size)
      .all()
    )

    return [
      {"id": pid, "nom": nom, "max": stock_max, "min": stock_min, "stock": float(stock or 0)}
      for pid, nom, stock_max, stock_min, stock in rows
    ], total

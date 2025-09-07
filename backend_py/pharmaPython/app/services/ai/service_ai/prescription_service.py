# app/services/prescription_service.py
from sqlalchemy.orm import Session

from app.services.ai.ocr_prescription import extract_text
from app.services.ai.rx_match import match_drug, build_product_index
from app.services.ai.rx_parse import parse_prescription_text


def analyze_prescription(db: Session, image_path: str):
  text = extract_text(image_path)
  items = parse_prescription_text(text)
  build_product_index(db)  # à mettre au startup + reload périodique en prod
  enriched = []
  for it in items:
    cands = match_drug(f"{it['drug']} {it['dosage']}".strip() or it['raw'])
    enriched.append({**it, "candidates": cands[:3]})
  return {"text": text, "lines": enriched}

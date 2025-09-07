# app/ai/ocr_prescription.py
from typing import List, Tuple
from paddleocr import PaddleOCR

# FR + angle, bon pour manuscrit mixte
_ocr = PaddleOCR(lang='fr', use_angle_cls=True, show_log=False)

def extract_text(image_path: str) -> str:
  result = _ocr.ocr(image_path)
  lines: List[str] = []
  for page in result:
    for (bbox, (txt, conf)) in page:
      if conf >= 0.3:
        lines.append(txt)
  return "\n".join(lines)

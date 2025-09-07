# app/ai/rx_parse.py
import re
from typing import List, Dict

_RX = re.compile(
  r"(?P<drug>[A-Za-zÀ-ÖØ-öø-ÿ\- ]+)\s*(?P<dosage>\d+\s?(?:mg|g|µg|UI|ml))?.*?(?P<freq>\d+\s?x\/?j|\d+\s?fois\/?j)?",
  flags=re.IGNORECASE
)

def parse_prescription_text(txt: str) -> List[Dict]:
  items = []
  for line in txt.splitlines():
    m = _RX.search(line)
    if not m:
      continue
    items.append({
      "raw": line.strip(),
      "drug": (m.group("drug") or "").strip(),
      "dosage": (m.group("dosage") or "").strip(),
      "frequency": (m.group("freq") or "").strip(),
    })
  return items

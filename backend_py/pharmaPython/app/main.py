from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse

from app.api.deps import get_db
from app.api.router import api_router
from app.core.config import settings

from pathlib import Path

from app.services.stock_alert_service import compute_and_store_alerts


def find_front_dist() -> Path:
  repo_root = Path(__file__).resolve().parents[2]  # ajuste si besoin
  candidates = [
    repo_root / "frontend" / "dist",
    repo_root / "front" / "dist",
    repo_root / "dist",
    repo_root / "public" / "browser",
    ]
  # direct index.html
  for c in candidates:
    if (c / "index.html").exists():
      return c
  # Angular 17+: */browser/index.html
  for c in candidates:
    for p in c.glob("*/emporium/browser/index.html"):
      return p.parent
  # */index.html
  for c in candidates:
    for p in c.glob("*/index.html"):
      return p.parent
  raise RuntimeError("Build Angular introuvable. Exécute 'ng build' et vérifie outputPath.")




app = FastAPI(title=settings.app_name)

# Middleware CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


# ---- 1) API sous /api
app.include_router(api_router)

# ---- 2) Angular (SPA) servi à la racine
REPO_ROOT = Path(__file__).resolve().parents[2]          # => .../pharmaNew
FRONT_DIST = REPO_ROOT / "dist" / "emporium" / "browser" # => .../pharmaNew/dist/emporium/browser

if not (FRONT_DIST / "index.html").exists():
  raise RuntimeError(f"index.html introuvable dans {FRONT_DIST}. Lance 'ng build' et vérifie le chemin.")

# Sert TOUS les fichiers statiques (chunks .js/.css) avec le bon Content-Type
app.mount("/", StaticFiles(directory=str(FRONT_DIST), html=True), name="spa")
# et un fallback "/" qui renvoie index.html


# (Optionnel) fallback explicite (html=True suffit normalement)
# app.mount("/static", StaticFiles(directory=str(FRONT_DIST), html=False), name="static")
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
  return FileResponse(FRONT_DIST / "index.html")


scheduler = BackgroundScheduler()

def job_compute_alerts():
  # SessionLocal = get_db_session_factory()
  db = get_db()
  try:
    compute_and_store_alerts(db)
  finally:
    db.close()

def start_scheduler():
  scheduler.add_job(job_compute_alerts, "interval", hours=6, id="alerts_job", replace_existing=True)
  scheduler.start()

@app.get("/health")
def health():
  return {"status": "ok"}

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

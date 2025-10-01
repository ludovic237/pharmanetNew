import sys
import threading
import webbrowser
import time
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

import passlib.handlers.bcrypt  # <-- force l’inclusion dans l’exe

# ---------- Localisation du build Angular ----------
def get_front_dist() -> Path:
  """
  - EXE --onefile : .../_MEIPASS/web
  - EXE --onedir  : <dossier_exe>/web
  - Dev           : <repo>/dist/emporium/browser
  """
  # PyInstaller --onefile
  if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    p = Path(sys._MEIPASS) / "web"
    if (p / "index.html").exists():
      return p

  # PyInstaller --onedir
  if getattr(sys, "frozen", False):
    p = Path(sys.executable).parent / "web"
    if (p / "index.html").exists():
      return p

  # Dev
  repo_root = Path(__file__).resolve().parents[2]
  p = repo_root / "dist" / "emporium" / "browser"
  if (p / "index.html").exists():
    return p

  raise RuntimeError(
    "index.html introuvable (ni dans 'web' packagé, ni dans dist/emporium/browser). "
    "Lance 'ng build' et vérifie le --add-data lors du build PyInstaller."
  )


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
# FRONT_DIST = REPO_ROOT / "dist" / "emporium" / "browser" # => .../pharmaNew/dist/emporium/browser
FRONT_DIST = get_front_dist()

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
  # ouvre le navigateur automatiquement
  threading.Thread(target=lambda: (time.sleep(1), webbrowser.open("http://127.0.0.1:8000"))).start()
  # uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
  uvicorn.run(
    app,
    host="127.0.0.1",
    port=8000,
    log_config=None,   # <<< kill uvicorn's default console logging
    access_log=False   # <<< optional: also silence access logs
  )

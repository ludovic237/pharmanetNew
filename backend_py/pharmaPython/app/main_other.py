import os
import shutil
import subprocess
import sys
import threading
import webbrowser
import time
from pathlib import Path

# # This is a sample Python script.
#
# # Press Shift+F10 to execute it or replace it with your code.
# # Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
#
#
# def print_hi(name):
#     # Use a breakpoint in the code line below to debug your script.
#     print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.
#
#
# # Press the green button in the gutter to run the script.
# if __name__ == '__main__':
#     print_hi('PyCharm')
#
# # See PyCharm help at https://www.jetbrains.com/help/pycharm/
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse

from app.api.deps import get_db
from app.api.router import api_router
from app.core.config import settings

from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from app.services.stock_alert_service import compute_and_store_alerts

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
# Montage des routes (équivalent @RestController scan)
app.include_router(api_router)

# ---- 2) Angular (SPA) servi à la racine
REPO_ROOT = Path(__file__).resolve().parents[3]          # => .../pharmaNew
FRONT_DIST = REPO_ROOT / "dist" / "emporium" / "browser" # => .../pharmaNew/dist/emporium/browser
# FRONT_DIST = get_front_dist()

# if not (FRONT_DIST / "index.html").exists():
#   raise RuntimeError(f"index.html introuvable dans {FRONT_DIST}. Lance 'ng build' et vérifie le chemin.")

# Sert TOUS les fichiers statiques (chunks .js/.css) avec le bon Content-Type
# app.mount("/", StaticFiles(directory=str(FRONT_DIST), html=True), name="spa")
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

def _which(exe_name: str):
  p = shutil.which(exe_name)
  return p if p else None

def find_browser_exe(name: str) -> str | None:
  name = (name or "").lower()
  # chemins probables (Windows)
  PF  = Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
  PFx = Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))

  CANDIDATES = {
    "firefox": [
      PF / "Mozilla Firefox" / "firefox.exe",
      PFx / "Mozilla Firefox" / "firefox.exe",
      ],
    "chrome": [
      PF / "Google" / "Chrome" / "Application" / "chrome.exe",
      PFx / "Google" / "Chrome" / "Application" / "chrome.exe",
      ],
    "edge": [
      PF / "Microsoft" / "Edge" / "Application" / "msedge.exe",
      PFx / "Microsoft" / "Edge" / "Application" / "msedge.exe",
      ],
  }

  # 1) chemins connus
  for p in CANDIDATES.get(name, []):
    if p.exists():
      return str(p)

  # 2) PATH
  exe = _which(f"{name}.exe")
  if exe:
    return exe

  return None

def open_url_in_preferred_browser(url: str, preferred: str = None):
  """
  preferred peut être: 'firefox', 'chrome', 'edge', 'default' ou None.
  On peut aussi définir PHARMANET_BROWSER dans l'environnement.
  """
  preferred = (preferred or os.environ.get("PHARMANET_BROWSER") or "firefox").lower()

  # cas 'default' → navigateur par défaut Windows
  if preferred in ("default", "system", "windows-default"):
    webbrowser.open(url)
    return

  exe = find_browser_exe(preferred)
  if exe:
    try:
      subprocess.Popen([exe, url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
      return
    except Exception:
      pass  # on retombe sur défaut

  # fallback navigateur par défaut
  webbrowser.open(url)

# Health check
@app.get("/health")
def health():
  return {"status": "ok"}

# Ce bloc permet de lancer directement avec "python app/main.py"
if __name__ == "__main__":
  import uvicorn

  port = 8000
  # avant: webbrowser.open("http://127.0.0.1:8000")
  # def delayed_open(url):
  #   time.sleep(1.0)
  #   open_url_in_preferred_browser(url, preferred="firefox")  # <-- ici tu choisis
  # threading.Thread(target=lambda: delayed_open(f"http://127.0.0.1:{port}"), daemon=True).start()

  # ouvre le navigateur automatiquement
  # threading.Thread(target=lambda: (time.sleep(1), webbrowser.open("http://127.0.0.1:8000"))).start()
  # uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
  uvicorn.run(
    "app.main:app",
    # app,
    host="127.0.0.1",
    port=8000,
    reload=True,
    # log_config=None,   # <<< kill uvicorn's default console logging
    access_log=False   # <<< optional: also silence access logs
  )
  # uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


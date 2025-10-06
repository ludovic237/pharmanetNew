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
from app.api.deps import get_db
from app.api.router import api_router
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

from app.services.stock_alert_service import compute_and_store_alerts

app = FastAPI(title=settings.app_name)

# Middleware CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Montage des routes (équivalent @RestController scan)
app.include_router(api_router)


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

# Health check
@app.get("/health")
def health():
  return {"status": "ok"}

# Ce bloc permet de lancer directement avec "python app/main.py"
if __name__ == "__main__":
  import uvicorn
  uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
  # uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

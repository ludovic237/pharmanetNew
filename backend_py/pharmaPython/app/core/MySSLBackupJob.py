import os
import subprocess
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.api.v1.db import SessionLocal
from app.models import Produit, EnRayon

BACKUP_DIR = "C:\\backups_mysql"
MYSQLDUMP_PATH = "C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe"
USER = "root"
PASSWORD = "root"
DATABASE = "nom_de_ta_base"

def backup_database():
  os.makedirs(BACKUP_DIR, exist_ok=True)
  file_name = f"backup_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.sql"
  file_path = os.path.join(BACKUP_DIR, file_name)

  process = subprocess.run(
    [MYSQLDUMP_PATH, f"-u{USER}", f"-p{PASSWORD}", DATABASE],
    stdout=open(file_path, "w"),
  )

  if process.returncode == 0:
    print(f"✅ Backup successful: {file_path}")
  else:
    print(f"❌ Backup failed with exit code: {process.returncode}")

def refresh_stock_product():
  db: Session = SessionLocal()
  produits = db.query(Produit).all()
  for produit in produits:
    en_rayon = db.query(EnRayon).filter(EnRayon.produit_id == produit.id).all()
    total_stock = sum(item.quantite_restante for item in en_rayon)
    produit.stock = total_stock
    db.add(produit)
  db.commit()
  db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(backup_database, "cron", hour=2)  # Every day at 2:00 AM
scheduler.add_job(refresh_stock_product, "cron", hour=2)  # Every day at 2:00 AM
scheduler.start()

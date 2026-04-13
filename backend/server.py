from dotenv import load_dotenv
import os
import logging
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
import resend

# --- 1. Inicializácia ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- 2. Konfigurácia ---
RESEND_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_KEY
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "info@penzionkastelan.sk")
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'kastelan_db')

# DÔLEŽITÉ: URL pre odkazy v e-maile
BASE_URL = "https://kastelan.onrender.com/api"
ADMIN_SECRET_TOKEN = "Kastelan123654" 

# --- 3. Databáza ---
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

ROOM_NAMES = {1: "Izba č.1", 2: "Izba č.2", 3: "Izba č.3", 4: "Izba č.4", 5: "Izba č.5"}

# --- MODELY DÁT (Pridané sem, aby zmizlo podčiarknutie) ---
class ReservationCreate(BaseModel):
    room_id: int
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    check_in: str
    check_out: str
    guests: int
    note: Optional[str] = None

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

# --- 4. Funkcie pre e-maily ---
async def send_reservation_emails(res_data: dict):
    """Odošle e-mail majiteľovi (s tlačidlami) aj hosťovi (bez tlačidiel)."""
    try:
        room = ROOM_NAMES.get(res_data["room_id"], "Izba")
        res_id = res_data["id"]

        # 1. E-mail pre MAJITEĽA (s tajným tokenom)
        confirm_url = f"{BASE_URL}/reservations/confirm/{res_id}?token={ADMIN_SECRET_TOKEN}"
        delete_url = f"{BASE_URL}/reservations/delete/{res_id}?token={ADMIN_SECRET_TOKEN}"

        owner_html = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; border-radius: 10px;">
            <h2 style="color: #065F46;">Nová rezervácia - Penzión Kastelán</h2>
            <p><strong>Hosť:</strong> {res_data['guest_name']}</p>
            <p><strong>Izba:</strong> {room}</p>
            <p><strong>Termín:</strong> {res_data['check_in']} až {res_data['check_out']}</p>
            <p><strong>E-mail:</strong> {res_data['guest_email']}</p>
            <p><strong>Telefón:</strong> {res_data['guest_phone']}</p>
            <hr />
            <div style="text-align: center; padding: 20px;">
                <p><strong>Chcete potvrdiť túto rezerváciu?</strong></p>
                <a href="{confirm_url}" style="background-color: #065F46; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">✅ POTVRDIŤ</a>
                <a href="{delete_url}" style="background-color: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">❌ ZAMIETNUŤ</a>
            </div>
        </div>
        """
        
        # Poslanie majiteľovi
        resend.Emails.send({
            "from": "Penzión Kastelán <info@send.penzionkastelan.sk>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Nová rezervácia - {res_data['guest_name']}",
            "html": owner_html
        })

        # 2. E-mail pre HOSŤA (čistý informačný)
        guest_html = f"""
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Dobrý deň, {res_data['guest_name']},</h2>
            <p>Ďakujeme za vašu žiadosť o rezerváciu v Penzióne Kastelán (Termín: {res_data['check_in']} - {res_data['check_out']}).</p>
            <p>Vašu požiadavku práve spracovávame. O potvrdení vás budeme informovať.</p>
        </div>
        """
        resend.Emails.send({
            "from": "Penzión Kastelán <info@send.penzionkastelan.sk>",
            "to": [res_data['guest_email']],
            "subject": "Prijatie žiadosti o rezerváciu - Penzión Kastelán",
            "html": guest_html
        })

        logger.info("✅ E-maily odoslané obom stranám.")
    except Exception as e:
        logger.error(f"❌ Chyba pri odosielaní e-mailov: {e}")

# --- 5. API Endpointy ---
api_router = APIRouter(prefix="/api")

@api_router.post("/reservations")
async def create_reservation(input: ReservationCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "room_id": input.room_id,
        "guest_name": input.guest_name,
        "guest_email": input.guest_email,
        "guest_phone": input.guest_phone,
        "check_in": input.check_in,
        "check_out": input.check_out,
        "guests": input.guests,
        "note": input.note,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reservations.insert_one(doc)
    asyncio.create_task(send_reservation_emails(doc))
    return {"status": "success"}

# --- ZABEZPEČENÉ POTVRDZOVANIE ---
@api_router.get("/reservations/confirm/{res_id}", response_class=HTMLResponse)
async def email_confirm_reservation(res_id: str, token: str = None):
    # KONTROLA HESLA (TOKENU)
    if token != ADMIN_SECRET_TOKEN:
        return "<html><body style='text-align:center;'><h1>❌ Nepovolený prístup</h1></body></html>"
    
    result = await db.reservations.update_one({"id": res_id}, {"$set": {"status": "confirmed"}})
    if result.modified_count > 0:
        return "<html><body style='text-align:center;padding:50px;'><h1>✅ Rezervácia potvrdená</h1><p>Termín bol zablokovaný.</p></body></html>"
    return "<html><body><h1>Rezervácia už bola spracovaná.</h1></body></html>"

@api_router.get("/reservations/delete/{res_id}", response_class=HTMLResponse)
async def email_delete_reservation(res_id: str, token: str = None):
    if token != ADMIN_SECRET_TOKEN:
        return "<html><body><h1>❌ Nepovolený prístup</h1></body></html>"
    
    await db.reservations.delete_one({"id": res_id})
    return "<html><body style='text-align:center;padding:50px;'><h1>❌ Rezervácia zrušená</h1></body></html>"

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup_db_test():
    try:
        await client.admin.command('ping')
        logger.info("✅ MongoDB pripojené!")
    except Exception as e:
        logger.error(f"❌ MongoDB error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
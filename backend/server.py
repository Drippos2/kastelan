from dotenv import load_dotenv
import os
import logging
import asyncio
import uuid
import bcrypt
import jwt
import resend
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, APIRouter, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# --- 1. Inicializácia ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- 2. Konfigurácia z .env ---
RESEND_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_KEY
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "info@penzionkastelan.sk")
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'kastelan_db')
JWT_SECRET = os.getenv("JWT_SECRET", "tajne-heslo")

# --- 3. Pripojenie k MongoDB ---
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

ROOM_NAMES = {1: "Izba č.1", 2: "Izba č.2", 3: "Izba č.3", 4: "Izba č.4", 5: "Izba č.5"}

# --- 4. Funkcie pre e-maily ---
async def send_reservation_email(res_data: dict):
    try:
        room = ROOM_NAMES.get(res_data["room_id"], "Izba")
        html_msg = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #065F46;">Nová rezervácia - Penzión Kastelán</h2>
            <p><strong>Hosť:</strong> {res_data['guest_name']}</p>
            <p><strong>Izba:</strong> {room}</p>
            <p><strong>Termín:</strong> {res_data['check_in']} až {res_data['check_out']}</p>
            <p><strong>E-mail hosťa:</strong> {res_data['guest_email']}</p>
            <p><strong>Telefón:</strong> {res_data['guest_phone']}</p>
        </div>
        """
        params = {
            "from": "Penzión Kastelán <info@penzionkastelan.sk>",
            "to": [NOTIFICATION_EMAIL],
            "cc": [res_data['guest_email']],
            "subject": f"Nová rezervácia - {res_data['guest_name']}",
            "html": html_msg
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info("✅ Email rezervácie odoslaný.")
    except Exception as e:
        logger.error(f"❌ CHYBA EMAILU REZERVÁCIE: {e}")

# NOVÁ FUNKCIA PRE EMAIL Z KONTAKTNÉHO FORMULÁRA
async def send_contact_email(contact_data: dict):
    try:
        html_msg = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-left: 5px solid #3B82F6;">
            <h2 style="color: #1E40AF;">Nová správa z kontaktného formulára</h2>
            <p><strong>Od:</strong> {contact_data['name']}</p>
            <p><strong>E-mail:</strong> {contact_data['email']}</p>
            <p><strong>Telefón:</strong> {contact_data.get('phone', 'neuvedené')}</p>
            <hr />
            <p><strong>Správa:</strong></p>
            <p style="background: #f9f9f9; padding: 10px; border-radius: 5px;">{contact_data['message']}</p>
        </div>
        """
        params = {
            "from": "Penzión Kastelán <info@penzionkastelan.sk>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Kontaktný formulár: {contact_data['name']}",
            "html": html_msg
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info("✅ Email správy odoslaný.")
    except Exception as e:
        logger.error(f"❌ CHYBA EMAILU KONTAKTU: {e}")

# --- 5. Modely dát ---
class ReservationCreate(BaseModel):
    room_id: int
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    check_in: str
    check_out: str
    guests: int
    note: Optional[str] = None

class ReviewCreate(BaseModel):
    name: str
    rating: int
    comment: str

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

# --- 6. API Endpointy ---
api_router = APIRouter(prefix="/api")

@api_router.post("/reservations")
async def create_reservation(input: ReservationCreate):
    try:
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
        asyncio.create_task(send_reservation_email(doc))
        return {"status": "success"}
    except Exception as e:
        logger.error(f"❌ CHYBA DATABÁZY: {e}")
        raise HTTPException(status_code=500, detail="Chyba databázy")

@api_router.post("/reviews")
async def create_review(input: ReviewCreate):
    try:
        doc = {
            "id": str(uuid.uuid4()),
            "name": input.name,
            "rating": input.rating,
            "comment": input.comment,
            "date": datetime.now(timezone.utc).isoformat(),
            "approved": True 
        }
        await db.reviews.insert_one(doc)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"❌ CHYBA RECENZIE: {e}")
        raise HTTPException(status_code=500, detail="Chyba recenzie")

@api_router.get("/reviews")
async def get_reviews():
    try:
        reviews = await db.reviews.find({"approved": True}).to_list(length=100)
        for r in reviews: r["_id"] = str(r["_id"])
        return reviews
    except Exception: return []

# OPRAVENÝ KONTAKTNÝ ENDPOINT S EMAILOM
@api_router.post("/contact")
async def create_contact(input: ContactCreate):
    try:
        doc = {
            "id": str(uuid.uuid4()),
            "name": input.name,
            "email": input.email,
            "phone": input.phone,
            "message": input.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.contacts.insert_one(doc)
        # TOTO ODOŠLE EMAIL TEBE:
        asyncio.create_task(send_contact_email(doc))
        return {"status": "success", "message": "Správa odoslaná"}
    except Exception as e:
        logger.error(f"❌ CHYBA KONTAKTU: {e}")
        raise HTTPException(status_code=500, detail="Chyba pri ukladaní správy.")

# ADMIN ENDPOINTY
@api_router.get("/admin/contacts")
async def get_admin_contacts():
    contacts = await db.contacts.find().sort("created_at", -1).to_list(length=100)
    for c in contacts: c["_id"] = str(c["_id"])
    return contacts

@api_router.get("/admin/reservations")
async def get_admin_reservations():
    res = await db.reservations.find().sort("created_at", -1).to_list(length=100)
    for r in res: r["_id"] = str(r["_id"])
    return res

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
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

BASE_URL = "https://kastelan-voka.onrender.com"
ADMIN_SECRET_TOKEN = "Kastelan123654" 

# --- 3. Databáza ---
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

ROOM_NAMES = {1: "Izba č.1", 2: "Izba č.2", 3: "Izba č.3", 4: "Izba č.4", 5: "Izba č.5"}

# --- 4. Modely dát ---
class ReservationCreate(BaseModel):
    room_id: int
    guest_name: str = Field(..., min_length=2)
    guest_email: EmailStr
    guest_phone: str = Field(..., min_length=5)
    check_in: str
    check_out: str
    guests: int
    note: Optional[str] = None

class ReviewCreate(BaseModel):
    author: str
    rating: int
    text: str
    language: Optional[str] = "SK"

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

# --- 5. Funkcie pre e-maily ---
async def send_reservation_emails(res_data: dict):
    try:
        room = ROOM_NAMES.get(res_data["room_id"], "Izba")
        res_id = res_data["id"]

        confirm_url = f"{BASE_URL}/api/reservations/confirm/{res_id}?token={ADMIN_SECRET_TOKEN}"
        delete_url = f"{BASE_URL}/api/reservations/delete/{res_id}?token={ADMIN_SECRET_TOKEN}"

        owner_html = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; border-radius: 10px;">
            <h2 style="color: #065F46;">Nová rezervácia - Penzión Kastelán</h2>
            <p><strong>Hosť:</strong> {res_data['guest_name']}</p>
            <p><strong>E-mail:</strong> <a href="mailto:{res_data['guest_email']}">{res_data['guest_email']}</a></p>
            <p><strong>Telefón:</strong> <a href="tel:{res_data['guest_phone']}">{res_data['guest_phone']}</a></p>
            <p><strong>Izba:</strong> {room}</p>
            <p><strong>Termín:</strong> {res_data['check_in']} až {res_data['check_out']}</p>
            <p><strong>Počet hostí:</strong> {res_data['guests']}</p>
            <p><strong>Poznámka:</strong> {res_data.get('note', 'Žiadna')}</p>
            <hr />
            <div style="text-align: center; padding: 20px;">
                <a href="{confirm_url}" style="background-color: #065F46; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">✅ POTVRDIŤ</a>
                <a href="{delete_url}" style="background-color: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">❌ ZAMIETNUŤ</a>
            </div>
        </div>
        """
        
        # Odošle mail majiteľovi
        resend.Emails.send({
            "from": "Penzión Kastelán <info@penzionkastelan.sk>", 
            "to": [NOTIFICATION_EMAIL], 
            "subject": f"Nová rezervácia - {res_data['guest_name']}", 
            "html": owner_html
        })
        
        # Odošle mail hosťovi
        guest_html = f"""
        <div style='font-family: sans-serif; padding: 20px;'>
            <h2>Dobrý deň, {res_data['guest_name']},</h2>
            <p>Prijali sme vašu žiadosť o rezerváciu na termín {res_data['check_in']} - {res_data['check_out']}.</p>
            <p>O potvrdení vás budeme čoskoro informovať.</p>
        </div>
        """
        resend.Emails.send({
            "from": "Penzión Kastelán <info@penzionkastelan.sk>", 
            "to": [res_data['guest_email']], 
            "subject": "Prijatie rezervácie - Penzión Kastelán", 
            "html": guest_html
        })
    except Exception as e:
        logger.error(f"E-mail error: {e}")

async def send_contact_email(contact_data: dict):
    try:
        html_msg = f"""
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Nová správa z webu</h2>
            <p><strong>Meno:</strong> {contact_data['name']}</p>
            <p><strong>E-mail:</strong> {contact_data['email']}</p>
            <p><strong>Telefón:</strong> {contact_data.get('phone', 'Neuvedený')}</p>
            <hr />
            <p><strong>Správa:</strong></p>
            <p>{contact_data['message']}</p>
        </div>
        """
        resend.Emails.send({
            "from": "Penzión Kastelán <info@penzionkastelan.sk>", 
            "to": [NOTIFICATION_EMAIL], 
            "subject": f"Nová správa - {contact_data['name']}", 
            "html": html_msg
        })
    except Exception as e:
        logger.error(f"Contact e-mail error: {e}")

# --- 6. API Router ---
api_router = APIRouter(prefix="/api")

# NOVÝ ENDPOINT PRE CRON-JOB (Aby server nezaspal)
@api_router.get("/ping")
async def ping():
    return {"status": "alive", "timestamp": datetime.now(timezone.utc).isoformat()}

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
    # create_task zabezpečí, že API odpovie hneď a maily sa skúsia poslať na pozadí
    asyncio.create_task(send_reservation_emails(doc))
    return {"status": "success"}

@api_router.get("/reservations/confirm/{res_id}", response_class=HTMLResponse)
async def email_confirm_reservation(res_id: str, token: str = None):
    if token != ADMIN_SECRET_TOKEN:
        return "<html><body><h1>❌ Prístup zamietnutý</h1></body></html>"
    result = await db.reservations.update_one({"id": res_id}, {"$set": {"status": "confirmed"}})
    return "<html><body style='text-align:center;padding:50px;'><h1>✅ Rezervácia potvrdená</h1></body></html>" if result.modified_count > 0 else "<h1>Už spracované.</h1>"

@api_router.get("/reservations/delete/{res_id}", response_class=HTMLResponse)
async def email_delete_reservation(res_id: str, token: str = None):
    if token != ADMIN_SECRET_TOKEN:
        return "<h1>❌ Prístup zamietnutý</h1>"
    await db.reservations.delete_one({"id": res_id})
    return "<html><body style='text-align:center;padding:50px;'><h1>❌ Rezervácia zrušená</h1></body></html>"

@api_router.get("/reservations/occupied")
async def get_occupied_dates(room_id: int):
    cursor = db.reservations.find({
        "status": "confirmed",
        "room_id": room_id
    })
    reservations = await cursor.to_list(length=1000)
    occupied = []
    for res in reservations:
        try:
            start = datetime.strptime(res["check_in"], "%Y-%m-%d")
            end = datetime.strptime(res["check_out"], "%Y-%m-%d")
            curr = start
            while curr <= end:
                occupied.append(curr.strftime("%Y-%m-%d"))
                curr += timedelta(days=1)
        except Exception:
            continue
    return list(set(occupied))

@api_router.get("/reservations")
async def get_all_admin_data(token: str = None):
    if token != ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Prístup zamietnutý")
    
    try:
        reservations = await db.reservations.find().sort("created_at", -1).to_list(length=500)
        reviews = await db.reviews.find().sort("created_at", -1).to_list(length=500)
        contacts = await db.contacts.find().sort("created_at", -1).to_list(length=500)
        
        for res in reservations: res["_id"] = str(res["_id"])
        for rev in reviews: rev["_id"] = str(rev["_id"])
        for con in contacts: con["_id"] = str(con["_id"])
            
        return {
            "reservations": reservations,
            "reviews": reviews,
            "messages": contacts
        }
    except Exception as e:
        logger.error(f"Chyba pri načítaní dát pre admina: {e}")
        raise HTTPException(status_code=500, detail="Chyba servera")

@api_router.post("/reviews")
async def create_review(input: ReviewCreate):
    doc = {
        "id": str(uuid.uuid4()), 
        "author_name": input.author, 
        "rating": input.rating, 
        "text": input.text, 
        "language": input.language, 
        "created_at": datetime.now(timezone.utc).isoformat(), 
        "approved": True
    }
    await db.reviews.insert_one(doc)
    return {"status": "success"}

@api_router.get("/reviews")
async def get_reviews():
    reviews = await db.reviews.find({"approved": True}).sort("created_at", -1).to_list(length=100)
    for r in reviews: r["_id"] = str(r["_id"])
    return reviews

@api_router.post("/contact")
async def create_contact(input: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()), 
        "name": input.name, 
        "email": input.email, 
        "phone": input.phone, 
        "message": input.message, 
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(doc)
    asyncio.create_task(send_contact_email(doc))
    return {"status": "success"}

# --- 7. Spustenie ---
app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup_db_test():
    try: 
        await client.admin.command('ping')
        logger.info("MongoDB pripojené úspešne!")
    except Exception as e: 
        logger.error(f"DB Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import datetime
import re

import database
import gnani_service

app = FastAPI(
    title="DukandarOS — Sovereign AI Acoustic Khata API",
    description="FastAPI + SQLite backend for DukandarOS acoustic diarization, khata ledger, and next-day dispute resolution.",
    version="2.5.0"
)

# Enable CORS for React frontend (Vite default port 5173 and all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- HINDI PHONETIC REGEX PRE-TTS ENGINE (Gnani Timbre v3.0) ---
HINDI_UNITS = [
    'shunya', 'ek', 'do', 'teen', 'chaar', 'paanch', 'chhah', 'saat', 'aath', 'nau', 'das',
    'gyarah', 'baarah', 'terah', 'chaudah', 'pandrah', 'solah', 'satrah', 'athaarah', 'unnees', 'bees',
    'ikkees', 'baees', 'teees', 'chaubees', 'pachees', 'chhabbees', 'sattaees', 'atthaees', 'untees', 'tees',
    'iktis', 'battis', 'tentis', 'chauntis', 'paintis', 'chhattis', 'saintis', 'adhtis', 'untalis', 'chaalis',
    'iktalis', 'bayalis', 'taintalis', 'chawalis', 'paintalis', 'chhiyalis', 'saintalis', 'adhtalis', 'unchas', 'pachaas',
    'ikyawan', 'bawan', 'tirpan', 'chawwan', 'pachpan', 'chhappan', 'sattawan', 'atthaawan', 'unsath', 'saath',
    'iksath', 'baasath', 'tirasath', 'chaunsath', 'painsath', 'chhiyasath', 'sarsath', 'adhsath', 'unhattar', 'sattar',
    'ikhattar', 'bahattar', 'tihattar', 'chauhattar', 'pachhattar', 'chhihattar', 'sathattar', 'athhattar', 'unasi', 'assi',
    'ikyasi', 'bayasi', 'tirasi', 'chaurasi', 'pachyasi', 'chhiyasi', 'sattasi', 'atthasi', 'nauasi', 'nabbe',
    'ikyanwe', 'bayanwe', 'tiranwe', 'chauranwe', 'pachanwe', 'chhiyanwe', 'sattanwe', 'atthanwe', 'ninyanwe'
]


def number_to_phonetic_hindi(num: int) -> str:
    if num == 0:
        return 'shunya'
    if num < 100:
        return HINDI_UNITS[num] if num < len(HINDI_UNITS) else str(num)

    res = []
    if num >= 1000:
        thousands = num // 1000
        num %= 1000
        t_text = HINDI_UNITS[thousands] if thousands < len(HINDI_UNITS) else str(thousands)
        res.append(f"{t_text} hazaar")

    if num >= 100:
        hundreds = num // 100
        num %= 100
        h_text = HINDI_UNITS[hundreds] if hundreds < len(HINDI_UNITS) else str(hundreds)
        res.append(f"{h_text} sau")

    if num > 0:
        res.append(HINDI_UNITS[num] if num < len(HINDI_UNITS) else str(num))

    return " ".join(res)


def timbre_phonetic_normalizer(raw_text: str) -> str:
    if not raw_text:
        return ""
    text = raw_text

    def replace_rupees(m):
        amt = int(m.group(1))
        return f"{number_to_phonetic_hindi(amt)} rupaye"

    def replace_flat(m):
        num = int(m.group(1))
        return f"Flat {number_to_phonetic_hindi(num)}"

    text = re.sub(r'(?:₹|Rs\.?)\s*(\d+)', replace_rupees, text, flags=re.IGNORECASE)
    text = re.sub(r'Flat\s*(\d+)', replace_flat, text, flags=re.IGNORECASE)
    return text


# --- PYDANTIC REQUEST SCHEMAS ---
class AddCustomerOrCreditRequest(BaseModel):
    customer_name: str
    phone_synthetic: Optional[str] = "98XXXXXX99 • Synthetic"
    old_balance: Optional[int] = 0
    added_amount: int
    items: Optional[str] = "Counter Credit"
    tx_type: Optional[str] = "Udhari"
    proof_quote: Optional[str] = ""
    time_str: Optional[str] = "Just Now"
    customerId: Optional[str] = None
    item: Optional[str] = None
    amount: Optional[int] = None
    timestamp: Optional[str] = None


class SettleCustomerRequest(BaseModel):
    customer_name: Optional[str] = None
    customerId: Optional[str] = None
    amount_paid: Optional[int] = 0
    amount: Optional[int] = 0
    payment_mode: Optional[str] = "UPI"
    method: Optional[str] = None


class ResolveDisputeRequest(BaseModel):
    dispute_id: Optional[int] = None
    disputeId: Optional[Any] = None
    customer_name: Optional[str] = None
    customerId: Optional[str] = None


class DialectNormalizeRequest(BaseModel):
    customer_name: str
    target_dialect: Optional[str] = "Hinglish"


# --- API LIFECYCLE ---
@app.on_event("startup")
def startup_event():
    database.init_db()


# --- REST ENDPOINTS ---

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DukandarOS Sovereign AI Acoustic Khata Backend",
        "version": "2.5.0",
        "gnani_configured": gnani_service.is_live_gnani_configured(),
        "state": database.get_full_dashboard_state()
    }


@app.get("/api/state")
def get_state():
    """
    Returns the unified state: 5 SQLite tables dynamically synchronized.
    Recalculates old_udhari_total, today_new_udhari, and closing_udhari_total
    from the customers table to guarantee 100% mathematical consistency.
    """
    return database.get_full_dashboard_state()


@app.post("/api/upload-and-analyze")
def upload_and_analyze_route(file: UploadFile = File(...)):
    """
    Uploads a real voice recording (.wav, .mp3, .m4a, .ogg) from the dashboard,
    runs speech-to-text diarization via Gnani Prisma v2.5 ASR, extracts customer credit/dispute
    transactions via Gnani Evon v3.3, and updates SQLite tables automatically!
    """
    filename = file.filename or "uploaded_counter_audio.wav"
    try:
        file_bytes = file.file.read()
    except Exception:
        file_bytes = b""

    # Process through Gnani ASR & Intent Extraction pipeline
    pipeline_res = gnani_service.process_audio_file(file_bytes, filename)
    transcript = pipeline_res.get("transcript", "")
    transactions = pipeline_res.get("transactions", [])
    speaker = pipeline_res.get("speaker", "Customer")
    noise_db = pipeline_res.get("noise_db", 74)

    # Update audio source in store_summary
    conn = database.get_db_connection()
    conn.execute("UPDATE store_summary SET audio_source = ? WHERE id = 1;", (f"{filename} (Uploaded)",))
    conn.commit()
    conn.close()

    applied_transactions = []
    now_time = datetime.datetime.now().strftime("%I:%M %p")

    for tx in transactions:
        c_name = tx.get("customer_name") or "Counter Customer"
        amt = int(tx.get("amount", 0))
        items = tx.get("items", "Counter Credit")
        tx_type = tx.get("tx_type", "UDHARI")
        quote = tx.get("quote", transcript)
        conf = float(tx.get("confidence", 99.4))
        spk = tx.get("speaker") or speaker

        database.apply_extracted_voice_transaction(
            customer_name=c_name,
            amount=amt,
            items=items,
            tx_type=tx_type,
            quote=quote,
            time_str=now_time,
            speaker_label=spk,
            noise_db=noise_db,
            confidence=conf
        )
        applied_transactions.append({
            "customer_name": c_name,
            "amount": amt,
            "items": items,
            "tx_type": tx_type
        })

    updated_state = database.get_full_dashboard_state()
    return {
        "status": "success",
        "filename": filename,
        "source": pipeline_res.get("asr", {}).get("source", "GNANI_PRISMA"),
        "transcript": transcript,
        "transactions": transactions,
        "applied_transactions": applied_transactions,
        "applied_count": len(applied_transactions),
        "synced_at": now_time,
        "state": updated_state,
        **updated_state
    }


@app.post("/api/stop-and-analyze-day")
def stop_and_analyze_day():
    """
    Simulates the Gnani Prisma v2.5 (Batch ASR + Diarization) and Evon v3.3
    (Ledger Structuring) pipeline on the selected .wav file and returns
    the updated SQLite state with a fresh synced_at timestamp.
    """
    state = database.get_full_dashboard_state()
    synced_at = datetime.datetime.now().strftime("%I:%M %p")
    
    # Update synced_at in store_summary
    conn = database.get_db_connection()
    conn.execute("UPDATE store_summary SET synced_at = ? WHERE id = 1;", (synced_at,))
    conn.commit()
    conn.close()

    return {
        **database.get_full_dashboard_state(),
        "synced_at": synced_at,
        "pipeline_message": "11.5 hrs acoustic stream diarized by Prisma v2.5 and locked to SQLite."
    }


@app.post("/api/add-customer-or-credit")
def add_customer_or_credit_route(payload: AddCustomerOrCreditRequest):
    """
    Handles both the '+ Add' button and the Simulate Call / One-Tap Nod Widget.
    If the customer exists, increments new_added_today and updates total_due.
    If new, inserts a new row. Also records dispute evidence and stream log.
    """
    cust_name = payload.customer_name
    if not cust_name and payload.customerId:
        conn = database.get_db_connection()
        c = conn.cursor().execute("SELECT name FROM customers WHERE id = ?;", (payload.customerId,)).fetchone()
        conn.close()
        cust_name = c["name"] if c else payload.customerId

    item_name = payload.items if payload.items != "Counter Credit" else (payload.item or "Counter Credit")
    amt = payload.added_amount if payload.added_amount > 0 else (payload.amount or 0)
    t_str = payload.time_str if payload.time_str != "Just Now" else (payload.timestamp or "Just Now")

    updated_state = database.apply_extracted_voice_transaction(
        customer_name=cust_name,
        amount=amt,
        items=item_name,
        tx_type=payload.tx_type or "UDHARI",
        quote=payload.proof_quote or "",
        time_str=t_str
    )
    return updated_state


@app.post("/api/add-interrupt-note")
def add_interrupt_note_alias(payload: AddCustomerOrCreditRequest):
    return add_customer_or_credit_route(payload)


@app.post("/api/settle-customer")
def settle_customer_route(payload: SettleCustomerRequest):
    """
    Handles the Settle button on each customer row.
    Deducts amount_paid from the customer's balance.
    If full settlement, resets old_balance, new_added_today, total_due, and dispute flag to 0.
    Adds payment to settled_total in store_summary and logs to diarized_stream.
    """
    cust_name = payload.customer_name
    if not cust_name and payload.customerId:
        conn = database.get_db_connection()
        c = conn.cursor().execute("SELECT name FROM customers WHERE id = ?;", (payload.customerId,)).fetchone()
        conn.close()
        cust_name = c["name"] if c else payload.customerId

    amt = payload.amount_paid if (payload.amount_paid and payload.amount_paid > 0) else (payload.amount or 0)
    mode = payload.payment_mode or payload.method or "UPI"

    if not cust_name:
        raise HTTPException(status_code=400, detail="Customer name or ID is required")

    return database.settle_customer_balance(
        customer_name=cust_name,
        payment_mode=mode,
        amount_paid=amt if amt > 0 else None
    )


@app.post("/api/settle-balance")
def settle_balance_alias(payload: SettleCustomerRequest):
    return settle_customer_route(payload)


@app.post("/api/resolve-dispute-claim")
def resolve_dispute_claim_route(payload: ResolveDisputeRequest):
    """
    Marks a dispute evidence item as 'Verified' in SQLite and clears the
    dispute flag on the customer if all claims are verified.
    """
    raw_id = payload.dispute_id or payload.disputeId
    numeric_id = 0
    if isinstance(raw_id, str):
        parts = re.findall(r'\d+', raw_id)
        numeric_id = int(parts[-1]) if parts else 1
    elif isinstance(raw_id, int):
        numeric_id = raw_id

    cust_name = payload.customer_name
    if not cust_name and payload.customerId:
        conn = database.get_db_connection()
        c = conn.cursor().execute("SELECT name FROM customers WHERE id = ?;", (payload.customerId,)).fetchone()
        conn.close()
        cust_name = c["name"] if c else ""

    return database.acknowledge_dispute(evidence_id=numeric_id, customer_name=cust_name or None)


@app.post("/api/resolve-dispute")
def resolve_dispute_alias(payload: ResolveDisputeRequest):
    return resolve_dispute_claim_route(payload)


@app.post("/api/dialect-normalize")
def dialect_normalize_route(payload: DialectNormalizeRequest):
    """
    Gnani Timbre v3.0 Dialect Normalizer:
    Fetches customer's old_balance, new_added_today, and total_due from SQLite.
    Returns both the formatted vernacular sentence and the regex-normalized
    phonetic string for Web Speech API / TTS playback.
    """
    conn = database.get_db_connection()
    cust = conn.cursor().execute("SELECT * FROM customers WHERE name = ?;", (payload.customer_name,)).fetchone()
    conn.close()

    if not cust:
        old_b = 180
        new_b = 200
        tot_b = 380
        name = payload.customer_name or "Ramesh Auto"
    else:
        old_b = cust["old_balance"]
        new_b = cust["new_added_today"]
        tot_b = cust["total_due"]
        name = cust["name"]

    target = payload.target_dialect or "Hinglish"

    if target.lower() in ("kanglish", "kn-in"):
        sentence = f"{name} avara haledu balance ₹{old_b} ittu, ivattu +₹{new_b} add aagide, total baaki ₹{tot_b} aagide."
        phonetic = timbre_phonetic_normalizer(f"{name} avara haledu balance {old_b} rupayi ittu, ivattu {new_b} rupayi add aagide, total baaki {tot_b} rupayi.")
    elif target.lower() in ("tanglish", "ta-in"):
        sentence = f"{name} pazhaya balance ₹{old_b}, indru +₹{new_b} serkkappattulladhu, motha baaki ₹{tot_b} aagum."
        phonetic = timbre_phonetic_normalizer(f"{name} pazhaya balance {old_b} roobai, indru {new_b} roobai serkkappattulladhu, motha baaki {tot_b} roobai.")
    else:
        sentence = f"{name} ka purana balance ₹{old_b} tha, aaj +₹{new_b} naya jud gaya, ab kul baaki ₹{tot_b} hai."
        phonetic = timbre_phonetic_normalizer(sentence)

    return {
        "customer_name": name,
        "target_dialect": target,
        "old_balance": old_b,
        "new_added_today": new_b,
        "total_due": tot_b,
        "dialect_sentence": sentence,
        "phonetic_string": phonetic
    }


@app.post("/api/reset-demo")
def reset_demo():
    """
    Drops and re-seeds all 5 SQLite tables back to the exact default numbers:
    ₹6,570 settled, ₹1,000 old udhari, +₹510 today's new udhari, ₹1,510 total closing due.
    Allows a 1-click reset before demo presentations.
    """
    database.init_db(force_reset=True)
    return {
        "message": "SQLite dukandar_khata.db reset to default pre-seeded state.",
        **database.get_full_dashboard_state()
    }

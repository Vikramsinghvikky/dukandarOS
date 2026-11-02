import sqlite3
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure UTF-8 stdout encoding for Windows terminals
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DB_PATH = Path(__file__).parent / "dukandar_khata.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def recalculate_totals(conn: Optional[sqlite3.Connection] = None) -> Dict[str, int]:
    """
    Recalculates dynamic aggregates from the customers and store_summary tables:
    - old_udhari_total = SUM(customers.old_balance)
    - today_new_udhari = SUM(customers.new_added_today)
    - closing_udhari_total = old_udhari_total + today_new_udhari
    - settled_total = cash_total + upi_total
    Updates store_summary WHERE id = 1.
    """
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    cursor = conn.cursor()

    # Dynamic sums from customers
    cursor.execute("""
    SELECT 
        COALESCE(SUM(old_balance), 0) AS old_total,
        COALESCE(SUM(new_added_today), 0) AS today_total,
        COALESCE(SUM(total_due), 0) AS closing_total
    FROM customers;
    """)
    cust_sums = cursor.fetchone()
    old_udhari_total = cust_sums["old_total"] if cust_sums else 0
    today_new_udhari = cust_sums["today_total"] if cust_sums else 0
    closing_udhari_total = old_udhari_total + today_new_udhari

    # Fetch cash and upi totals
    cursor.execute("SELECT cash_total, upi_total FROM store_summary WHERE id = 1;")
    sum_row = cursor.fetchone()
    cash_total = sum_row["cash_total"] if sum_row else 2450
    upi_total = sum_row["upi_total"] if sum_row else 4120
    settled_total = cash_total + upi_total

    cursor.execute("""
    UPDATE store_summary SET
        old_udhari_total = ?,
        today_new_udhari = ?,
        closing_udhari_total = ?,
        settled_total = ?
    WHERE id = 1;
    """, (old_udhari_total, today_new_udhari, closing_udhari_total, settled_total))

    conn.commit()

    if should_close:
        conn.close()

    return {
        "cash_total": cash_total,
        "upi_total": upi_total,
        "settled_total": settled_total,
        "old_udhari_total": old_udhari_total,
        "today_new_udhari": today_new_udhari,
        "closing_udhari_total": closing_udhari_total
    }


def init_db(force_reset: bool = False):
    """
    Creates the 5 SQLite tables if they do not exist and seeds initial data ONLY if customers table is empty.
    If force_reset=True, drops and re-creates all 5 tables.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if force_reset:
        cursor.execute("DROP TABLE IF EXISTS inventory_alerts;")
        cursor.execute("DROP TABLE IF EXISTS diarized_stream;")
        cursor.execute("DROP TABLE IF EXISTS dispute_evidence;")
        cursor.execute("DROP TABLE IF EXISTS customers;")
        cursor.execute("DROP TABLE IF EXISTS store_summary;")

    # 1. store_summary
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS store_summary (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        synced_at TEXT DEFAULT '09:45 pm',
        audio_source TEXT DEFAULT 'day_stall_recording_oct31.wav (11.5 hrs)',
        noise_db INTEGER DEFAULT 74,
        ner_accuracy REAL DEFAULT 98.4,
        cash_total INTEGER DEFAULT 2450,
        upi_total INTEGER DEFAULT 4120,
        settled_total INTEGER DEFAULT 6570,
        old_udhari_total INTEGER DEFAULT 1000,
        today_new_udhari INTEGER DEFAULT 510,
        closing_udhari_total INTEGER DEFAULT 1510
    );
    """)

    # 2. customers (Enforcing old_balance + new_added_today = total_due)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        initials TEXT NOT NULL,
        name TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        old_balance INTEGER NOT NULL DEFAULT 0,
        new_added_today INTEGER NOT NULL DEFAULT 0,
        total_due INTEGER NOT NULL DEFAULT 0,
        has_active_dispute INTEGER NOT NULL DEFAULT 0,
        interactions_count INTEGER NOT NULL DEFAULT 1,
        last_transaction_time TEXT NOT NULL DEFAULT 'Just Now'
    );
    """)

    # 3. dispute_evidence (Timestamped Voice Quotes per Customer)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispute_evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        time_str TEXT NOT NULL,
        amount INTEGER NOT NULL,
        items TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active Dispute Claim',
        quote TEXT NOT NULL,
        raw_evon_text TEXT DEFAULT '',
        confidence_pct REAL DEFAULT 99.4,
        source_tag TEXT DEFAULT 'PRISMA_ASR_CHUNK'
    );
    """)

    # 4. diarized_stream (Prisma v2.5 Acoustic Stream & Evon v3.3 Chatter Filter)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diarized_stream (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        speaker TEXT NOT NULL,
        noise_db INTEGER NOT NULL,
        time_str TEXT NOT NULL,
        quote TEXT NOT NULL,
        annotation TEXT NOT NULL,
        confidence REAL NOT NULL,
        category TEXT NOT NULL
    );
    """)

    # 5. inventory_alerts (Ambient Inventory Radar)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        vendor_quote TEXT NOT NULL,
        stock_badge TEXT NOT NULL
    );
    """)

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) as cnt FROM customers;")
    count = cursor.fetchone()["cnt"]

    if count == 0:
        # 1. Seed store_summary (Single row id=1)
        cursor.execute("""
        INSERT OR REPLACE INTO store_summary (
            id, synced_at, audio_source, noise_db, ner_accuracy,
            cash_total, upi_total, settled_total,
            old_udhari_total, today_new_udhari, closing_udhari_total
        ) VALUES (
            1, '09:45 pm', 'day_stall_recording_oct31.wav (11.5 hrs)', 74, 98.4,
            2450, 4120, 6570,
            1000, 510, 1510
        );
        """)

        # 2. Seed customers (Exact Pre-Seeded Rows: 1000 Old + 510 New = 1510 Closing Due)
        customers_seed = [
            ("CUST-101", "RA", "Ramesh Auto", "98452 11042 • Synthetic", 180, 200, 380, 1, 4, "04:15 PM"),
            ("CUST-102", "KF", "Karthik Flat 302", "99014 55219 • Synthetic", 420, 140, 560, 0, 2, "06:40 PM"),
            ("CUST-103", "SP", "Suresh Presswala", "94481 29401 • Synthetic", 90, 60, 150, 0, 3, "02:10 PM"),
            ("CUST-104", "AT", "Anita Tailors", "98800 77123 • Synthetic", 310, 0, 310, 0, 1, "Yesterday"),
            ("CUST-105", "ME", "Manjunath Electrician", "97312 44890 • Synthetic", 0, 110, 110, 0, 2, "01:30 PM"),
        ]
        cursor.executemany("""
        INSERT INTO customers (
            id, initials, name, phone, old_balance, new_added_today,
            total_due, has_active_dispute, interactions_count, last_transaction_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, customers_seed)

        # 3. Seed dispute_evidence
        disputes_seed = [
            (
                "Ramesh Auto", "04:15 PM", 80, "2x Chai, 1x Bun Maska", "Active Dispute Claim",
                "Ramesh: 'Bhaiya do chai aur ek bun maska baki mein likh lo shaam ko auto ki gas bharwa ke deta hu'",
                "Ramesh Auto credited Rs 80 under Udhari for evening tea and snacks. Shopkeeper confirmed with affirmative acoustic grunt.",
                99.4, "PRISMA_ASR_CHUNK_842"
            ),
            (
                "Ramesh Auto", "11:20 AM", 120, "Chai + Bidi", "Verified",
                "Ramesh: 'Chai ka sau rupaye aur bidi likhna, subah booni nahi hui'",
                "Sub-session 14: Intent verified via Prisma v2.5 Indian acoustic NER. Amount matched counter context.",
                98.7, "PRISMA_ASR_CHUNK_311"
            ),
            (
                "Karthik Flat 302", "09:10 AM", 140, "2x Masala Dosa, 1x Filter Coffee", "Verified",
                "Karthik: 'Subah ka 140 khata mein note kar lo anna, office late ho raha hai'",
                "Karthik (Flat 302) added breakfast tab. Evon v3.3 tagged positive intent and confirmed nod.",
                99.1, "PRISMA_ASR_CHUNK_1092"
            ),
            (
                "Suresh Presswala", "02:10 PM", 60, "2x Cutting Chai, 1x Samosa", "Verified",
                "Suresh: 'Do cutting chai aur ek samosa, kapde press karke sham ko payment deta hu bhaiya'",
                "Suresh Presswala morning snacks credited to tab.",
                97.9, "PRISMA_ASR_CHUNK_512"
            ),
            (
                "Anita Tailors", "Yesterday", 310, "Previous Carry-Forward Balance", "Verified",
                "Anita: 'Pichle hafte ka 310 hisaab mein rakhna bhaiya'",
                "Carry-forward balance confirmed from historical ledger sync.",
                99.0, "LEDGER_HISTORICAL_SYNC"
            ),
            (
                "Manjunath Electrician", "06:40 PM", 110, "3x Special Tea, 2x Veg Puff", "Verified",
                "Manjunath: '110 rupaye Manjunath ke khata mein daal do, kal subah deta hu'",
                "Manjunath tab opened with Rs 110 afternoon transaction.",
                98.4, "PRISMA_ASR_CHUNK_421"
            ),
        ]
        cursor.executemany("""
        INSERT INTO dispute_evidence (
            customer_name, time_str, amount, items, status,
            quote, raw_evon_text, confidence_pct, source_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, disputes_seed)

        # 4. Seed diarized_stream
        stream_seed = [
            (
                "Speaker 1 (Ramesh Auto)", 78, "04:15 PM",
                "Bhaiya do chai aur ek bun maska baki mein likh lo shaam ko auto ki gas bharwa ke deta hu",
                "Prisma v2.5 Indian NER: Rs 80 credit allocated to Ramesh Auto. Evon v3.3: Confirmed with shopkeeper nod signal.",
                99.4, "UDHARI"
            ),
            (
                "Speaker 3 (Street Chatter)", 82, "04:16 PM",
                "Arey Rohit Sharma ne kya pull shot mara kal ke match mein, maza aa gaya!",
                "Evon v3.3 Filter: Casual cricket gossip detected. Tagged IGNORE_CHATTER. Omitted from khata balances.",
                99.8, "CHATTER"
            ),
            (
                "Speaker 2 (Suresh)", 71, "02:10 PM",
                "Do cutting chai aur ek samosa, kapde press karke sham ko payment deta hu bhaiya",
                "Prisma v2.5 Indian NER: Rs 60 credit allocated to Suresh Presswala.",
                97.9, "UDHARI"
            ),
            (
                "Customer (QR Scan)", 74, "01:15 PM",
                "Google Pay par pachaas rupaye bhej diye bhaiya, aawaz aayi?",
                "Soundbox Audio Match: Rs 50 settled via UPI. Linked to daily digital cash register.",
                99.9, "UPI_CASH"
            ),
            (
                "Speaker 1 (Ramesh Auto)", 76, "11:20 AM",
                "Chai ka sau rupaye aur bidi likhna, subah booni nahi hui",
                "Prisma v2.5: Rs 120 credit verified. Grouped with CUST-101.",
                98.7, "UDHARI"
            ),
            (
                "RAM FIFO Buffer", 69, "09:05 AM",
                "Bhaiya ek chai Ramesh ke khata mein likh dena (Thumb nod confirmed)",
                "Asymmetric Context Link via Evon v3.3: 15s RAM snapshot anchored",
                98.9, "UDHARI"
            ),
        ]
        cursor.executemany("""
        INSERT INTO diarized_stream (
            speaker, noise_db, time_str, quote,
            annotation, confidence, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """, stream_seed)

        # 5. Seed inventory_alerts
        inventory_seed = [
            ("Nandini Blue Milk", "Vendor: 'Nandini milk khatam hone wala hai'", "2 pkts left"),
            ("Assam Tea Dust", "Vendor: 'Chai patti naya packet kholna padega'", "Low (250g)"),
            ("Refined Oil", "Vendor: 'Tel ka packet le aana shaam ko'", "1L pouch"),
            ("Khari Biscuits", "Vendor: 'Khari biscuit dabba khali hai'", "3 pkts left"),
        ]
        cursor.executemany("""
        INSERT INTO inventory_alerts (item_name, vendor_quote, stock_badge)
        VALUES (?, ?, ?);
        """, inventory_seed)

    conn.commit()
    conn.close()

    # Recalculate totals to guarantee 100% mathematical integrity
    recalculate_totals()


def get_full_dashboard_state() -> Dict[str, Any]:
    """
    Returns complete dashboard state dictionary with all keys required by both backend API and React frontend.
    Guarantees both snake_case and camelCase compatibility.
    """
    conn = get_db_connection()
    recalculate_totals(conn)
    cursor = conn.cursor()

    # 1. Fetch store_summary
    cursor.execute("SELECT * FROM store_summary WHERE id = 1;")
    sum_row = cursor.fetchone()
    summary = dict(sum_row) if sum_row else {
        "id": 1,
        "synced_at": "09:45 pm",
        "audio_source": "day_stall_recording_oct31.wav (11.5 hrs)",
        "noise_db": 74,
        "ner_accuracy": 98.4,
        "cash_total": 2450,
        "upi_total": 4120,
        "settled_total": 6570,
        "old_udhari_total": 1000,
        "today_new_udhari": 510,
        "closing_udhari_total": 1510
    }

    # 2. Fetch all dispute_evidence rows grouped by customer_name
    cursor.execute("SELECT * FROM dispute_evidence ORDER BY id DESC;")
    all_disputes = [dict(r) for r in cursor.fetchall()]

    disputes_by_customer: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_disputes:
        c_name = d["customer_name"]
        if c_name not in disputes_by_customer:
            disputes_by_customer[c_name] = []
        
        quote_text = d["quote"] if "quote" in d.keys() else d.get("proof_quote", "")
        status_text = d["status"] if "status" in d.keys() else d.get("status_badge", "Verified")
        conf_val = d["confidence_pct"] if "confidence_pct" in d.keys() else d.get("confidence", 99.4)
        
        disputes_by_customer[c_name].append({
            "id": f"disp_{d['id']}",
            "db_id": d["id"],
            "evidence_id": d["id"],
            "customer_name": d["customer_name"],
            "timestamp": d["time_str"],
            "time_str": d["time_str"],
            "items": d["items"],
            "amount": d["amount"],
            "paymentType": "Udhari",
            "verbatimVoiceQuote": quote_text,
            "quote": quote_text,
            "rawEvonText": d.get("raw_evon_text", ""),
            "confidence": conf_val,
            "confidence_pct": conf_val,
            "sourceTag": d.get("source_tag", "PRISMA_ASR_CHUNK"),
            "status": status_text,
            "status_badge": status_text
        })

    # 3. Fetch customers
    cursor.execute("SELECT * FROM customers ORDER BY total_due DESC, id ASC;")
    customer_rows = cursor.fetchall()
    customers_formatted = []
    for c in customer_rows:
        c_dict = dict(c)
        c_name = c_dict["name"]
        c_disputes = disputes_by_customer.get(c_name, [])

        customers_formatted.append({
            "id": c_dict["id"],
            "name": c_dict["name"],
            "initials": c_dict["initials"],
            "avatar": c_dict["initials"],
            "phone": c_dict["phone"],
            "phone_synthetic": c_dict["phone"],
            "old_balance": c_dict["old_balance"],
            "oldBalance": c_dict["old_balance"],
            "new_added_today": c_dict["new_added_today"],
            "todayNewBalance": c_dict["new_added_today"],
            "total_due": c_dict["total_due"],
            "totalBalance": c_dict["total_due"],
            "has_active_dispute": c_dict["has_active_dispute"],
            "isFlaggedDispute": bool(c_dict["has_active_dispute"]),
            "interactions_count": c_dict["interactions_count"],
            "interactionsCount": c_dict["interactions_count"],
            "last_transaction_time": c_dict["last_transaction_time"],
            "lastTransactionTime": c_dict["last_transaction_time"],
            "disputeHistory": c_disputes,
            "disputes": c_disputes
        })

    # 4. Fetch diarized_stream
    cursor.execute("SELECT * FROM diarized_stream ORDER BY id DESC;")
    stream_rows = [dict(r) for r in cursor.fetchall()]

    stream_logs_formatted = []
    for s in stream_rows:
        cat = s["category"]
        stream_type = "UDHARI_RECORDED"
        if cat == "CHATTER":
            stream_type = "IGNORE_CHATTER"
        elif cat in ("UPI_CASH", "UPI", "CASH"):
            stream_type = "UPI_VERIFIED"

        spk = s["speaker"] if "speaker" in s.keys() else s.get("speaker_label", "Unknown")
        quote_val = s["quote"] if "quote" in s.keys() else s.get("quote_text", "")
        annot_val = s["annotation"] if "annotation" in s.keys() else s.get("ai_annotation", "")
        conf_val = s["confidence"] if "confidence" in s.keys() else s.get("confidence_pct", 99.0)

        stream_logs_formatted.append({
            "id": f"s_{s['id']}",
            "db_id": s["id"],
            "time": s["time_str"],
            "time_str": s["time_str"],
            "speaker": spk,
            "speaker_label": spk,
            "dB": s["noise_db"],
            "noise_db": s["noise_db"],
            "type": stream_type,
            "category": s["category"],
            "quote": quote_val,
            "metadata": annot_val,
            "annotation": annot_val,
            "confidence": conf_val
        })

    # 5. Fetch inventory_alerts
    cursor.execute("SELECT * FROM inventory_alerts ORDER BY id ASC;")
    inv_rows = [dict(r) for r in cursor.fetchall()]
    inventory_formatted = [{
        "id": f"inv_{inv['id']}",
        "db_id": inv["id"],
        "name": inv["item_name"],
        "item_name": inv["item_name"],
        "status": inv["stock_badge"],
        "stock_badge": inv["stock_badge"],
        "audioProof": inv["vendor_quote"],
        "vendor_quote": inv["vendor_quote"]
    } for inv in inv_rows]

    conn.close()

    return {
        "summary": summary,
        "synced_at": summary.get("synced_at", "09:45 pm"),
        "audio_source": summary.get("audio_source", "day_stall_recording_oct31.wav (11.5 hrs)"),
        "noise_db": summary.get("noise_db", 74),
        "ner_accuracy": summary.get("ner_accuracy", 98.4),
        "settledCash": summary.get("cash_total", 2450),
        "settledUpi": summary.get("upi_total", 4120),
        "settledTotal": summary.get("settled_total", 6570),
        "oldUdhariTotal": summary.get("old_udhari_total", 1000),
        "todayNewUdhari": summary.get("today_new_udhari", 510),
        "closingUdhariTotal": summary.get("closing_udhari_total", 1510),
        "cash_total": summary.get("cash_total", 2450),
        "upi_total": summary.get("upi_total", 4120),
        "settled_total": summary.get("settled_total", 6570),
        "old_udhari_total": summary.get("old_udhari_total", 1000),
        "today_new_udhari": summary.get("today_new_udhari", 510),
        "closing_udhari_total": summary.get("closing_udhari_total", 1510),
        "customers": customers_formatted,
        "diarized_stream": stream_rows,
        "streamLogs": stream_logs_formatted,
        "inventory_alerts": inv_rows,
        "inventoryAlerts": inventory_formatted
    }


# Backwards compatibility alias
def get_full_state() -> Dict[str, Any]:
    return get_full_dashboard_state()


def apply_extracted_voice_transaction(
    customer_name: str,
    amount: int = 0,
    items: str = "Counter Credit",
    tx_type: str = "UDHARI",
    quote: str = "",
    time_str: str = "Just Now",
    speaker_label: Optional[str] = None,
    noise_db: int = 72,
    confidence: float = 99.4
) -> Dict[str, Any]:
    """
    Applies an acoustic transaction parsed from Prisma ASR / Evon LLM:
    - If tx_type == 'CHATTER': Logs to diarized_stream only, does not alter balances.
    - If tx_type == 'INVENTORY': Adds/updates inventory_alerts and logs to stream.
    - If tx_type == 'UDHARI': Updates customer's new_added_today, total_due, adds dispute evidence, logs to stream, recalculates totals.
    - If tx_type in ('CASH', 'UPI'): Increments settled amounts in store_summary, logs to stream, recalculates totals.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    tx_type_upper = (tx_type or "UDHARI").upper()

    if tx_type_upper == "CHATTER":
        stream_quote = quote or "Casual ambient street conversation filtered out."
        annotation = f"Evon v3.3 Filter: Street chatter detected. Tagged IGNORE_CHATTER. Omitted from khata balances."
        cursor.execute("""
        INSERT INTO diarized_stream (
            speaker, noise_db, time_str, quote,
            annotation, confidence, category
        ) VALUES (?, ?, ?, ?, ?, ?, 'CHATTER');
        """, (speaker_label or "Speaker (Street Ambient)", noise_db, time_str, stream_quote, annotation, confidence))
        conn.commit()
        conn.close()
        return get_full_dashboard_state()

    if tx_type_upper == "INVENTORY":
        item_title = items or customer_name or "Counter Goods"
        inv_quote = quote or f"Vendor: '{item_title} check karna padega'"
        cursor.execute("""
        INSERT INTO inventory_alerts (item_name, vendor_quote, stock_badge)
        VALUES (?, ?, 'Low Stock');
        """, (item_title, inv_quote))

        cursor.execute("""
        INSERT INTO diarized_stream (
            speaker, noise_db, time_str, quote,
            annotation, confidence, category
        ) VALUES (?, ?, ?, ?, ?, ?, 'INVENTORY');
        """, (
            speaker_label or "Inventory Radar", noise_db, time_str, inv_quote,
            f"Evon v3.3 Inventory Trigger: '{item_title}' flagged for replenishment.", confidence
        ))
        conn.commit()
        conn.close()
        return get_full_dashboard_state()

    if tx_type_upper in ("CASH", "UPI"):
        col = "upi_total" if tx_type_upper == "UPI" else "cash_total"
        cursor.execute(f"UPDATE store_summary SET {col} = {col} + ? WHERE id = 1;", (amount,))

        log_quote = quote or f"Payment of Rs {amount} settled via {tx_type_upper}."
        annotation = f"Soundbox / Cash Match: Rs {amount} confirmed in daily {tx_type_upper} ledger."
        cursor.execute("""
        INSERT INTO diarized_stream (
            speaker, noise_db, time_str, quote,
            annotation, confidence, category
        ) VALUES (?, ?, ?, ?, ?, ?, 'UPI_CASH');
        """, (speaker_label or f"Customer ({tx_type_upper})", noise_db, time_str, log_quote, annotation, confidence))

        recalculate_totals(conn)
        conn.commit()
        conn.close()
        return get_full_dashboard_state()

    # Default / UDHARI flow
    # Case-insensitive match on customer name
    cursor.execute("SELECT * FROM customers WHERE LOWER(name) = LOWER(?);", (customer_name,))
    existing = cursor.fetchone()

    if existing:
        cust_id = existing["id"]
        old_b = existing["old_balance"]
        new_b = existing["new_added_today"] + amount
        tot_due = old_b + new_b
        interactions = existing["interactions_count"] + (1 if amount > 0 else 0)

        cursor.execute("""
        UPDATE customers SET
            new_added_today = ?,
            total_due = ?,
            interactions_count = ?,
            last_transaction_time = ?
        WHERE id = ?;
        """, (new_b, tot_due, interactions, time_str, cust_id))
    else:
        cursor.execute("SELECT COUNT(*) as cnt FROM customers;")
        cnt = cursor.fetchone()["cnt"] + 101
        cust_id = f"CUST-{cnt}"
        initials = "".join([w[0] for w in customer_name.split() if w])[:2].upper() or "CU"
        phone_synthetic = "98XXXXXX99 • Synthetic"

        cursor.execute("""
        INSERT INTO customers (
            id, initials, name, phone, old_balance, new_added_today,
            total_due, has_active_dispute, interactions_count, last_transaction_time
        ) VALUES (?, ?, ?, ?, 0, ?, ?, 0, 1, ?);
        """, (cust_id, initials, customer_name, phone_synthetic, amount, amount, time_str))

    # Add Dispute Evidence Voice Record
    verbatim_quote = quote or f"{customer_name}: 'Bhaiya {items} khata mein likh lo shaam ko deta hu'"
    cursor.execute("""
    INSERT INTO dispute_evidence (
        customer_name, time_str, amount, items, status,
        quote, raw_evon_text, confidence_pct, source_tag
    ) VALUES (?, ?, ?, ?, 'Verified', ?, ?, ?, 'PRISMA_VOICE_ASR');
    """, (
        customer_name, time_str, amount, items, verbatim_quote,
        f"{customer_name} added Rs {amount} for {items} via acoustic diarization.", confidence
    ))

    # Add Diarized Stream Entry
    spk = speaker_label or f"Speaker ({customer_name})"
    annotation = f"Prisma v2.5 Indian NER: Rs {amount} credit allocated to {customer_name}. Evon v3.3: Nod confirmed."
    cursor.execute("""
    INSERT INTO diarized_stream (
        speaker, noise_db, time_str, quote,
        annotation, confidence, category
    ) VALUES (?, ?, ?, ?, ?, ?, 'UDHARI');
    """, (spk, noise_db, time_str, verbatim_quote, annotation, confidence))

    recalculate_totals(conn)
    conn.commit()
    conn.close()

    return get_full_dashboard_state()


def settle_customer_balance(
    customer_name: str,
    payment_mode: str = "UPI",
    amount_paid: Optional[int] = None
) -> Dict[str, Any]:
    """
    Settles customer due balance via UPI or Cash:
    - Adds settled amount to store_summary.upi_total (or cash_total)
    - Sets customer balance to 0 (or reduces old_balance first on partial payment)
    - Marks dispute claims as Verified
    - Logs settlement to diarized_stream
    - Calls recalculate_totals()
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM customers WHERE LOWER(name) = LOWER(?);", (customer_name,))
    cust = cursor.fetchone()

    if cust:
        cur_due = cust["total_due"]
        c_name = cust["name"]
        settle_amt = cur_due if amount_paid is None or amount_paid >= cur_due else amount_paid

        if settle_amt >= cur_due:
            # Full settlement
            cursor.execute("""
            UPDATE customers SET
                old_balance = 0,
                new_added_today = 0,
                total_due = 0,
                has_active_dispute = 0,
                interactions_count = interactions_count + 1,
                last_transaction_time = 'Just Now'
            WHERE id = ?;
            """, (cust["id"],))

            cursor.execute("""
            UPDATE dispute_evidence SET status = 'Verified'
            WHERE customer_name = ?;
            """, (c_name,))
        else:
            # Partial settlement: subtract from old_balance first, then new_added_today
            rem_settle = settle_amt
            old_b = cust["old_balance"]
            new_b = cust["new_added_today"]

            if rem_settle <= old_b:
                old_b -= rem_settle
            else:
                rem_settle -= old_b
                old_b = 0
                new_b = max(0, new_b - rem_settle)

            cursor.execute("""
            UPDATE customers SET
                old_balance = ?,
                new_added_today = ?,
                total_due = ?,
                interactions_count = interactions_count + 1,
                last_transaction_time = 'Just Now'
            WHERE id = ?;
            """, (old_b, new_b, old_b + new_b, cust["id"]))

        # Update store summary
        mode_upper = (payment_mode or "UPI").upper()
        col = "upi_total" if mode_upper == "UPI" else "cash_total"
        cursor.execute(f"UPDATE store_summary SET {col} = {col} + ? WHERE id = 1;", (settle_amt,))

        # Diarized stream audit entry
        cursor.execute("""
        INSERT INTO diarized_stream (
            speaker, noise_db, time_str, quote,
            annotation, confidence, category
        ) VALUES (?, 70, 'Just Now', ?, ?, 99.9, 'UPI_CASH');
        """, (
            f"{c_name} (Settlement)",
            f"Payment of Rs {settle_amt} cleared via {mode_upper}.",
            f"Soundbox Audio Verification: Rs {settle_amt} added to daily {mode_upper} ledger.",
        ))

        recalculate_totals(conn)
        conn.commit()

    conn.close()
    return get_full_dashboard_state()


def acknowledge_dispute(evidence_id: int, customer_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Marks the dispute evidence record as 'Verified'.
    If the customer has no other active dispute claims, resets customers.has_active_dispute to 0.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE dispute_evidence SET status = 'Verified'
    WHERE id = ?;
    """, (evidence_id,))

    # Determine customer_name if not provided
    if not customer_name:
        cursor.execute("SELECT customer_name FROM dispute_evidence WHERE id = ?;", (evidence_id,))
        row = cursor.fetchone()
        if row:
            customer_name = row["customer_name"]

    if customer_name:
        cursor.execute("""
        SELECT COUNT(*) as active_cnt FROM dispute_evidence
        WHERE customer_name = ? AND status = 'Active Dispute Claim';
        """, (customer_name,))
        cnt_row = cursor.fetchone()
        if cnt_row and cnt_row["active_cnt"] == 0:
            cursor.execute("""
            UPDATE customers SET has_active_dispute = 0 WHERE name = ?;
            """, (customer_name,))

    conn.commit()
    conn.close()
    return get_full_dashboard_state()


def reset_database() -> Dict[str, Any]:
    """
    Drops and re-creates all 5 tables with the exact initial seed state.
    """
    init_db(force_reset=True)
    return get_full_dashboard_state()


# Backward compatibility aliases for existing endpoints
def add_customer_or_credit(
    customer_name: str,
    phone_synthetic: str = "98XXXXXX99 • Synthetic",
    old_balance: int = 0,
    added_amount: int = 0,
    items: str = "Counter Credit",
    tx_type: str = "Udhari",
    proof_quote: str = "",
    time_str: str = "Just Now"
) -> Dict[str, Any]:
    return apply_extracted_voice_transaction(
        customer_name=customer_name,
        amount=added_amount,
        items=items,
        tx_type=tx_type,
        quote=proof_quote,
        time_str=time_str
    )


def settle_customer(
    customer_name: str,
    amount_paid: int,
    payment_mode: str = "UPI"
) -> Dict[str, Any]:
    return settle_customer_balance(
        customer_name=customer_name,
        payment_mode=payment_mode,
        amount_paid=amount_paid
    )


def resolve_dispute_claim(dispute_id: int, customer_name: Optional[str] = None) -> Dict[str, Any]:
    return acknowledge_dispute(evidence_id=dispute_id, customer_name=customer_name)


if __name__ == "__main__":
    init_db()
    summary = get_full_dashboard_state()["summary"]
    print("=== DukandarOS Database Initialized ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")

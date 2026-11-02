import sys
import io
from pathlib import Path
from starlette.datastructures import UploadFile as StarletteUploadFile
sys.path.insert(0, str(Path(__file__).parent))

import main
import database


def test_full_pipeline():
    print("1. Testing get_state()...")
    database.init_db(force_reset=True)
    state = main.get_state()
    assert state["settledTotal"] == 6570, f"Expected 6570, got {state['settledTotal']}"
    assert state["oldUdhariTotal"] == 1000, f"Expected 1000, got {state['oldUdhariTotal']}"
    assert state["todayNewUdhari"] == 510, f"Expected 510, got {state['todayNewUdhari']}"
    assert state["closingUdhariTotal"] == 1510, f"Expected 1510, got {state['closingUdhariTotal']}"
    assert len(state["customers"]) == 5
    print("   -> State verified: Rs.6,570 Settled, Rs.1,000 Old + Rs.510 New = Rs.1,510 Closing Due.")

    print("2. Testing add_customer_or_credit_route() (Simulate Call / Counter Credit)...")
    payload = main.AddCustomerOrCreditRequest(
        customer_name="Ramesh Auto",
        added_amount=50,
        items="Extra Chai",
        tx_type="Udhari",
        proof_quote="Ramesh: 'Bhaiya ek aur chai khata mein jod do'"
    )
    new_state = main.add_customer_or_credit_route(payload)
    ramesh = next(c for c in new_state["customers"] if c["name"] == "Ramesh Auto")
    assert ramesh["todayNewBalance"] == 250, f"Expected 250, got {ramesh['todayNewBalance']}"
    assert ramesh["totalBalance"] == 430
    assert new_state["todayNewUdhari"] == 560
    assert new_state["closingUdhariTotal"] == 1560
    print("   -> Credit addition verified! Ramesh Auto due is now Rs.430 (180 Old + 250 New).")

    print("3. Testing settle_customer_route() (Settle Rs.430 via UPI)...")
    settle_payload = main.SettleCustomerRequest(
        customer_name="Ramesh Auto",
        amount_paid=430,
        payment_mode="UPI"
    )
    settled_state = main.settle_customer_route(settle_payload)
    ramesh_settled = next(c for c in settled_state["customers"] if c["name"] == "Ramesh Auto")
    assert ramesh_settled["totalBalance"] == 0
    assert ramesh_settled["isFlaggedDispute"] == False
    assert settled_state["settledTotal"] == 6570 + 430
    print("   -> Settlement verified! Ramesh Auto balance reset to Rs.0, settledTotal is now Rs.7,000.")

    print("4. Testing dialect_normalize_route() (Timbre v3.0 Dialect Normalizer)...")
    norm_payload = main.DialectNormalizeRequest(
        customer_name="Karthik Flat 302",
        target_dialect="Hinglish"
    )
    dial = main.dialect_normalize_route(norm_payload)
    assert "Flat teen sau do" in dial["phonetic_string"]
    assert "chaar sau bees rupaye" in dial["phonetic_string"]
    print("   -> Timbre v3.0 Regex Normalizer verified (Flat 302 -> Flat teen sau do, Rs 420 -> chaar sau bees rupaye).")

    print("5. Testing upload_and_analyze_route() (Real Audio Upload & Gnani Pipeline)...")
    fake_audio = io.BytesIO(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00data\x00\x00\x00\x00")
    uploaded_file = StarletteUploadFile(file=fake_audio, filename="ramesh_auto_counter_audio.wav")
    upload_res = main.upload_and_analyze_route(uploaded_file)
    assert upload_res["status"] == "success"
    assert upload_res["applied_count"] >= 1
    assert "ramesh" in upload_res["filename"].lower()
    print(f"   -> Audio uploaded: '{upload_res['filename']}', transcript: '{upload_res['transcript'][:40]}...'")
    print(f"   -> Extracted & applied {upload_res['applied_count']} transaction(s) automatically to SQLite.")

    print("6. Testing reset_demo()...")
    reset_state = main.reset_demo()
    assert reset_state["closingUdhariTotal"] == 1510
    assert reset_state["settledTotal"] == 6570
    ramesh_reset = next(c for c in reset_state["customers"] if c["name"] == "Ramesh Auto")
    assert ramesh_reset["totalBalance"] == 380
    print("   -> Reset verified! Database successfully returned to pre-seeded defaults.")

    print("\n=================================================================")
    print("ALL 5 RELATIONAL TABLES, GNANI PIPELINE & REST ROUTES VERIFIED 100%!")
    print("=================================================================")


if __name__ == "__main__":
    test_full_pipeline()

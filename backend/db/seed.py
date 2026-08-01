"""
Populează Supabase cu date mock pentru demo: useri (owner/doctor/client),
câteva programări și câteva intrări financiare.

Idempotent: rulează de câte ori vrei, nu duplică userii (cheie unică pe email)
și sare peste programări/finanțe dacă există deja date.

Rulează cu: python -m backend.db.seed
"""
from datetime import datetime, timedelta

from backend.db.supabase_client import get_supabase

MOCK_USERS = [
    {"full_name": "Andreea Ionescu", "role": "owner", "email": "owner@clinic.test"},
    {"full_name": "Dr. Mihai Radu", "role": "doctor", "email": "dr.radu@clinic.test"},
    {"full_name": "Dr. Elena Vasilescu", "role": "doctor", "email": "dr.vasilescu@clinic.test"},
    {"full_name": "Ana Popa", "role": "client", "email": "ana.popa@clinic.test"},
    {"full_name": "George Stan", "role": "client", "email": "george.stan@clinic.test"},
    {"full_name": "Maria Dumitrescu", "role": "client", "email": "maria.dumitrescu@clinic.test"},
]


def seed_users(sb) -> dict:
    """Upsert după email; returnează map email -> id."""
    result = sb.table("users").upsert(MOCK_USERS, on_conflict="email").execute()
    users_by_email = {u["email"]: u["id"] for u in result.data}

    if len(users_by_email) < len(MOCK_USERS):
        existing = sb.table("users").select("id, email").execute().data
        users_by_email = {u["email"]: u["id"] for u in existing}

    return users_by_email


def seed_appointments(sb, users_by_email: dict):
    existing = sb.table("appointments").select("id").execute().data
    if existing:
        print(f"  {len(existing)} programări deja există — sar peste seed.")
        return

    now = datetime.now()
    appointments = [
        {
            "client_id": users_by_email["ana.popa@clinic.test"],
            "doctor_id": users_by_email["dr.radu@clinic.test"],
            "scheduled_at": (now + timedelta(days=2, hours=1)).isoformat(),
            "status": "confirmed",
            "notes": "Control de rutină.",
        },
        {
            "client_id": users_by_email["george.stan@clinic.test"],
            "doctor_id": users_by_email["dr.radu@clinic.test"],
            "scheduled_at": (now + timedelta(days=3, hours=2)).isoformat(),
            "status": "pending",
            "notes": "Curățare dentară.",
        },
        {
            "client_id": users_by_email["maria.dumitrescu@clinic.test"],
            "doctor_id": users_by_email["dr.vasilescu@clinic.test"],
            "scheduled_at": (now + timedelta(days=1, hours=4)).isoformat(),
            "status": "confirmed",
            "notes": "Consult inițial.",
        },
        {
            "client_id": users_by_email["ana.popa@clinic.test"],
            "doctor_id": users_by_email["dr.vasilescu@clinic.test"],
            "scheduled_at": (now - timedelta(days=5)).isoformat(),
            "status": "done",
            "notes": "Tratament canal.",
        },
    ]
    sb.table("appointments").insert(appointments).execute()
    print(f"  {len(appointments)} programări inserate.")


def seed_finance(sb):
    existing = sb.table("finance_entries").select("id").execute().data
    if existing:
        print(f"  {len(existing)} intrări financiare deja există — sar peste seed.")
        return

    today = datetime.now().date()
    entries = [
        {"entry_type": "revenue", "amount": 450.0, "category": "Consultații", "entry_date": (today - timedelta(days=3)).isoformat()},
        {"entry_type": "revenue", "amount": 1200.0, "category": "Tratamente", "entry_date": (today - timedelta(days=1)).isoformat()},
        {"entry_type": "expense", "amount": 300.0, "category": "Materiale sanitare", "entry_date": (today - timedelta(days=4)).isoformat()},
        {"entry_type": "expense", "amount": 150.0, "category": "Utilități", "entry_date": (today - timedelta(days=2)).isoformat()},
    ]
    sb.table("finance_entries").insert(entries).execute()
    print(f"  {len(entries)} intrări financiare inserate.")


def main():
    sb = get_supabase()

    print("Seed useri...")
    users_by_email = seed_users(sb)
    for email, uid in users_by_email.items():
        print(f"  {email} -> {uid}")

    print("Seed programări...")
    seed_appointments(sb, users_by_email)

    print("Seed finanțe...")
    seed_finance(sb)

    print("\nGata.")


if __name__ == "__main__":
    main()

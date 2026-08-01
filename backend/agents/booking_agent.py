from datetime import datetime
from backend.db.supabase_client import get_supabase


def is_slot_available(doctor_id: str, scheduled_at: datetime) -> bool:
    """Verificare STRICTĂ în DB — niciodată doar 'crezută' de AI.
    Asta e regula hard care garantează acuratețea, nu promisiunea modelului."""
    sb = get_supabase()
    existing = (
        sb.table("appointments")
        .select("id")
        .eq("doctor_id", doctor_id)
        .eq("scheduled_at", scheduled_at.isoformat())
        .neq("status", "cancelled")
        .execute()
    )
    return len(existing.data) == 0


def create_appointment(client_id: str, doctor_id: str, scheduled_at: datetime, notes: str = "") -> dict:
    """Creează o programare DOAR dacă slotul e liber. Nu are voie să 'ghicească'."""
    if not is_slot_available(doctor_id, scheduled_at):
        return {"success": False, "reason": "Slotul nu mai e disponibil."}

    sb = get_supabase()
    result = (
        sb.table("appointments")
        .insert(
            {
                "client_id": client_id,
                "doctor_id": doctor_id,
                "scheduled_at": scheduled_at.isoformat(),
                "status": "confirmed",
                "notes": notes,
            }
        )
        .execute()
    )
    return {"success": True, "appointment": result.data[0] if result.data else None}

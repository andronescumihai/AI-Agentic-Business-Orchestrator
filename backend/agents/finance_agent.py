from backend.db.supabase_client import get_supabase


def get_finance_summary() -> dict:
    """Sumar simplu venituri/cheltuieli. Owner-only (impus și la nivel de RLS în Supabase)."""
    sb = get_supabase()
    entries = sb.table("finance_entries").select("*").execute().data

    revenue = sum(e["amount"] for e in entries if e["entry_type"] == "revenue")
    expenses = sum(e["amount"] for e in entries if e["entry_type"] == "expense")

    return {
        "revenue": revenue,
        "expenses": expenses,
        "profit": revenue - expenses,
        "entry_count": len(entries),
    }

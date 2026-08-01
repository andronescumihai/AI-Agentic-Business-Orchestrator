import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_url = os.environ.get("SUPABASE_URL")
_key = os.environ.get("SUPABASE_KEY")

_client: Client | None = None


def get_supabase() -> Client:
    """Returnează un singur client Supabase, reutilizat de toți agenții."""
    global _client
    if _client is None:
        if not _url or not _key:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_KEY lipsesc din .env. "
                "Copiază .env.example în .env și completează-le."
            )
        _client = create_client(_url, _key)
    return _client

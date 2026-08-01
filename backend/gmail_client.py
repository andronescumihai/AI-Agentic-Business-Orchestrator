"""
Client Gmail: reconstruiește credențialele OAuth2 din refresh_token-ul salvat
în .env (fără să mai ceară consimțământ de fiecare dată) și citește mesajele
necitite din inbox.
"""
import base64
import os

from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
TOKEN_URI = "https://oauth2.googleapis.com/token"


def get_gmail_service():
    client_id = os.environ.get("GMAIL_CLIENT_ID")
    client_secret = os.environ.get("GMAIL_CLIENT_SECRET")
    refresh_token = os.environ.get("GMAIL_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise RuntimeError(
            "GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN lipsesc din .env. "
            "Rulează întâi: python -m backend.gmail_auth_setup"
        )

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri=TOKEN_URI,
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )
    return build("gmail", "v1", credentials=creds)


def _extract_plain_text(payload: dict) -> str:
    """Extrage text/plain dintr-un payload Gmail, coborând recursiv prin părțile multipart."""
    if payload.get("mimeType") == "text/plain" and payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")

    for part in payload.get("parts", []):
        text = _extract_plain_text(part)
        if text:
            return text
    return ""


def fetch_unread_messages(max_results: int = 10) -> list[dict]:
    """Aduce email-urile necitite din inbox: [{id, from, subject, body}, ...]."""
    service = get_gmail_service()
    response = (
        service.users()
        .messages()
        .list(userId="me", labelIds=["INBOX", "UNREAD"], maxResults=max_results)
        .execute()
    )

    messages = []
    for item in response.get("messages", []):
        msg = service.users().messages().get(userId="me", id=item["id"], format="full").execute()
        headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
        body = _extract_plain_text(msg["payload"])
        messages.append(
            {
                "id": msg["id"],
                "from": headers.get("From", ""),
                "subject": headers.get("Subject", ""),
                "body": body.strip(),
            }
        )
    return messages


def mark_as_read(message_id: str):
    service = get_gmail_service()
    service.users().messages().modify(
        userId="me", id=message_id, body={"removeLabelIds": ["UNREAD"]}
    ).execute()

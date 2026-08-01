"""
Script interactiv, de rulat MANUAL O SINGURĂ DATĂ, ca să obții refresh_token-ul
Gmail necesar pentru citirea automată a email-urilor.

Condiții înainte de a rula acest script (vezi ghidul pas-cu-pas primit separat):
1. Proiect Google Cloud Console cu Gmail API activat.
2. Ecran de consimțământ OAuth configurat (mod "Testing" e suficient),
   cu contul Gmail de test adăugat explicit ca test user.
3. Credențiale OAuth de tip "Desktop app" descărcate din Google Cloud Console
   și salvate ca backend/credentials.json (NU le comite în git — sunt deja
   acoperite de .gitignore, dar verifică).

Rulează cu: python -m backend.gmail_auth_setup

Se deschide un tab de browser în care te loghezi cu contul Gmail vizat și
aprobi accesul cerut. La final, scriptul afișează valorile de pus în
backend/.env — GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN.
"""
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
CREDENTIALS_FILE = "backend/credentials.json"


def main():
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    creds = flow.run_local_server(port=0)

    print("\n=== Autorizare reușită ===")
    print("Copiază exact aceste linii în backend/.env:\n")
    print(f"GMAIL_CLIENT_ID={creds.client_id}")
    print(f"GMAIL_CLIENT_SECRET={creds.client_secret}")
    print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")
    print(
        "\nDupă ce le-ai salvat, poți rula: python -m backend.main_gmail"
    )


if __name__ == "__main__":
    main()

"""
Polling Gmail: citește email-urile necitite din inbox-ul conectat prin OAuth2
și le trece prin orchestratorul existent (classify -> escalate/auto_respond
-> log în Supabase) — exact fluxul din backend/main.py, doar că sursa
mesajului e un email real, nu input simulat din terminal.

Necesită GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN completate
în backend/.env (vezi backend/gmail_auth_setup.py pentru cum le obții).

Rulează cu: python -m backend.main_gmail
"""
from backend.gmail_client import fetch_unread_messages, mark_as_read
from backend.orchestrator import build_graph


def main():
    graph = build_graph()
    messages = fetch_unread_messages()

    if not messages:
        print("Niciun email nou necitit.")
        return

    for msg in messages:
        print(f"\n=== Email nou de la {msg['from']}: {msg['subject']} ===")
        result = graph.invoke({"message": msg["body"] or msg["subject"]})
        print(f"Intenție: {result['intent']} | Încredere: {result['confidence']}")
        print(f"Escaladat la owner: {result['needs_escalation']}")
        print(f"Răspuns final: {result['final_response']}")
        mark_as_read(msg["id"])


if __name__ == "__main__":
    main()

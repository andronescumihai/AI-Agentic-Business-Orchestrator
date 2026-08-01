import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

CONFIDENCE_THRESHOLD = float(os.environ.get("ESCALATION_CONFIDENCE_THRESHOLD", 0.85))

SYSTEM_PROMPT = """Ești un agent de comunicare pentru o clinică dentară.
Primești mesajul unui client (email sau transcript telefonic simulat).

Sarcina ta:
1. Clasifică intenția: "booking" (vrea programare), "question" (întrebare generală),
   "reschedule" (vrea să mute o programare), "other".
2. Dacă poți răspunde cu SIGURANȚĂ pe baza informațiilor din mesaj, dă un răspuns
   scurt și la obiect.
3. Dacă informația lipsește sau cererea e ambiguă / delicată, NU inventa un răspuns —
   marchează-o pentru escaladare la owner.

Răspunde STRICT în JSON, fără text în plus:
{
  "intent": "booking" | "question" | "reschedule" | "other",
  "confidence": 0.0-1.0,
  "draft_response": "răspunsul propus, sau null dacă escaladezi",
  "escalation_reason": "de ce escaladezi, sau null"
}
"""


def process_inbound_message(message: str) -> dict:
    """Analizează un mesaj de client și decide: răspunde singur sau escaladează."""
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": message}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:].strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Fail-safe: dacă modelul nu respectă formatul, escaladăm automat
        # (mai bine escaladare inutilă decât un răspuns greșit trimis clientului)
        result = {
            "intent": "other",
            "confidence": 0.0,
            "draft_response": None,
            "escalation_reason": "Răspuns AI neparsabil — escaladat automat pentru siguranță.",
        }

    result["needs_escalation"] = result.get("confidence", 0) < CONFIDENCE_THRESHOLD
    return result

from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

from backend.agents.email_agent import process_inbound_message
from backend.db.supabase_client import get_supabase


class OrchestratorState(TypedDict):
    message: str
    intent: Optional[str]
    confidence: Optional[float]
    draft_response: Optional[str]
    needs_escalation: bool
    owner_response: Optional[str]
    final_response: Optional[str]


def classify_node(state: OrchestratorState) -> OrchestratorState:
    """Nodul 1: agentul de email analizează mesajul brut al clientului."""
    result = process_inbound_message(state["message"])
    state["intent"] = result["intent"]
    state["confidence"] = result["confidence"]
    state["draft_response"] = result["draft_response"]
    state["needs_escalation"] = result["needs_escalation"]
    return state


def escalate_node(state: OrchestratorState) -> OrchestratorState:
    """Nodul 2a: dacă AI nu e sigur, cerem răspuns de la owner (simulat în terminal azi)."""
    print("\n⚠️  ESCALADARE CĂTRE OWNER")
    print(f"Mesaj client: {state['message']}")
    print(f"Motiv: încredere AI prea mică ({state['confidence']})")
    owner_input = input("Răspunsul tău (owner) pentru client: ")
    state["owner_response"] = owner_input
    state["final_response"] = owner_input
    return state


def auto_respond_node(state: OrchestratorState) -> OrchestratorState:
    """Nodul 2b: AI e suficient de sigur, răspunde direct."""
    state["final_response"] = state["draft_response"]
    return state


def log_node(state: OrchestratorState) -> OrchestratorState:
    """Nodul 3: salvăm interacțiunea în Supabase pentru istoric/audit."""
    sb = get_supabase()
    sb.table("inbound_requests").insert(
        {
            "channel": "email",
            "message": state["message"],
            "ai_confidence": state["confidence"],
            "escalated": state["needs_escalation"],
            "owner_response": state.get("owner_response"),
            "resolved": True,
        }
    ).execute()
    return state


def route_after_classify(state: OrchestratorState) -> str:
    return "escalate" if state["needs_escalation"] else "auto_respond"


def build_graph():
    graph = StateGraph(OrchestratorState)
    graph.add_node("classify", classify_node)
    graph.add_node("escalate", escalate_node)
    graph.add_node("auto_respond", auto_respond_node)
    graph.add_node("log", log_node)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        route_after_classify,
        {"escalate": "escalate", "auto_respond": "auto_respond"},
    )
    graph.add_edge("escalate", "log")
    graph.add_edge("auto_respond", "log")
    graph.add_edge("log", END)

    return graph.compile()

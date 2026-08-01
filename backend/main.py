"""
Demo end-to-end: simulează un email de client care intră în sistem.
Rulează cu: python -m backend.main
"""
from backend.orchestrator import build_graph


def main():
    graph = build_graph()

    print("=== AI Orchestrator — Demo Clinică ===")
    message = input("Simulează un email/mesaj de client: ")

    result = graph.invoke({"message": message})

    print("\n=== Rezultat ===")
    print(f"Intenție detectată: {result['intent']}")
    print(f"Încredere AI: {result['confidence']}")
    print(f"Escaladat la owner: {result['needs_escalation']}")
    print(f"Răspuns final trimis clientului: {result['final_response']}")


if __name__ == "__main__":
    main()

<div align="center">

# 🦷 AI Orchestrator — Autonomous Clinic Operations System

**A multi-agent AI system that automates client communication, appointment booking, and financial reporting for a dental clinic, built with LangGraph, Claude, and Supabase.**

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3C?style=for-the-badge)](https://www.langchain.com/langgraph)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4.5-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

</div>

## 📖 Overview

This project implements an **autonomous AI orchestrator** for a business built around
appointments — modeled here as a dental clinic. Instead of a single chatbot answering
everything, the system is split into specialized agents (email/communication, booking,
finance) coordinated by a **LangGraph** state machine, each backed by **Claude**
(Anthropic API) for reasoning and **Supabase (Postgres)** for persistence.

The core design principle: **AI decides, code verifies.** No critical action — like
confirming an appointment slot — is ever taken purely on the model's word. Every
consequential write is validated against the database first. Where the model is
uncertain, the system escalates to a human (the clinic owner) instead of guessing.

> **Domain:** A dental clinic with three access tiers — owner, doctor, client —
> each with a distinct, database-enforced view of the same data: appointments,
> notes, and financials.

## ✨ Key Features

| Category | Feature | Description |
|---|---|---|
| 🤖 **Agents** | Email/communication agent | Classifies inbound client messages (booking / question / reschedule / other), answers directly when confident, escalates to the owner otherwise |
| 🤖 **Agents** | Booking agent | Verifies real slot availability directly against Postgres before creating any appointment — never trusts the model's assumption |
| 🤖 **Agents** | Finance agent | Aggregates revenue/expenses from `finance_entries`, owner-only |
| 🧠 **Orchestration** | LangGraph state machine | `classify → escalate / auto_respond → log`, with conditional routing based on model confidence |
| 🧠 **Orchestration** | Confidence-based escalation | Configurable threshold (`ESCALATION_CONFIDENCE_THRESHOLD`) below which the agent defers to a human instead of answering |
| 🧠 **Orchestration** | Fail-safe parsing | Malformed or non-JSON model output is treated as "unsure" and escalated automatically, never silently guessed |
| 🔐 **Security** | Row Level Security | Three enforced access tiers on Postgres itself — owner (full access), doctor (own appointments only), client (own appointments only) |
| 🔐 **Security** | Server-side secrets | `service_role` key and Claude API key never leave the backend; nothing sensitive is exposed to the client bundle |
| 📅 **Scheduling** | Doctor weekly calendar | Current week / next week / +2 weeks view, filtered server-side per doctor — no cross-doctor data leakage |
| 📝 **Collaboration** | Appointment notes | Clients can leave notes on their appointment (e.g. running late, reschedule request); visible to the assigned doctor, isolated per appointment |
| 💰 **Finance** | Owner dashboard | Revenue, expenses, and profit summary, computed from Supabase, restricted to the owner role |
| 🎨 **Frontend** | Premium UI | Glassmorphism panels, dark premium palette, and a canvas-based animated background (Perlin noise, mouse-reactive), integrated selectively rather than across every surface |
| 📧 **Integration** | Gmail API (OAuth2) | Reads real inbound emails from a connected mailbox and routes them through the same classification pipeline as simulated messages — tested end-to-end against a live inbox, including automatic escalation to the owner on low-confidence messages |

## 🗄️ Database Schema

Built on **5 core tables** in Supabase (Postgres), with Row Level Security enforced
directly at the database layer — not just in application code:

```
USERS                        APPOINTMENTS                  APPOINTMENT_NOTES
──────────────                ──────────────────            ──────────────────
id (PK)                 ◄──   client_id (FK)                id (PK)
full_name                     doctor_id (FK)          ◄──   appointment_id (FK)
role (owner/doctor/client)    scheduled_at                  author_id (FK)
email                         status                        content
                               notes                          created_at

INBOUND_REQUESTS              FINANCE_ENTRIES
──────────────────            ──────────────────
id (PK)                       id (PK)
channel (email/phone_sim)     entry_type (expense/revenue)
message                       amount
ai_confidence                 category
escalated                     entry_date
owner_response
resolved
```

**Row Level Security policies:**
- `owner_full_access` — owner role bypasses all restrictions
- `doctor_own_appointments` — doctor sees only rows where `doctor_id = auth.uid()`
- `client_own_appointments` — client sees only rows where `client_id = auth.uid()`
- `finance_owner_only` — `finance_entries` restricted entirely to the owner role

## 🏗️ Repository Structure

```
clinic-ai-orchestrator/
│
├── backend/
│   ├── main.py                      # CLI demo entry point — runs the full graph end-to-end
│   ├── main_gmail.py                # Connects a real Gmail inbox to the orchestrator
│   ├── gmail_client.py              # Gmail API: inbox read + mark-as-read
│   ├── gmail_auth_setup.py          # Interactive OAuth2 setup script
│   ├── orchestrator.py              # LangGraph definition: classify → escalate/auto_respond → log
│   ├── agents/
│   │   ├── email_agent.py           # Claude-backed classification + confidence-based escalation
│   │   ├── booking_agent.py         # DB-verified slot availability, appointment creation
│   │   └── finance_agent.py         # Revenue/expense aggregation
│   └── db/
│       ├── schema.sql               # Full Postgres schema + Row Level Security policies
│       └── supabase_client.py       # Singleton Supabase client
│
└── frontend/
    ├── src/
    │   ├── app/                     # Next.js routes (landing, owner/doctor/client dashboards)
    │   └── components/
    │       ├── WeekCalendar.tsx     # Doctor/owner appointment calendar (week navigation)
    │       └── Waves.tsx            # Canvas-based animated background (Perlin noise, mouse-reactive)
    └── ...
```

## 🧠 What I Learned

- **Multi-agent orchestration** — structuring a LangGraph state machine with
  conditional routing, instead of a single monolithic prompt handling everything
- **Designing for AI failure modes** — treating low model confidence and malformed
  output as first-class states to route around, not edge cases to ignore
- **Database-enforced authorization** — implementing real access control with
  Postgres Row Level Security, rather than trusting application-layer checks alone
- **Separating reasoning from execution** — letting Claude decide *what* to do,
  while keeping every state-changing action (bookings, financial reads) gated by
  deterministic, testable code
- **OAuth2 integration** — wiring a real Gmail inbox into an automated pipeline,
  verifying the full loop (read → classify → escalate → respond) against live
  email, while keeping credentials strictly server-side and out of version control
- **Frontend restraint** — choosing a small set of motion/visual components
  deliberately, rather than maximizing visual effects at the cost of performance
  and clarity

## 🔧 Context

Built as a personal portfolio project exploring practical multi-agent AI system
design — moving beyond single-prompt demos toward an architecture with explicit
roles, verified actions, and real access control, using a dental clinic as a
concrete, relatable domain.

Tools: **Python 3.14**, **LangGraph**, **Anthropic Claude API**, **Supabase
(Postgres + Row Level Security)**, **Next.js**, **TypeScript**, **Gmail API (OAuth2)**.

## 👤 Author

<div align="center">

**Andronescu Mihai-Alexandru**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mihai-alexandru-andronescu-58792b33b/)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/andronescumihai)

</div>

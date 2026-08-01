export type Role = "owner" | "doctor" | "client";

export interface ActiveUser {
  id: string;
  full_name: string;
  role: Role;
  email: string | null;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "done";

export interface Appointment {
  id: string;
  client_id: string;
  doctor_id: string;
  client_name: string;
  doctor_name: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  /** Notițele lăsate de client/doctor pe această programare (din appointment_notes). */
  appointmentNotes: AppointmentNote[];
}

export interface AppointmentNote {
  id: string;
  appointment_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface FinanceSummary {
  revenue: number;
  expenses: number;
  profit: number;
  entryCount: number;
  entries: {
    id: string;
    entry_type: "revenue" | "expense";
    amount: number;
    category: string | null;
    entry_date: string;
  }[];
}

export interface InboundRequest {
  id: string;
  channel: string;
  message: string;
  ai_confidence: number | null;
  escalated: boolean;
  owner_response: string | null;
  created_at: string;
}

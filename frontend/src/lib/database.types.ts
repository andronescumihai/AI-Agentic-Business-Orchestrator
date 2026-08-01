/** Tipuri minimale pentru schema Supabase — reflectă backend/db/schema.sql. */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          role: "owner" | "doctor" | "client";
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          role: "owner" | "doctor" | "client";
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          doctor_id: string;
          scheduled_at: string;
          status: "pending" | "confirmed" | "cancelled" | "done";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          doctor_id: string;
          scheduled_at: string;
          status?: "pending" | "confirmed" | "cancelled" | "done";
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      appointment_notes: {
        Row: {
          id: string;
          appointment_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_notes"]["Insert"]>;
        Relationships: [];
      };
      inbound_requests: {
        Row: {
          id: string;
          channel: "email" | "phone_sim" | null;
          from_contact: string | null;
          message: string;
          ai_confidence: number | null;
          escalated: boolean;
          owner_response: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel?: "email" | "phone_sim" | null;
          from_contact?: string | null;
          message: string;
          ai_confidence?: number | null;
          escalated?: boolean;
          owner_response?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inbound_requests"]["Insert"]>;
        Relationships: [];
      };
      finance_entries: {
        Row: {
          id: string;
          entry_type: "expense" | "revenue";
          amount: number;
          category: string | null;
          entry_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_type: "expense" | "revenue";
          amount: number;
          category?: string | null;
          entry_date?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["finance_entries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

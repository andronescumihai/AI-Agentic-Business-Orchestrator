import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * Aceeași regulă de acces ca la POST: doar owner, sau participantul
 * efectiv (client_id / doctor_id) al programării, poate citi notițele ei —
 * verificat direct în DB, nu doar presupus din rolul trimis de client.
 */
export async function GET(req: NextRequest) {
  const appointmentId = req.nextUrl.searchParams.get("appointmentId");
  const role = req.nextUrl.searchParams.get("role");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!appointmentId || !role || !userId) {
    return NextResponse.json(
      { error: "appointmentId, role și userId sunt necesare" },
      { status: 400 }
    );
  }

  const sb = getSupabaseServer();
  const { data: appt, error: apptError } = await sb
    .from("appointments")
    .select("client_id, doctor_id")
    .eq("id", appointmentId)
    .single();

  if (apptError || !appt) {
    return NextResponse.json({ error: "Programarea nu există." }, { status: 404 });
  }

  const isParticipant =
    (role === "client" && appt.client_id === userId) ||
    (role === "doctor" && appt.doctor_id === userId) ||
    role === "owner";

  if (!isParticipant) {
    return NextResponse.json(
      { error: "Nu poți vedea notițele unei programări la care nu participi." },
      { status: 403 }
    );
  }

  const [{ data: notes, error }, { data: users }] = await Promise.all([
    sb
      .from("appointment_notes")
      .select("id, appointment_id, author_id, content, created_at")
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: true }),
    sb.from("users").select("id, full_name"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const nameById = new Map((users ?? []).map((u) => [u.id, u.full_name as string]));
  const enriched = (notes ?? []).map((n) => ({
    ...n,
    author_name: nameById.get(n.author_id) ?? "Necunoscut",
  }));

  return NextResponse.json({ notes: enriched });
}

/**
 * Validare hard în cod: un client sau doctor poate adăuga o notiță
 * DOAR pe o programare la care chiar participă — verificat direct în DB,
 * nu doar presupus din rolul declarat de client.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { appointmentId, authorId, role, content } = body as {
    appointmentId?: string;
    authorId?: string;
    role?: string;
    content?: string;
  };

  if (!appointmentId || !authorId || !role || !content?.trim()) {
    return NextResponse.json({ error: "Câmpuri lipsă." }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { data: appt, error: apptError } = await sb
    .from("appointments")
    .select("client_id, doctor_id")
    .eq("id", appointmentId)
    .single();

  if (apptError || !appt) {
    return NextResponse.json({ error: "Programarea nu există." }, { status: 404 });
  }

  const isParticipant =
    (role === "client" && appt.client_id === authorId) ||
    (role === "doctor" && appt.doctor_id === authorId) ||
    role === "owner";

  if (!isParticipant) {
    return NextResponse.json(
      { error: "Nu poți adăuga o notiță pe o programare la care nu participi." },
      { status: 403 }
    );
  }

  const { data, error } = await sb
    .from("appointment_notes")
    .insert({ appointment_id: appointmentId, author_id: authorId, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ note: data });
}

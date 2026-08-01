import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * Filtrarea pe rol se aplică AICI, în cod server-side — nu doar în UI.
 * Owner vede tot; doctor și client văd strict propriile programări.
 * Autentificarea e simulată în acest MVP (fără sesiune reală), dar
 * regula de acces per-rol tot e impusă hard în interogare, nu lăsată
 * la latitudinea clientului sau a AI-ului.
 */
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  const userId = req.nextUrl.searchParams.get("userId");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const doctorId = req.nextUrl.searchParams.get("doctorId");

  if (!role || !userId) {
    return NextResponse.json(
      { error: "role și userId sunt necesare" },
      { status: 400 }
    );
  }

  const sb = getSupabaseServer();
  let query = sb
    .from("appointments")
    .select("id, client_id, doctor_id, scheduled_at, status, notes")
    .order("scheduled_at", { ascending: true });

  if (role === "doctor") {
    query = query.eq("doctor_id", userId);
  } else if (role === "client") {
    query = query.eq("client_id", userId);
  } else if (role === "owner") {
    // Filtrul pe doctor e doar o comoditate de vizualizare pentru owner —
    // nu are efect de securitate (owner vede oricum tot), dar restul
    // rolurilor nu pot folosi acest parametru ca să vadă alte programări
    // decât ale lor (vezi ramurile de mai sus, care ignoră doctorId).
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }
  } else {
    return NextResponse.json({ error: "Rol necunoscut" }, { status: 403 });
  }

  if (from) query = query.gte("scheduled_at", from);
  if (to) query = query.lt("scheduled_at", to);

  const [{ data: appointments, error: apptError }, { data: users, error: usersError }] =
    await Promise.all([
      query,
      sb.from("users").select("id, full_name"),
    ]);

  if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });

  const nameById = new Map((users ?? []).map((u) => [u.id, u.full_name as string]));

  const appointmentIds = (appointments ?? []).map((a) => a.id);
  const notesByAppointment = new Map<
    string,
    { id: string; appointment_id: string; author_id: string; content: string; created_at: string }[]
  >();

  if (appointmentIds.length > 0) {
    const { data: notes, error: notesError } = await sb
      .from("appointment_notes")
      .select("id, appointment_id, author_id, content, created_at")
      .in("appointment_id", appointmentIds)
      .order("created_at", { ascending: true });

    if (notesError) return NextResponse.json({ error: notesError.message }, { status: 500 });

    for (const note of notes ?? []) {
      const list = notesByAppointment.get(note.appointment_id) ?? [];
      list.push(note);
      notesByAppointment.set(note.appointment_id, list);
    }
  }

  const enriched = (appointments ?? []).map((a) => ({
    ...a,
    client_name: nameById.get(a.client_id) ?? "Necunoscut",
    doctor_name: nameById.get(a.doctor_id) ?? "Necunoscut",
    appointmentNotes: (notesByAppointment.get(a.id) ?? []).map((n) => ({
      ...n,
      author_name: nameById.get(n.author_id) ?? "Necunoscut",
    })),
  }));

  return NextResponse.json({ appointments: enriched });
}

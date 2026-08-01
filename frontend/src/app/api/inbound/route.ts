import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/** Istoricul agentului de comunicare (clasificări + escaladări) — owner-only. */
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  if (role !== "owner") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("inbound_requests")
    .select("id, channel, message, ai_confidence, escalated, owner_response, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ requests: data });
}

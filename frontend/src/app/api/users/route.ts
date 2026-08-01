import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("users")
    .select("id, full_name, role, email")
    .order("role")
    .order("full_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

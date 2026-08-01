import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * Date financiare — strict owner-only, impus în cod (nu doar ascuns în UI).
 * Orice altă valoare de rol primește 403, indiferent ce ar "crede" clientul.
 */
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  if (role !== "owner") {
    return NextResponse.json(
      { error: "Acces interzis: datele financiare sunt vizibile doar pentru owner." },
      { status: 403 }
    );
  }

  const sb = getSupabaseServer();
  const { data: entries, error } = await sb
    .from("finance_entries")
    .select("id, entry_type, amount, category, entry_date")
    .order("entry_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const revenue = (entries ?? [])
    .filter((e) => e.entry_type === "revenue")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expenses = (entries ?? [])
    .filter((e) => e.entry_type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return NextResponse.json({
    revenue,
    expenses,
    profit: revenue - expenses,
    entryCount: entries?.length ?? 0,
    entries: entries ?? [],
  });
}

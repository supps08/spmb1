
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LoginEntry } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { data: rows, error: historyError } = await supabase
    .from("login_history")
    .select(
      `
      id,
      user_id,
      ip_address,
      user_agent,
      status,
      created_at,
      profiles (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (historyError) {
    console.error("[admin/history] Query error:", historyError.message);
    return NextResponse.json({ error: "Gagal mengambil histori." }, { status: 500 });
  }
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  const history: LoginEntry[] = (rows ?? []).map((row) => {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      userId: row.user_id ?? "-",
      email: p?.email ?? "-",
      name: p?.full_name ?? "-",
      status: row.status === "berhasil" ? "success" : "failed",
      ip: row.ip_address,
      userAgent: row.user_agent,
      timestamp: row.created_at,
    };
  });

  return NextResponse.json({ history, totalUsers: totalUsers ?? 0 });
}
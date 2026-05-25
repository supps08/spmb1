// ============================================================
// PATH : app/api/admin/history/route.ts
// ISI  : GET → histori login (50 terbaru) + totalUsers
//        Admin only — baca dari login_history JOIN profiles
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LoginEntry } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();

  // Verifikasi session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cek role admin dari tabel profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ambil 50 histori login terbaru + join profiles untuk email & nama
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

  // Hitung total user aktif dari tabel profiles
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Map ke format response yang sama dengan sebelumnya
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
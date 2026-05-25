// ============================================================
// PATH : app/api/auth/me/route.ts
// ISI  : GET → kembalikan data user dari session Supabase + join profiles
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Ambil profil lengkap
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: profile.full_name,
      email: user.email ?? "",
      role: profile.role as "admin" | "user",
      createdAt: profile.created_at,
    },
  });
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    void supabase.from("login_history").insert({
      user_id: null,
      ip_address: ip,
      user_agent: userAgent,
      status: "gagal",
    });

    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 }
    );
  }

  void supabase.from("login_history").insert({
    user_id: data.user.id,
    ip_address: ip,
    user_agent: userAgent,
    status: "berhasil",
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({
    success: true,
    user: {
      id: data.user.id,
      name: profile?.full_name ?? "",
      email: data.user.email ?? email,
      role: (profile?.role as "admin" | "user") ?? "user",
    },
  });
}
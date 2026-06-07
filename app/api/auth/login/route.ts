import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Rate limiter in-memory: max 5 percobaan per IP per 15 menit
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

function checkRateLimit(ip: string): { blocked: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { blocked: true, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { blocked: false };
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  let email: string, password: string;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Cek rate limit
  const { blocked, retryAfter } = checkRateLimit(ip);
  if (blocked) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.` },
      { status: 429 }
    );
  }

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

  // Reset rate limit setelah login berhasil
  resetRateLimit(ip);

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
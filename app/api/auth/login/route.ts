import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, logLoginAttempt, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const user = getUserByEmail(email);

  if (!user) {
    logLoginAttempt({ userId: "-", email, name: "-", status: "failed", ip, userAgent, reason: "Email tidak ditemukan" });
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const valid = verifyPassword(password, user.password);
  if (!valid) {
    logLoginAttempt({ userId: user.id, email, name: user.name, status: "failed", ip, userAgent, reason: "Password salah" });
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  logLoginAttempt({ userId: user.id, email, name: user.name, status: "success", ip, userAgent });

  const token = createToken(user);
  const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("auth_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 });
  return res;
}
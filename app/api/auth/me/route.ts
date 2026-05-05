import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserByEmail } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const user = getUserByEmail(payload.email);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
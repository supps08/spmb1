import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getLoginHistory } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const history = getLoginHistory().slice(0, 20);
  return NextResponse.json({ history });
}
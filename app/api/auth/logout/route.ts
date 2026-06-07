// ============================================================
// PATH : app/api/auth/logout/route.ts
// ISI  : POST → sign out via Supabase Auth (cookie di-clear otomatis)
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
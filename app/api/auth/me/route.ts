
import { NextRequest, NextResponse } from "next/server";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at, avatar_url")
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
      avatar_url: profile.avatar_url ?? null,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; avatar_url?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
  const { name, avatar_url } = body as { name?: string; avatar_url?: string | null };

  const updates: Record<string, string | null> = {};
  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Nama tidak boleh kosong." }, { status: 400 });
    }
    updates.full_name = trimmed;
  }
  if (avatar_url !== undefined) {
    updates.avatar_url = avatar_url;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data untuk diupdate." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: profile.full_name,
      email: user.email ?? "",
      role: profile.role as "admin" | "user",
      createdAt: profile.created_at,
      avatar_url: profile.avatar_url ?? null,
    },
  });
}
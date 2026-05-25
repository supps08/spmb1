// ============================================================
// PATH : app/api/admin/users/route.ts
// ISI  : GET  → daftar semua user dari tabel profiles (admin only)
//        POST → buat user baru (membutuhkan SUPABASE_SERVICE_ROLE_KEY)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { PublicUser } from "@/lib/auth";

// ─── Helper: verifikasi admin ─────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, adminUser: null, error: "Unauthorized" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { supabase, adminUser: null, error: "Forbidden" as const };
  }

  return { supabase, adminUser: user, error: null };
}

// ─── GET /api/admin/users ─────────────────────────────────────
export async function GET() {
  const { supabase, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: profiles, error: dbError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: "Gagal mengambil data user." }, { status: 500 });
  }

  // Map ke format response yang sama dengan sebelumnya
  const users: PublicUser[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role as "admin" | "user",
    createdAt: p.created_at,
  }));

  return NextResponse.json({ users });
}

// ─── POST /api/admin/users ────────────────────────────────────
export async function POST(req: NextRequest) {
  const { supabase: _supabase, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter." },
      { status: 400 }
    );
  }

  if (!["admin", "user"].includes(role ?? "user")) {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }

  // TODO: Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env.local untuk mengaktifkan
  //       pembuatan user dari admin panel. Tanpa service role key, endpoint ini
  //       tidak dapat membuat user baru karena supabase.auth.admin.createUser()
  //       memerlukan hak akses service role.
  //
  //       Langkah:
  //       1. Buka Supabase Dashboard → Project Settings → API
  //       2. Salin "service_role" key (BUKAN anon key)
  //       3. Tambahkan ke .env.local:
  //          SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  //
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Fitur ini membutuhkan SUPABASE_SERVICE_ROLE_KEY di environment variables. " +
          "Lihat TODO comment di app/api/admin/users/route.ts untuk instruksi.",
      },
      { status: 501 }
    );
  }

  // Gunakan admin client dengan service role key
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      user_metadata: { full_name: name.trim() },
      email_confirm: true, // langsung konfirmasi tanpa email verifikasi
    });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 });
  }

  // Insert ke tabel profiles
  const { error: profileError } = await adminClient
    .from("profiles")
    .insert({
      id: authData.user.id,
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role ?? "user",
    });

  if (profileError) {
    console.error("[admin/users POST] Gagal insert profiles:", profileError.message);
  }

  const newUser: PublicUser = {
    id: authData.user.id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: (role as "admin" | "user") ?? "user",
    createdAt: authData.user.created_at,
  };

  return NextResponse.json({ user: newUser }, { status: 201 });
}
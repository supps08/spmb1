
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { PublicUser } from "@/lib/auth";

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
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: "Gagal mengambil data user." }, { status: 500 });
  }

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role as "admin" | "user",
    createdAt: p.created_at,
    is_active: p.is_active ?? true,
  }));

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const { supabase: _supabase, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
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
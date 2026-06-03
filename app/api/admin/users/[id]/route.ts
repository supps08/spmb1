
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { PublicUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };
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
export async function GET(_req: NextRequest, { params }: Params) {
  const { supabase, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const { data: profile, error: dbError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("id", id)
    .single();

  if (dbError || !profile) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const user = {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role as "admin" | "user",
    createdAt: profile.created_at,
    is_active: profile.is_active ?? true,
  };

  return NextResponse.json({ user });
}
export async function PUT(req: NextRequest, { params }: Params) {
  const { supabase, adminUser, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: { name?: string; email?: string; role?: string; password?: string; is_active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
  const { name, email, role, password, is_active } = body as {
    name?: string;
    email?: string;
    role?: string;
    password?: string;
    is_active?: boolean;
  };
  if (adminUser!.id === id && role && role !== "admin") {
    return NextResponse.json(
      { error: "Tidak bisa menurunkan role akun sendiri." },
      { status: 400 }
    );
  }

  if (role && !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }

  if (password && password.length < 6) {
    return NextResponse.json(
      { error: "Password baru minimal 6 karakter." },
      { status: 400 }
    );
  }
  const updates: Record<string, string | boolean> = {};
  if (name) updates.full_name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (role) updates.role = role;
  if (typeof is_active === "boolean") updates.is_active = is_active;

  if (Object.keys(updates).length > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (profileError) {
      if (profileError.message.includes("duplicate") || profileError.code === "23505") {
        return NextResponse.json(
          { error: "Email sudah digunakan akun lain." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }
  if (password) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
      const { error: pwError } = await adminClient.auth.admin.updateUserById(id, {
        password,
      });
      if (pwError) {
        console.error("[users/[id] PUT] Gagal update password:", pwError.message);
      }
    } else {
      console.warn(
        "[users/[id] PUT] SUPABASE_SERVICE_ROLE_KEY tidak ditemukan — " +
          "password tidak diperbarui di Supabase Auth."
      );
    }
  }
  const { data: updated } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("id", id)
    .single();

  if (!updated) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const user = {
    id: updated.id,
    name: updated.full_name,
    email: updated.email,
    role: updated.role as "admin" | "user",
    createdAt: updated.created_at,
    is_active: updated.is_active ?? true,
  };

  return NextResponse.json({ user });
}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { supabase, adminUser, error } = await requireAdmin();

  if (error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (adminUser!.id === id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri." },
      { status: 400 }
    );
  }
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
    await adminClient.auth.admin.deleteUser(id);
  }

  return NextResponse.json({ success: true });
}
// ============================================================
// PATH : app/api/auth/register/route.ts
// ISI  : POST → daftarkan user baru via Supabase Auth + insert profiles
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
  const { name, email, password, phone } = body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
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

  const supabase = await createClient();

  // Daftarkan ke Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: name.trim(), phone: phone?.trim() ?? null },
    },
  });

  if (error) {
    // Tangani error umum Supabase
    if (error.message.includes("already registered")) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "Registrasi gagal. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: data.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "user",
      },
    },
    { status: 201 }
  );
}
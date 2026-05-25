// ============================================================
// PATH : middleware.ts
// ISI  : Proteksi route dengan Supabase session + refresh cookie
//        PUBLIC_PATHS bebas akses, /dashboard/* butuh session
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

export async function proxy(request: NextRequest) {
  // Siapkan response default (akan di-mutate jika Supabase perlu set cookie)
  let supabaseResponse = NextResponse.next({ request });

  // Buat Supabase client khusus middleware (bukan createClient dari server.ts
  // karena middleware butuh akses ke request.cookies secara langsung)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookie di request (untuk server components yang mungkin dirender)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Buat ulang response agar cookie refresh disertakan di response
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // PENTING: Panggil getUser() untuk memperbarui/memvalidasi session.
  // Jangan gunakan getSession() di middleware — tidak aman (JWT bisa dimanipulasi).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Izinkan semua public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // Jika tidak ada session:
  if (!user) {
    // API route → kembalikan 401 JSON
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page route → redirect ke /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Session ada → teruskan request dengan cookie yang sudah di-refresh
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
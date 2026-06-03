
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LIST_SELECT =
  "id, judul, slug, ringkasan, thumbnail_url, kategori, is_published, published_at, author_id, created_at";

async function getSessionAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, userId: null as string | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = !!profile && profile.role === "admin";
  return { isAdmin, userId: user.id };
}

function generateSlug(judul: string): string {
  const base = judul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Date.now()}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { isAdmin } = await getSessionAdmin(supabase);

    let query = supabase
      .from("berita")
      .select(LIST_SELECT)
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[berita GET]", error.message);
      return NextResponse.json({ error: "Gagal mengambil berita." }, { status: 500 });
    }

    return NextResponse.json({ berita: data ?? [] });
  } catch (err) {
    console.error("[berita GET]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { isAdmin, userId } = await getSessionAdmin(supabase);

    if (!isAdmin || !userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      judul,
      konten,
      ringkasan,
      kategori,
      thumbnail_url,
      is_published,
    } = body as {
      judul?: string;
      konten?: string;
      ringkasan?: string;
      kategori?: string;
      thumbnail_url?: string;
      is_published?: boolean;
    };

    if (!judul?.trim()) {
      return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
    }

    const published = !!is_published;
    const slug = generateSlug(judul.trim());

    const { data, error } = await supabase
      .from("berita")
      .insert({
        judul: judul.trim(),
        slug,
        konten: konten ?? "",
        ringkasan: ringkasan ?? "",
        kategori: kategori ?? "Umum",
        thumbnail_url: thumbnail_url ?? null,
        is_published: published,
        published_at: published ? new Date().toISOString() : null,
        author_id: userId,
      })
      .select(LIST_SELECT)
      .single();

    if (error) {
      console.error("[berita POST]", error.message);
      return NextResponse.json({ error: "Gagal menyimpan berita." }, { status: 500 });
    }

    return NextResponse.json({ berita: data }, { status: 201 });
  } catch (err) {
    console.error("[berita POST]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

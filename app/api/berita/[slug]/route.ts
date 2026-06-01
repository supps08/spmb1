// ============================================================
// PATH : app/api/berita/[slug]/route.ts
// ISI  : GET detail | PUT update | DELETE (admin)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ slug: string }> };

const DETAIL_SELECT = `
  id, judul, slug, konten, ringkasan, thumbnail_url, kategori,
  is_published, published_at, author_id, created_at, updated_at,
  profiles:author_id ( full_name )
`;

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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { isAdmin } = await getSessionAdmin(supabase);

    let query = supabase.from("berita").select(DETAIL_SELECT).eq("slug", slug);

    if (!isAdmin) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
    }

    const profileRaw = data.profiles as { full_name: string } | { full_name: string }[] | null;
    const authorName = Array.isArray(profileRaw)
      ? profileRaw[0]?.full_name ?? null
      : profileRaw?.full_name ?? null;

    const { profiles: _profiles, ...rest } = data;
    return NextResponse.json({
      berita: { ...rest, author_name: authorName },
    });
  } catch (err) {
    console.error("[berita/[slug] GET]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { isAdmin } = await getSessionAdmin(supabase);

    if (!isAdmin) {
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

    const { data: existing, error: fetchError } = await supabase
      .from("berita")
      .select("id, is_published, published_at")
      .eq("slug", slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (judul !== undefined) updates.judul = judul.trim();
    if (konten !== undefined) updates.konten = konten;
    if (ringkasan !== undefined) updates.ringkasan = ringkasan;
    if (kategori !== undefined) updates.kategori = kategori;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null;

    if (is_published !== undefined) {
      updates.is_published = !!is_published;
      if (is_published && !existing.is_published) {
        updates.published_at = new Date().toISOString();
      }
      if (!is_published) {
        updates.published_at = null;
      }
    }

    const { data, error } = await supabase
      .from("berita")
      .update(updates)
      .eq("slug", slug)
      .select(
        "id, judul, slug, konten, ringkasan, thumbnail_url, kategori, is_published, published_at, author_id, created_at"
      )
      .single();

    if (error) {
      console.error("[berita/[slug] PUT]", error.message);
      return NextResponse.json({ error: "Gagal memperbarui berita." }, { status: 500 });
    }

    return NextResponse.json({ berita: data });
  } catch (err) {
    console.error("[berita/[slug] PUT]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { isAdmin } = await getSessionAdmin(supabase);

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("berita").delete().eq("slug", slug);

    if (error) {
      console.error("[berita/[slug] DELETE]", error.message);
      return NextResponse.json({ error: "Gagal menghapus berita." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[berita/[slug] DELETE]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

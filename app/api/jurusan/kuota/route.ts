import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: jurusanList } = await supabase
    .from("jurusan")
    .select("id, kode, nama, kuota")
    .eq("is_active", true);

  if (!jurusanList) return NextResponse.json([]);

  const result = await Promise.all(
    jurusanList.map(async (j) => {
      const { count } = await supabase
        .from("siswa")
        .select("*", { count: "exact", head: true })
        .eq("jurusan_id", j.id)
        .neq("status", "draft");

      return {
        id: j.id,
        kode: j.kode,
        nama: j.nama,
        kuota: j.kuota,
        terisi: count ?? 0,
        sisa: (j.kuota ?? 0) - (count ?? 0),
        persenTerisi: j.kuota
          ? Math.round(((count ?? 0) / j.kuota) * 100)
          : 0,
      };
    })
  );

  return NextResponse.json(result);
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCountdown } from "@/lib/useCountdown";

export default function HeroCountdown() {
  const [tanggalTutup, setTanggalTutup] = useState<string | null>(null);
  const countdown = useCountdown(tanggalTutup);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: setting } = await supabase
        .from("pengaturan_sistem")
        .select("value")
        .eq("key", "tanggal_tutup")
        .single();
      if (setting) setTanggalTutup(setting.value);
    }

    load();
  }, []);

  if (!tanggalTutup && !countdown.isExpired) return null;

  if (countdown.isExpired) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(220, 38, 38, 0.18)",
          border: "1px solid rgba(252, 165, 165, 0.45)",
          borderRadius: 9999,
          padding: "6px 16px",
          fontSize: 13,
          color: "#FCA5A5",
          marginTop: 20,
          backdropFilter: "blur(8px)",
        }}
      >
        <span>🚫</span> Pendaftaran sudah ditutup
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(12, 26, 16, 0.55)",
        border: "1px solid rgba(245, 158, 11, 0.45)",
        borderRadius: 9999,
        padding: "6px 16px",
        fontSize: 13,
        color: "#FDE68A",
        marginTop: 20,
        backdropFilter: "blur(8px)",
      }}
    >
      <span>⏰</span>
      Pendaftaran ditutup dalam{" "}
      <strong style={{ color: "#fff" }}>
        {countdown.days > 0 && `${countdown.days} hari `}
        {countdown.hours} jam {countdown.minutes} menit
      </strong>
    </div>
  );
}

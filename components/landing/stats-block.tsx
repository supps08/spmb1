"use client";

import { useState, useCallback, useEffect } from "react";

const CAROUSEL_IMAGES = [
  {
    alt: "Papan nama SMK Citra Negara",
    src: "/sekolah/papan-nama.jpg",
  },
  {
    alt: "Lapangan SMK Citra Negara",
    src: "/sekolah/lapangan.jpg",
  },
  {
    alt: "Kegiatan siswa SMK Citra Negara",
    src: "/sekolah/kegiatan.jpg",
  },
];

const MITRA = [
  "Telkom Indonesia",
  "Indosat Ooredoo",
  "BPJS Ketenagakerjaan",
  "Bank BRI",
  "Pertamina",
  "Tokopedia",
  "Gojek",
  "Astra International",
];

type ActiveModal = null | "tahun" | "ilmu" | "mitra";

export default function StatsBlock() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const prevSlide = () => {
    setCarouselIndex((i) => (i === 0 ? CAROUSEL_IMAGES.length - 1 : i - 1));
  };

  const nextSlide = () => {
    setCarouselIndex((i) => (i === CAROUSEL_IMAGES.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    if (!activeModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeModal, closeModal]);

  return (
    <>
      <div className="stats-layout">
        <div className="stats-left">
          <div className="section-label stats-label reveal">Siapa Kami</div>
          <h2 className="reveal stats-heading">
            Angka yang Berbicara
            <br />
            untuk Diri Kami
          </h2>

          <div className="stats-carousel reveal">
            <div className="stats-carousel-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={carouselIndex}
                className="stats-carousel-img"
                src={CAROUSEL_IMAGES[carouselIndex].src}
                alt={CAROUSEL_IMAGES[carouselIndex].alt}
              />
            </div>
            <div className="stats-carousel-nav">
              <button
                type="button"
                className="stats-carousel-btn"
                onClick={prevSlide}
                aria-label="Foto sebelumnya"
              >
                ←
              </button>
              <button
                type="button"
                className="stats-carousel-btn"
                onClick={nextSlide}
                aria-label="Foto berikutnya"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="stats-cards-grid reveal">
          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() => setActiveModal("tahun")}
          >
            <span className="stat-card-icon" aria-hidden>
              ↗
            </span>
            <div className="stat-num">
              20<span>+</span>
            </div>
            <div className="stat-lbl">Tahun Berdiri</div>
          </button>

          <div className="stat-card stat-card-static">
            <div className="stat-num">
              1.5k<span>+</span>
            </div>
            <div className="stat-lbl">Total Pendaftar</div>
          </div>

          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() => setActiveModal("ilmu")}
          >
            <span className="stat-card-icon" aria-hidden>
              ↗
            </span>
            <div className="stat-num">
              98<span>%</span>
            </div>
            <div className="stat-lbl">Implementasi Ilmu</div>
            <div className="stat-sublbl">rata-rata efektivitas per jurusan</div>
          </button>

          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() => setActiveModal("mitra")}
          >
            <span className="stat-card-icon" aria-hidden>
              ↗
            </span>
            <div className="stat-num">
              45<span>+</span>
            </div>
            <div className="stat-lbl">Mitra Industri</div>
          </button>
        </div>
      </div>

      {activeModal && (
        <div
          className="stats-modal-overlay"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="stats-modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="stats-modal-close"
              onClick={closeModal}
              aria-label="Tutup"
            >
              ×
            </button>

            {activeModal === "tahun" && (
              <p className="stats-modal-text">
                SMK Citra Negara telah berdiri lebih dari 20 tahun, berlokasi di
                Jl. Raya Tanah Baru No.99 Beji, Depok 16421. Berawal dari visi
                mencetak tenaga digital profesional yang siap kerja dan berdaya
                saing internasional, SMK Citra Negara kini menjadi salah satu
                sekolah kejuruan terbaik di Depok dengan ratusan mitra industri
                aktif.
              </p>
            )}

            {activeModal === "ilmu" && (
              <>
                <table className="stats-modal-table">
                  <tbody>
                    <tr>
                      <td>PPLG</td>
                      <td>97%</td>
                    </tr>
                    <tr>
                      <td>TKJ</td>
                      <td>96%</td>
                    </tr>
                    <tr>
                      <td>MPLB</td>
                      <td>95%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="stats-modal-note">
                  Data berdasarkan survei alumni 2024
                </p>
              </>
            )}

            {activeModal === "mitra" && (
              <ul className="stats-modal-mitra-grid">
                {MITRA.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
import Link from "next/link";
import {
  Globe,
  Share2,
  PlayCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function LandingFooter() {
  return (
    <>
      <style>{`
        .landing-footer {
          background: #0c1a10;
          padding: 60px 80px 32px;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .landing-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .landing-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 28px;
        }

        .landing-footer-logo {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }

        .landing-footer-logo span {
          color: #1c5c38;
        }

        .landing-footer-tagline {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.65;
          max-width: 300px;
          margin-bottom: 20px;
        }

        .landing-footer-email {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.2s;
        }

        .landing-footer-email:hover {
          color: #fff;
        }

        .landing-footer-social {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .landing-footer-social a {
          color: rgba(255, 255, 255, 0.5);
          transition: color 0.2s;
          display: flex;
        }

        .landing-footer-social a:hover {
          color: #fff;
        }

        .landing-footer-col-title {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 18px;
        }

        .landing-footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .landing-footer-links a {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.2s;
        }

        .landing-footer-links a:hover {
          color: #fff;
        }

        .landing-footer-contact li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
        }

        .landing-footer-contact svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.4);
        }

        .landing-footer-contact a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.2s;
        }

        .landing-footer-contact a:hover {
          color: #fff;
        }

        .landing-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .landing-footer-copy {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.25);
        }

        .landing-footer-copy a {
          color: rgba(255, 255, 255, 0.25);
          text-decoration: none;
          transition: color 0.2s;
        }

        .landing-footer-copy a:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 1024px) {
          .landing-footer {
            padding: 48px 40px 28px;
          }
          .landing-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 640px) {
          .landing-footer {
            padding: 40px 24px 24px;
          }
          .landing-footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
      `}</style>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-grid">
            <div>
              <div className="landing-footer-logo">
                SMK <span>Citra Negara</span>
              </div>
              <p className="landing-footer-tagline">
                Pilihan Yang Tepat Di Sekolah Yang M.A.N.T.A.P
              </p>
              <a
                href="mailto:hello@smkdigital.sch.id"
                className="landing-footer-email"
              >
                <Mail size={16} />
                hello@smkdigital.sch.id
              </a>
              <div className="landing-footer-social">
                <a href="#" aria-label="Website">
                  <Globe size={20} />
                </a>
                <a href="#" aria-label="Instagram">
                  <Share2 size={20} />
                </a>
                <a href="#" aria-label="YouTube">
                  <PlayCircle size={20} />
                </a>
              </div>
            </div>

            <div>
              <div className="landing-footer-col-title">Explore</div>
              <ul className="landing-footer-links">
                <li>
                  <Link href="/#jurusan">Jurusan</Link>
                </li>
                <li>
                  <Link href="/register">Daftar</Link>
                </li>
                <li>
                  <a href="#">Prestasi</a>
                </li>
                <li>
                  <a href="#">Berita</a>
                </li>
              </ul>
            </div>

            <div>
              <div className="landing-footer-col-title">Resources</div>
              <ul className="landing-footer-links">
                <li>
                  <a href="#">Daftar Guru</a>
                </li>
                <li>
                  <a href="#">Jadwal</a>
                </li>
                <li>
                  <a href="#">Video</a>
                </li>
                <li>
                  <a href="#">Foto</a>
                </li>
              </ul>
            </div>

            <div>
              <div className="landing-footer-col-title">Kontak</div>
              <ul className="landing-footer-links landing-footer-contact">
                <li>
                  <Mail size={16} />
                  <a href="mailto:hello@smkdigital.sch.id">
                    hello@smkdigital.sch.id
                  </a>
                </li>
                <li>
                  <Phone size={16} />
                  <a href="tel:02177201052">(021) 77201052</a>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>
                    Jl. Raya Tanah Baru No.99 Beji, Depok 16421
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div className="landing-footer-copy">
              © 2026 SMK Citra Negara. All rights reserved
            </div>
            <div className="landing-footer-copy">
              <a href="#">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

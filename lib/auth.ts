// ============================================================
// PATH : lib/auth.ts
// ISI  : Type definitions only — runtime auth telah dimigrasikan
//        ke Supabase Auth. Lihat lib/supabase/server.ts untuk client.
// ============================================================

// ─── User Types ──────────────────────────────────────────────

/**
 * Representasi user publik yang dikembalikan oleh API.
 * Field `name` di-map dari kolom `profiles.full_name`.
 */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

// ─── Login History Types ──────────────────────────────────────

/**
 * Entry histori login untuk response API.
 * Di-map dari tabel `login_history` JOIN `profiles`:
 *   - ip       ← login_history.ip_address
 *   - userAgent← login_history.user_agent
 *   - timestamp← login_history.created_at
 *   - email    ← profiles.email
 *   - name     ← profiles.full_name
 */
export interface LoginEntry {
  id: string;
  userId: string;
  email: string;
  name: string;
  status: "success" | "failed";
  ip: string;
  userAgent: string;
  timestamp: string;
  reason?: string;
}
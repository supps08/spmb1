import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const HISTORY_FILE = path.join(DATA_DIR, "login-history.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

export interface LoginHistory {
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

// ── User helpers ─────────────────────────────────────────────
export function getUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

// ── Login History helpers ────────────────────────────────────
export function getLoginHistory(): LoginHistory[] {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
}

export function logLoginAttempt(entry: Omit<LoginHistory, "id" | "timestamp">) {
  const history = getLoginHistory();
  const newEntry: LoginHistory = {
    ...entry,
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  history.unshift(newEntry); // newest first
  // Keep max 500 records
  const trimmed = history.slice(0, 500);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
  return newEntry;
}

// ── Simple token (base64, not JWT – cukup untuk demo) ────────
export function createToken(user: User): string {
  const payload = { id: user.id, email: user.email, role: user.role, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyToken(token: string): { id: string; email: string; role: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
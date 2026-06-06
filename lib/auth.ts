
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

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
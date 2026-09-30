/** Thin fetch wrapper for the SnapClass API: same-origin, cookie-based sessions, JSON in/out. */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : null) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

export interface SessionUser {
  role: "teacher" | "student";
  id: number;
  username: string;
  displayName: string;
  enrolled?: { face: boolean; voice: boolean };
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  section: string;
  created_at: string;
  student_count?: number;
  session_count?: number;
}

export interface StudentSubject {
  id: number;
  code: string;
  name: string;
  section: string;
  classes_held: number;
  classes_attended: number;
}

export interface RosterEntry {
  id: number;
  display_name: string;
  username: string;
  has_face: boolean;
  has_voice: boolean;
}

export interface AttendanceSession {
  id: number;
  method: "photo" | "voice";
  created_at: string;
  present_count: number;
  total_count: number;
}

export interface PhotoPreviewRow {
  studentId: number;
  name: string;
  present: boolean;
  distance: number | null;
  reason?: "not_enrolled";
}

export interface VoiceCheckResult {
  studentId: number;
  present: boolean;
  similarity: number;
  threshold: number;
}

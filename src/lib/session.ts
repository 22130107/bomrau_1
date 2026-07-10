import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  userId: number;
  username: string;
  displayName: string;
  role: "admin" | "npp" | "user";
  expiresAt: Date;
}

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

// Session duration: 10 minutes
const SESSION_DURATION_MS = 10 * 60 * 1000;

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: number,
  username: string,
  role: "admin" | "npp" | "user",
  displayName?: string
) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, username, displayName: displayName || username, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: false, // Loại bỏ bắt buộc HTTPS
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  const payload = await decrypt(session);
  if (!payload) return null;

  // Check expiry
  if (new Date(payload.expiresAt) < new Date()) {
    await deleteSession();
    return null;
  }

  return payload;
}

export async function updateSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) return null;

  // Extend session by 10 minutes from now
  const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const newPayload: SessionPayload = {
    userId: payload.userId,
    username: payload.username,
    displayName: payload.displayName,
    role: payload.role,
    expiresAt: newExpiresAt,
  };

  const newSession = await encrypt(newPayload);

  cookieStore.set("session", newSession, {
    httpOnly: true,
    secure: false, // Loại bỏ bắt buộc HTTPS
    expires: newExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

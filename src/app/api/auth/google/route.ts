import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importJWK, decodeProtectedHeader } from "jose";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface GoogleTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  aud: string | string[];
  iss: string;
}

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  display_name: string | null;
  role: "admin" | "npp" | "user";
}

interface JWK {
  kty: string;
  kid: string;
  n: string;
  e: string;
  use: string;
  alg: string;
}

interface JWKS {
  keys: JWK[];
}

let jwksCache: JWKS | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 3600_000; // 1 hour

async function getGoogleJWKS(): Promise<JWKS> {
  const now = Date.now();
  if (jwksCache && now - jwksCacheTime < JWKS_CACHE_TTL) {
    return jwksCache;
  }
  const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!res.ok) {
    throw new Error(`Failed to fetch Google JWKS: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as JWKS;
  jwksCache = data;
  jwksCacheTime = now;
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: "Thiếu mã xác thực Google." }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing GOOGLE_CLIENT_ID env var");
      return NextResponse.json({ error: "Lỗi cấu hình server." }, { status: 500 });
    }

    const header = decodeProtectedHeader(credential);
    if (!header.kid) {
      return NextResponse.json({ error: "Token không có kid." }, { status: 401 });
    }

    const jwks = await getGoogleJWKS();
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      return NextResponse.json({ error: "Không tìm thấy khóa public phù hợp." }, { status: 401 });
    }

    const publicKey = await importJWK(jwk as any, header.alg);

    const { payload: raw } = await jwtVerify(credential, publicKey, {
      issuer: ["accounts.google.com", "https://accounts.google.com"],
      audience: clientId,
    });

    const payload = raw as unknown as GoogleTokenPayload;

    if (!payload.sub) {
      return NextResponse.json({ error: "Token không chứa sub." }, { status: 401 });
    }

    const googleId = payload.sub;
    const email = payload.email || "";
    const name = payload.name || email.split("@")[0] || "user";

    const [existing] = await pool.query<UserRow[]>(
      "SELECT id, username, display_name, role FROM users WHERE google_id = ? LIMIT 1",
      [googleId]
    );

    let user: UserRow;

    if (existing.length > 0) {
      user = existing[0];
      // Cập nhật display_name nếu tên Google thay đổi
      if (name && name !== user.username) {
        await pool.query("UPDATE users SET display_name = ? WHERE id = ?", [name, user.id]);
      }
    } else {
      let baseUsername = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20);

      if (!baseUsername) {
        baseUsername = `user_${googleId.slice(0, 8)}`;
      }

      const [sameName] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE username = ? LIMIT 1",
        [baseUsername]
      );

      if (sameName.length > 0) {
        baseUsername = `${baseUsername}_${Math.random().toString(36).slice(2, 6)}`;
      }

      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO users (username, display_name, email, password_hash, google_id, role, is_active) VALUES (?, ?, ?, '', ?, 'user', 1)",
        [baseUsername, name || null, email || null, googleId]
      );

      user = { id: result.insertId, username: baseUsername, display_name: name || null, role: "user" } as UserRow;
    }

    await createSession(user.id, user.username, user.role, user.display_name || user.username);

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Google auth error:", msg);
    return NextResponse.json({ error: "Xác thực Google thất bại: " + msg }, { status: 401 });
  }
}

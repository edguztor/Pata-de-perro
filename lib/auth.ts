// Authentication primitives — session tokens + password hashing.
// Uses the Web Crypto API (globalThis.crypto.subtle) so the same code runs in
// the proxy (edge-style) and in Node route handlers.

export type Role = "ADMIN" | "RECEPTIONIST";

export interface SessionPayload {
  sub: number;        // user id
  username: string;
  name: string;
  role: Role;
  exp: number;        // unix seconds
}

const SESSION_COOKIE = "pdp_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PBKDF2_ITERATIONS = 100_000;

export const sessionCookieName = SESSION_COOKIE;
export const sessionMaxAge = SESSION_TTL_SECONDS;

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "pata-de-perro-dev-secret-change-me";
}

// ---------- base64url helpers ----------
function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const encoder = new TextEncoder();

// TS's DOM lib types crypto methods to ArrayBuffer-backed BufferSource; our
// Uint8Arrays are structurally fine, so coerce them at the call sites.
const buf = (u: Uint8Array): BufferSource => u as unknown as BufferSource;

// ---------- session token (HMAC-SHA256 signed) ----------
async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    buf(encoder.encode(getSecret())),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
  ttlSeconds = SESSION_TTL_SECONDS
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(full)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, buf(encoder.encode(body)));
  return `${body}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      buf(base64UrlToBytes(sig)),
      buf(encoder.encode(body))
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- password hashing (PBKDF2-SHA256) ----------
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = base64UrlToBytes(parts[2]);
  const expected = base64UrlToBytes(parts[3]);
  const actual = await deriveBits(password, salt, iterations);
  if (actual.length !== expected.length) return false;
  // constant-time-ish compare
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

async function deriveBits(password: string, salt: Uint8Array, iterations = PBKDF2_ITERATIONS): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    buf(encoder.encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: buf(salt), iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

// ---------- route access rules ----------
// Paths a receptionist is allowed to reach. Everything else is admin-only.
const RECEPTIONIST_ALLOWED_PREFIXES = ["/bed-map", "/reservations"];

export function canAccessPath(role: Role, pathname: string): boolean {
  if (role === "ADMIN") return true;
  // Receptionist
  return RECEPTIONIST_ALLOWED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function defaultPathForRole(role: Role): string {
  return role === "ADMIN" ? "/" : "/bed-map";
}

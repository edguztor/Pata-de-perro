import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName, type SessionPayload, type Role } from "./auth";

/** Read + verify the current session from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  return verifySessionToken(token);
}

/** Throws-free helper: returns true if the current user has the given role. */
export async function hasRole(role: Role): Promise<boolean> {
  const session = await getSession();
  return session?.role === role;
}

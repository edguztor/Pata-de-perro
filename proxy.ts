import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, canAccessPath, defaultPathForRole, sessionCookieName } from "@/lib/auth";

// Public paths that never require a session.
const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(sessionCookieName)?.value;
  const session = await verifySessionToken(token);

  // Already-authenticated users shouldn't see the login page.
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(defaultPathForRole(session.role), request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // Not signed in → send to login, remembering where they wanted to go.
  if (!session) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but role isn't allowed here → bounce to their home page.
  if (!canAccessPath(session.role, pathname)) {
    return NextResponse.redirect(new URL(defaultPathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except API, Next internals, and static/public assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};

import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'lds_session';

/** Admin areas. Everything else — the public form, /login — stays open. */
const PROTECTED = [
  '/dashboard',
  '/account',
  '/brokers',
  '/form',
  '/distribution',
  '/leads',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the destination so login can return the admin where they were.
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in: skip the login form.
  if (pathname === '/login' && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

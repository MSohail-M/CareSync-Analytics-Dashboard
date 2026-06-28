import { NextResponse, type NextRequest } from 'next/server'

// Middleware is minimal — auth is handled in the dashboard layout server component.
// Only purpose here: keep /api/webhook public.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

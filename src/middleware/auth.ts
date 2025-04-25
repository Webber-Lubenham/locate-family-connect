import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not authenticated and trying to access protected routes
  if (!session && pathname !== '/auth/login' && pathname !== '/auth/register') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If the user is authenticated and trying to access auth pages
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

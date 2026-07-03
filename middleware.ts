// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('planwise_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Bloqueia acesso ao /onboarding ou /dashboard se não houver token
  if ((pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/workspace')) && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 2. Impede que usuários logados acessem a tela de auth
  // Note: removi o pathname.startsWith('') para não travar a navegação
  if (pathname.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Define explicitamente quais rotas acionam este middleware
export const config = {
  matcher: [
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/auth',
    '/workspace/:path*',
  ],
};
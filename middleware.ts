import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/.well-known')) {
    return NextResponse.next();  // Next.js 기본 처리 진행
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};

/**
 * url 이 통째로 수정가능할수 있다고 생각하면 메뉴에 대한 변하지않는 pk 가 무조건 필요.
 * 그걸로 redirect 할떄 login url 을 찾아서 보내야됨.
 */
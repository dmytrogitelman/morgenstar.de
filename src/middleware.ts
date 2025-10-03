import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, securityHeaders, contentSecurityPolicy } from '@/lib/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply Content Security Policy
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const isStrict = request.nextUrl.pathname.includes('/auth/') || 
                     request.nextUrl.pathname.includes('/orders');
    
    const rateLimitResult = rateLimit(isStrict)(request);
    
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: rateLimitResult.error,
          retryAfter: rateLimitResult.resetTime 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  }

  // Prevent access to sensitive files
  if (request.nextUrl.pathname.includes('.env') || 
      request.nextUrl.pathname.includes('prisma/') ||
      request.nextUrl.pathname.includes('.sqlite')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

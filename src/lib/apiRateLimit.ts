import { NextRequest } from 'next/server';
import { config } from '@/lib/config';
import { KeyedRateLimiter } from '@/utils/rateLimiter';

const apiRateLimiter = new KeyedRateLimiter();

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}

export function enforceApiRateLimit(request: NextRequest): Response | null {
  const ip = getClientIp(request);
  const { windowMs, maxRequests } = config.rateLimit;

  if (apiRateLimiter.tryAcquire(ip, maxRequests, windowMs)) {
    return null;
  }

  const retryAfterSec = Math.ceil(
    apiRateLimiter.retryAfterMs(ip, maxRequests, windowMs) / 1000
  );

  return Response.json(
    {
      success: false,
      error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.',
    },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(retryAfterSec, 1)) },
    }
  );
}

// src/middleware/rateLimiter.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const inMemoryStore = new Map<string, { count: number; timestamp: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100 // límite por IP
};

const sensitiveRoutes = [
  '/api/auth',
  '/api/admin',
  '/api/openai'
];

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): NextResponse | null {
  // Skip rate limiting for non-sensitive routes
  if (!sensitiveRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return null;
  }

  const ip = request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    request.headers.get('x-client-ip') ||
    'anonymous';
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean old entries
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.timestamp < windowStart) {
      inMemoryStore.delete(key);
    }
  }

  const currentLimit = inMemoryStore.get(ip);

  if (!currentLimit) {
    inMemoryStore.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (currentLimit.timestamp < windowStart) {
    // Reset if window has passed
    inMemoryStore.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (currentLimit.count >= config.maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  currentLimit.count++;
  return null;
}
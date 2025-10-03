import { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  strictMaxRequests: 20, // 20 requests per window for strict endpoints
};

// Clean expired entries
const cleanExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Rate limiting middleware
export const rateLimit = (strict: boolean = false) => {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = RATE_LIMIT_CONFIG.windowMs;
    const maxRequests = strict ? RATE_LIMIT_CONFIG.strictMaxRequests : RATE_LIMIT_CONFIG.maxRequests;
    
    // Clean expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanExpiredEntries();
    }

    const key = `${ip}-${req.nextUrl.pathname}`;
    const current = rateLimitStore.get(key);

    if (!current) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (current.resetTime < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (current.count >= maxRequests) {
      return { 
        success: false, 
        error: 'Rate limit exceeded', 
        resetTime: current.resetTime 
      };
    }

    current.count++;
    return { success: true, remaining: maxRequests - current.count };
  };
};

// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { valid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  // In production, use a proper CSRF token validation
  return token === sessionToken;
};

// Security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
};

// Content Security Policy
export const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://www.google-analytics.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

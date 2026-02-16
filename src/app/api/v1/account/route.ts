import { NextRequest, NextResponse } from 'next/server';
import { renderAccountPage } from '@/adapter/renderers/account';
import { responseHeaders } from '@/adapter/http/headers';
import {
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  RATE_LIMITS,
} from '@/adapter/http/rate-limit';
import {
  generateRequestId,
  setRequestId,
  logRenderRequest,
  logRenderComplete,
  logValidationError,
  logError,
} from '@/adapter/logging/logger';
import { AccountRenderRequestSchema, validateRequest } from '@/core/schemas';

// Force dynamic rendering - prevent Vercel/CDN from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  setRequestId(requestId);
  const startTime = Date.now();

  // Rate limit check FIRST (before any processing)
  const rateLimitResult = checkRateLimit(request, RATE_LIMITS.ACCOUNT);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    // Parse request body
    const body = await request.json();

    // Log incoming request
    logRenderRequest('account', requestId, {
      home_url: body.home_url,
      page_type: body.page_type,
    });

    // Validate with Zod schema
    const validation = validateRequest(AccountRenderRequestSchema, body, 'invalid-request');

    if (!validation.success) {
      logValidationError('account request', validation.response, requestId);
      return validation.response;
    }

    // Render the account page
    const html = await renderAccountPage(validation.data);

    // Log successful render
    logRenderComplete('account', requestId, Date.now() - startTime, true);

    // Return complete HTML document with rate limit headers
    return new NextResponse(html, {
      status: 200,
      headers: {
        ...responseHeaders,
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    // Log the error with context
    logError('Account render error', error, { request_id: requestId });
    logRenderComplete('account', requestId, Date.now() - startTime, false);

    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { reason: 'invalid-json', message: 'Invalid JSON in request body' },
        {
          status: 503,
          headers: { 'x-flexi-fallback': 'invalid-json' },
        },
      );
    }

    // Return 503 with fallback header for WordPress to use native rendering
    return NextResponse.json(
      { reason: 'render-error', message: 'Internal rendering error' },
      {
        status: 503,
        headers: { 'x-flexi-fallback': 'render-error' },
      },
    );
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

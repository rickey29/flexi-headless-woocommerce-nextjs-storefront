import { NextRequest, NextResponse } from 'next/server';
import { renderProductPage } from '@/lib/renderers/product';
import {
  responseHeaders,
  generateRequestId,
  logRenderRequest,
  logRenderComplete,
  logValidationError,
  logError,
  sanitizeProductData,
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/utils';
import { ProductRenderRequestSchema, validateRequest } from '@/lib/schemas';

// Force dynamic rendering - prevent Vercel/CDN from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Rate limit check FIRST (before any processing)
  const rateLimitResult = checkRateLimit(request, RATE_LIMITS.PRODUCT);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    // Parse request body
    const body = await request.json();

    // Log incoming request with sanitized product data
    logRenderRequest('product', requestId, {
      home_url: body.home_url,
      product: sanitizeProductData(body.product_data),
    });

    // Validate with Zod schema
    const validation = validateRequest(ProductRenderRequestSchema, body, 'invalid-request');

    if (!validation.success) {
      logValidationError('product request', validation.response, requestId);
      return validation.response;
    }

    // Render the product page
    const html = await renderProductPage(validation.data);

    // Log successful render
    logRenderComplete('product', requestId, Date.now() - startTime, true);

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
    logError('Product render error', error, { request_id: requestId });
    logRenderComplete('product', requestId, Date.now() - startTime, false);

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

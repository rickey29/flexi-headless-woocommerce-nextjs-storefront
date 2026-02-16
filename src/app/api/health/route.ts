/**
 * Health Check Endpoint
 *
 * Used by:
 * - Cloudflare Health Checks
 * - UptimeRobot / External Monitoring
 * - PM2 health monitoring
 * - Load balancers (future use)
 *
 * Returns 200 OK with system metrics if healthy
 * Returns 503 Service Unavailable if unhealthy
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  RATE_LIMITS,
} from '@/adapter/http/rate-limit';
import { logError } from '@/adapter/logging/logger';

/**
 * GET /api/health
 *
 * Quick health check with minimal overhead
 * Should respond in <50ms under normal conditions
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting (higher limit for monitoring)
  const rateLimitResult = checkRateLimit(request, RATE_LIMITS.HEALTH);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    // Basic health checks
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Check TOTAL memory usage (RSS) against PM2 limit (400MB)
    // RSS (Resident Set Size) = actual memory used by process
    // This is what PM2 monitors for max_memory_restart
    const rssMB = memoryUsage.rss / 1024 / 1024;
    const PM2_LIMIT_MB = 400; // Must match ecosystem.config.js
    const rssPercent = (rssMB / PM2_LIMIT_MB) * 100;

    // Health status based on RSS (not heap)
    // - Healthy: <80% of PM2 limit (< 320MB)
    // - Degraded: 80-95% of PM2 limit (320-380MB) - warning but operational
    // - Unhealthy: >95% of PM2 limit (> 380MB, about to restart)
    const isHealthy = rssPercent < 80;
    const isDegraded = rssPercent >= 80 && rssPercent < 95;

    // Still calculate heap for monitoring purposes (V8 commonly runs at 90-98%)
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Determine status
    let status: string;
    let statusCode: number;
    if (isHealthy) {
      status = 'ok';
      statusCode = 200;
    } else if (isDegraded) {
      status = 'degraded';
      statusCode = 200; // Still operational, just warning
    } else {
      status = 'unhealthy';
      statusCode = 503;
    }

    const response = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '1.1.0',
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsedPercent: Math.round(heapUsedPercent),
        rss: Math.round(rssMB), // MB (total memory - this is what matters!)
        rssPercent: Math.round(rssPercent),
        pm2Limit: PM2_LIMIT_MB,
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
      },
    };

    // Include rate limit headers in response
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        ...rateLimitHeaders,
      },
    });
  } catch (error) {
    // If health check itself fails, return 503
    logError('Health check failed', error instanceof Error ? error : undefined);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      },
    );
  }
}

/**
 * HEAD /api/health
 *
 * Lightweight health check (no body)
 * Some monitoring tools prefer HEAD requests
 */
export async function HEAD(request: NextRequest) {
  // Apply rate limiting (higher limit for monitoring)
  const rateLimitResult = checkRateLimit(request, RATE_LIMITS.HEALTH);
  if (!rateLimitResult.allowed) {
    // For HEAD requests, return empty body with 429 status
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    return new NextResponse(null, {
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter.toString(),
        ...rateLimitHeaders,
      },
    });
  }

  const memoryUsage = process.memoryUsage();
  const rssMB = memoryUsage.rss / 1024 / 1024;
  const PM2_LIMIT_MB = 400;
  const rssPercent = (rssMB / PM2_LIMIT_MB) * 100;
  const isHealthy = rssPercent < 95; // Unhealthy only if approaching PM2 restart

  // Include rate limit headers in response
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  return new NextResponse(null, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      ...rateLimitHeaders,
    },
  });
}

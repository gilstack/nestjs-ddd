import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { FastifyRequest } from 'fastify';
import { AppConfig } from '@/infrastructure/config';

interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  memoryUsage?: NodeJS.MemoryUsage;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly metrics: Map<string, PerformanceMetrics[]> = new Map();
  private readonly maxMetricsPerEndpoint = 100; // Keep last 100 requests per endpoint
  private slowQueryThreshold: number;
  private performanceLoggingEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');
    this.slowQueryThreshold = appConfig?.monitoring?.slowQueryThreshold || 1000;
    this.performanceLoggingEnabled =
      appConfig?.monitoring?.performanceLogging || false;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.performanceLoggingEnabled) {
      return next.handle();
    }

    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse();

    const { method, url } = request;
    const userAgent = request.headers['user-agent'] || '';
    const ip = request.ip;
    const endpoint = `${method} ${url.split('?')[0]}`; // Remove query params for grouping

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = process.hrtime.bigint();
          const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
          const endMemory = process.memoryUsage();

          const metrics: PerformanceMetrics = {
            path: url,
            method,
            duration,
            timestamp: new Date(),
            statusCode: response.statusCode,
            userAgent,
            ip,
            memoryUsage: {
              rss: endMemory.rss - startMemory.rss,
              heapUsed: endMemory.heapUsed - startMemory.heapUsed,
              heapTotal: endMemory.heapTotal - startMemory.heapTotal,
              external: endMemory.external - startMemory.external,
              arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
            },
          };

          this.recordMetrics(endpoint, metrics);
          this.logPerformance(metrics);
        },
        error: (error) => {
          const endTime = process.hrtime.bigint();
          const duration = Number(endTime - startTime) / 1_000_000;

          this.logger.error(
            `Request failed: ${method} ${url} - ${duration.toFixed(2)}ms - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }

  /**
   * Record metrics for analysis
   */
  private recordMetrics(endpoint: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }

    const endpointMetrics = this.metrics.get(endpoint);
    if (endpointMetrics) {
      endpointMetrics.push(metrics);

      // Keep only the last N requests per endpoint
      if (endpointMetrics.length > this.maxMetricsPerEndpoint) {
        endpointMetrics.shift();
      }
    }
  }

  /**
   * Log performance based on thresholds
   */
  private logPerformance(metrics: PerformanceMetrics): void {
    const { duration, method, path, statusCode, ip } = metrics;

    // Log slow requests
    if (duration > this.slowQueryThreshold) {
      this.logger.warn(
        `🐌 Slow request: ${method} ${path} - ${duration.toFixed(2)}ms - Status: ${statusCode} - IP: ${ip}`,
      );
    }

    // Log memory-intensive requests
    if (
      metrics.memoryUsage &&
      metrics.memoryUsage.heapUsed > 50 * 1024 * 1024
    ) {
      // 50MB
      this.logger.warn(
        `🧠 Memory-intensive request: ${method} ${path} - ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB heap used`,
      );
    }

    // Debug logging for all requests in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `📊 ${method} ${path} - ${duration.toFixed(2)}ms - Status: ${statusCode}`,
      );
    }
  }

  /**
   * Get performance statistics for an endpoint
   */
  getEndpointStats(endpoint: string): Record<string, unknown> | null {
    const metrics = this.metrics.get(endpoint);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const slowRequests = metrics.filter(
      (m) => m.duration > this.slowQueryThreshold,
    ).length;

    // Calculate percentiles
    const sortedDurations = durations.sort((a, b) => a - b);
    const p95Index = Math.ceil(0.95 * sortedDurations.length) - 1;
    const p99Index = Math.ceil(0.99 * sortedDurations.length) - 1;

    return {
      endpoint,
      totalRequests: metrics.length,
      avgDuration: Math.round(avgDuration * 100) / 100,
      minDuration: Math.round(minDuration * 100) / 100,
      maxDuration: Math.round(maxDuration * 100) / 100,
      p95Duration: Math.round((sortedDurations[p95Index] ?? 0) * 100) / 100,
      p99Duration: Math.round((sortedDurations[p99Index] ?? 0) * 100) / 100,
      slowRequests,
      slowRequestsPercentage:
        Math.round((slowRequests / metrics.length) * 100 * 100) / 100,
      lastUpdated: metrics[metrics.length - 1]?.timestamp ?? new Date(),
    };
  }

  /**
   * Get overall performance statistics
   */
  getOverallStats(): Record<string, unknown> {
    const allMetrics = Array.from(this.metrics.values()).flat();
    if (allMetrics.length === 0) {
      return { totalRequests: 0, endpoints: 0 };
    }

    const durations = allMetrics.map((m) => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const slowRequests = allMetrics.filter(
      (m) => m.duration > this.slowQueryThreshold,
    ).length;

    return {
      totalRequests: allMetrics.length,
      endpoints: this.metrics.size,
      avgDuration: Math.round(avgDuration * 100) / 100,
      slowRequests,
      slowRequestsPercentage:
        Math.round((slowRequests / allMetrics.length) * 100 * 100) / 100,
      slowQueryThreshold: this.slowQueryThreshold,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.logger.log('Performance metrics cleared');
  }
}

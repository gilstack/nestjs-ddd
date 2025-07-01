import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '@/infrastructure/cache/redis-cache.service';
import { AsyncTaskService } from '@/infrastructure/async-tasks/async-task.service';
import { PerformanceInterceptor } from '@/shared/interceptors/performance.interceptor';
import type { AppConfig } from '@/infrastructure/config';

/**
 * Helper function to safely extract error messages
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Health check response interfaces
 */
interface CacheHealthResult {
  cache: {
    status: 'up' | 'down';
    error?: string;
  };
}

interface AppInfoResult {
  app: {
    status: 'up' | 'down';
    name: string;
    version: string;
    environment: string;
    uptime: number;
    timestamp: string;
    features: {
      cache: boolean;
      asyncTasks: boolean;
      performanceLogging: boolean;
    };
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private configService: ConfigService,
    private cacheService: RedisCacheService,
    private asyncTaskService: AsyncTaskService,
    private performanceInterceptor: PerformanceInterceptor,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkCache(),
      () => this.getAppInfo(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkCache(),
    ]);
  }

  @Get('metrics')
  async getMetrics() {
    const appConfig = this.configService.get<AppConfig>('app');

    if (!appConfig?.features.healthChecksEnabled) {
      return { error: 'Health checks are disabled' };
    }

    const [cacheStats, taskStats, performanceStats, systemInfo] =
      await Promise.all([
        this.getCacheStats(),
        this.getTaskStats(),
        this.getPerformanceStats(),
        this.getSystemInfo(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache: cacheStats,
      tasks: taskStats,
      performance: performanceStats,
      system: systemInfo,
    };
  }

  @Get('cache')
  async getCacheHealth() {
    return {
      cache: await this.getCacheStats(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('performance')
  async getPerformanceMetrics() {
    return {
      performance: this.getPerformanceStats(),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkCache(): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.cacheService.healthCheck();
      return {
        cache: {
          status: isHealthy ? 'up' : 'down',
        },
      } as HealthIndicatorResult;
    } catch (error) {
      return {
        cache: {
          status: 'down',
          error: getErrorMessage(error),
        },
      } as HealthIndicatorResult;
    }
  }

  private async getCacheStats() {
    try {
      const [stats, redisInfo] = await Promise.all([
        this.cacheService.getStats(),
        this.cacheService.getInfo(),
      ]);

      return {
        status: 'up',
        stats,
        redisInfo: redisInfo ? 'connected' : 'disconnected',
      };
    } catch (error) {
      return {
        status: 'down',
        error: getErrorMessage(error),
      };
    }
  }

  private getTaskStats() {
    try {
      return {
        status: 'up',
        ...this.asyncTaskService.getQueueStats(),
      };
    } catch (error) {
      return {
        status: 'down',
        error: getErrorMessage(error),
      };
    }
  }

  private getPerformanceStats() {
    try {
      return {
        status: 'up',
        overall: this.performanceInterceptor.getOverallStats(),
      };
    } catch (error) {
      return {
        status: 'down',
        error: getErrorMessage(error),
      };
    }
  }

  private getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status: 'up',
      nodejs: {
        version: process.version,
        uptime: process.uptime(),
        pid: process.pid,
        platform: process.platform,
        arch: process.arch,
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    };
  }

  private async getAppInfo(): Promise<HealthIndicatorResult> {
    const appConfig = this.configService.get<AppConfig>('app');
    return {
      app: {
        status: 'up',
        name: appConfig?.name || 'Storagie Backend',
        version: appConfig?.version || '1.0.0',
        environment: appConfig?.env || 'unknown',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        features: {
          cache: Boolean(appConfig?.features.cacheEnabled),
          asyncTasks: Boolean(appConfig?.features.asyncTasksEnabled),
          performanceLogging: Boolean(appConfig?.features.performanceLogging),
        },
      },
    } as HealthIndicatorResult;
  }
}

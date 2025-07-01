import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/presentation/controllers/health/health.controller';
import { AsyncTaskModule } from '@/infrastructure/async-tasks/async-task.module';
import { PerformanceInterceptor } from '@/shared/interceptors/performance.interceptor';

@Module({
  imports: [TerminusModule, AsyncTaskModule],
  controllers: [HealthController],
  providers: [PerformanceInterceptor],
})
export class HealthModule {}

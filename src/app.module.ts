import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration
import { allConfigs } from '@/infrastructure/config';
// Feature Modules
import { UsersModule } from '@/presentation/modules/users.module';

// Health Check Module
import { HealthModule } from '@/presentation/modules/health.module';
import { CacheModule } from '@/infrastructure/cache/cache.module';
import { AsyncTaskModule } from '@/infrastructure/async-tasks/async-task.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: allConfigs,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),

    // Database Module
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('database')!;
      },
    }),

    // Feature Modules
    CacheModule,
    AsyncTaskModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsyncTaskService } from './async-task.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AsyncTaskService],
  exports: [AsyncTaskService],
})
export class AsyncTaskModule {}

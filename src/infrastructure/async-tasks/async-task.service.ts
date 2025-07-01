import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/infrastructure/config';

export interface TaskOptions {
  delay?: number; // Delay in milliseconds
  priority?: 'low' | 'normal' | 'high';
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  runningTasks: number;
  maxConcurrentTasks: number;
  workers: number;
  isEnabled: boolean;
  byPriority: {
    high: number;
    normal: number;
    low: number;
  };
}

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

export interface TaskResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  attempts: number;
}

export interface QueuedTask {
  id: string;
  name: string;
  handler: () => Promise<unknown>;
  options: Required<TaskOptions>;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

@Injectable()
export class AsyncTaskService implements OnModuleDestroy {
  private readonly logger = new Logger(AsyncTaskService.name);
  private readonly tasks = new Map<string, QueuedTask>();
  private readonly workers = new Set<NodeJS.Timeout>();
  private readonly maxConcurrentTasks: number = 5;
  private readonly defaultRetries: number = 3;
  private readonly defaultRetryDelay: number = 5000; // 5 seconds
  private readonly defaultTimeout: number = 30000; // 30 seconds
  private isEnabled: boolean;
  private isShuttingDown = false;
  private runningTasks = 0;

  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');
    this.isEnabled = appConfig?.features?.asyncTasksEnabled ?? false;

    if (this.isEnabled) {
      this.startWorkers();
      this.logger.log('Async Task Service started');
    } else {
      this.logger.warn('Async Task Service is disabled via feature flag');
    }
  }

  /**
   * Add a task to the queue
   */
  async addTask<T>(
    name: string,
    handler: () => Promise<T>,
    options: TaskOptions = {},
  ): Promise<string> {
    if (!this.isEnabled) {
      this.logger.warn('Task rejected: Async Task Service is disabled');
      throw new Error('Async Task Service is disabled');
    }

    const taskId = this.generateTaskId();
    const task: QueuedTask = {
      id: taskId,
      name,
      handler,
      options: {
        delay: options.delay ?? 0,
        priority: options.priority ?? 'normal',
        retries: options.retries ?? this.defaultRetries,
        retryDelay: options.retryDelay ?? this.defaultRetryDelay,
        timeout: options.timeout ?? this.defaultTimeout,
      },
      createdAt: new Date(),
      attempts: 0,
      status: 'pending',
    };

    this.tasks.set(taskId, task);
    this.logger.debug(`Task queued: ${name} (${taskId})`);

    return taskId;
  }

  /**
   * Add a delayed task
   */
  async addDelayedTask<T>(
    name: string,
    handler: () => Promise<T>,
    delayMs: number,
    options: Omit<TaskOptions, 'delay'> = {},
  ): Promise<string> {
    return this.addTask(name, handler, { ...options, delay: delayMs });
  }

  /**
   * Add a high-priority task
   */
  async addPriorityTask<T>(
    name: string,
    handler: () => Promise<T>,
    options: Omit<TaskOptions, 'priority'> = {},
  ): Promise<string> {
    return this.addTask(name, handler, { ...options, priority: 'high' });
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): QueuedTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Cancel a pending task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'running' || task.status === 'completed') {
      return false;
    }

    this.tasks.delete(taskId);
    this.logger.debug(`Task cancelled: ${task.name} (${taskId})`);
    return true;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): QueueStats {
    const tasks = Array.from(this.tasks.values());
    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      runningTasks: this.runningTasks,
      maxConcurrentTasks: this.maxConcurrentTasks,
      workers: this.workers.size,
      isEnabled: this.isEnabled,
    };

    // Group by priority
    const byPriority = {
      high: tasks.filter(
        (t) => t.options.priority === 'high' && t.status === 'pending',
      ).length,
      normal: tasks.filter(
        (t) => t.options.priority === 'normal' && t.status === 'pending',
      ).length,
      low: tasks.filter(
        (t) => t.options.priority === 'low' && t.status === 'pending',
      ).length,
    };

    return { ...stats, byPriority };
  }

  /**
   * Clear completed and failed tasks
   */
  clearCompletedTasks(): number {
    const tasks = Array.from(this.tasks.entries());
    const toRemove = tasks.filter(
      ([_, task]) => task.status === 'completed' || task.status === 'failed',
    );

    toRemove.forEach(([taskId]) => this.tasks.delete(taskId));

    this.logger.log(`Cleared ${toRemove.length} completed/failed tasks`);
    return toRemove.length;
  }

  /**
   * Start worker processes
   */
  private startWorkers(): void {
    for (let i = 0; i < this.maxConcurrentTasks; i++) {
      const worker = setInterval(async () => {
        if (this.isShuttingDown) return;
        await this.processNextTask();
      }, 100); // Check every 100ms

      this.workers.add(worker);
    }
  }

  /**
   * Process the next available task
   */
  private async processNextTask(): Promise<void> {
    if (this.runningTasks >= this.maxConcurrentTasks) {
      return;
    }

    const task = this.getNextTask();
    if (!task) {
      return;
    }

    this.runningTasks++;
    task.status = 'running';
    task.attempts++;
    task.lastAttempt = new Date();

    try {
      const startTime = Date.now();

      // Execute task with timeout
      const result = await this.executeWithTimeout(
        task.handler,
        task.options.timeout ?? this.defaultTimeout,
      );

      const executionTime = Date.now() - startTime;

      task.status = 'completed';
      this.logger.debug(
        `Task completed: ${task.name} (${task.id}) - ${executionTime}ms`,
      );

      // Remove completed task after some time to free memory
      setTimeout(() => {
        this.tasks.delete(task.id);
      }, 60000); // Keep for 1 minute
    } catch (error) {
      this.logger.error(
        `Task failed: ${task.name} (${task.id}) - ${getErrorMessage(error)}`,
      );

      if (task.attempts < (task.options.retries ?? 0)) {
        // Schedule retry
        task.status = 'pending';
        task.nextRetry = new Date(
          Date.now() + (task.options.retryDelay ?? this.defaultRetryDelay),
        );
        this.logger.debug(
          `Task scheduled for retry: ${task.name} (${task.id}) - Attempt ${task.attempts + 1}`,
        );
      } else {
        // Mark as failed
        task.status = 'failed';
        this.logger.error(
          `Task failed permanently: ${task.name} (${task.id}) - Max retries exceeded`,
        );
      }
    } finally {
      this.runningTasks--;
    }
  }

  /**
   * Get the next task to process (considering priority and delays)
   */
  private getNextTask(): QueuedTask | null {
    const now = new Date();
    const availableTasks = Array.from(this.tasks.values()).filter((task) => {
      if (task.status !== 'pending') return false;
      if (task.nextRetry && task.nextRetry > now) return false;

      // Check if delay has passed
      const scheduledTime = new Date(
        task.createdAt.getTime() + (task.options.delay ?? 0),
      );
      return scheduledTime <= now;
    });

    if (availableTasks.length === 0) {
      return null;
    }

    // Sort by priority (high > normal > low) and then by creation time
    availableTasks.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.options.priority || 'normal'];
      const bPriority = priorityOrder[b.options.priority || 'normal'];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return availableTasks[0] ?? null;
  }

  /**
   * Execute a task with timeout
   */
  private async executeWithTimeout<T>(
    handler: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      handler()
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;

    // Stop all workers
    this.workers.forEach((worker) => clearInterval(worker));
    this.workers.clear();

    // Wait for running tasks to complete (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();

    while (this.runningTasks > 0 && Date.now() - startTime < shutdownTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.runningTasks > 0) {
      this.logger.warn(
        `Shutdown timeout: ${this.runningTasks} tasks still running`,
      );
    }

    this.logger.log('Async Task Service stopped');
  }
}

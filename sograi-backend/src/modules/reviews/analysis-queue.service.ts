import { Injectable, Logger } from '@nestjs/common';

export interface QueueJob<T = any> {
  id: string;
  prUrl: string;
  enqueuedAt: Date;
  execute: () => Promise<T>;
  notifyWaiting?: (position: number, totalInQueue: number) => void;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

@Injectable()
export class AnalysisQueueService {
  private readonly logger = new Logger(AnalysisQueueService.name);
  private isProcessing = false;
  private currentPrUrl: string | null = null;
  private queue: QueueJob[] = [];

  getStatus() {
    return {
      isBusy: this.isProcessing,
      currentPrUrl: this.currentPrUrl,
      queueLength: this.queue.length,
    };
  }

  async enqueue<T>(
    prUrl: string,
    execute: () => Promise<T>,
    notifyWaiting?: (position: number, totalInQueue: number) => void
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const job: QueueJob<T> = {
        id: Math.random().toString(36).substring(2, 9),
        prUrl,
        enqueuedAt: new Date(),
        execute,
        notifyWaiting,
        resolve,
        reject,
      };

      if (!this.isProcessing) {
        this.queue.push(job);
        this.processNext();
      } else {
        this.queue.push(job);
        this.notifyAllWaiting();
      }
    });
  }

  private notifyAllWaiting() {
    this.queue.forEach((job, idx) => {
      if (job.notifyWaiting) {
        job.notifyWaiting(idx + 1, this.queue.length);
      }
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.isProcessing = true;
    this.currentPrUrl = job.prUrl;
    this.logger.log(`Iniciando execução da análise enfileirada: ${job.prUrl}`);
    this.notifyAllWaiting();

    try {
      const result = await job.execute();
      job.resolve(result);
    } catch (err) {
      job.reject(err);
    } finally {
      this.isProcessing = false;
      this.currentPrUrl = null;
      this.processNext();
    }
  }
}

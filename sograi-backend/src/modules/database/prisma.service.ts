import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(' Conectado com sucesso ao PostgreSQL via Prisma ORM!');
    } catch (error: any) {
      this.logger.warn(` Falha ao conectar ao banco via Prisma: ${error?.message || error}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

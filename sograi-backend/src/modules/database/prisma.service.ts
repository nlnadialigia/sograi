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
      await Promise.race([
        this.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de 3s no health check')), 3000)),
      ]);
      return true;
    } catch (error: any) {
      this.logger.warn(`Conexão inativa ou timeout no Postgres (${error?.message || error}). Tentando reconectar...`);
      try {
        await this.$disconnect();
        await this.$connect();
        await this.$queryRaw`SELECT 1`;
        this.logger.log('Reconexão com PostgreSQL restabelecida com sucesso!');
        return true;
      } catch (reconnectErr: any) {
        this.logger.error(`Falha ao restabelecer conexão com PostgreSQL: ${reconnectErr?.message || reconnectErr}`);
        return false;
      }
    }
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  get isSqlite(): boolean {
    return (process.env.DATABASE_URL || '').startsWith('file:');
  }

  get databaseType(): string {
    return this.isSqlite ? 'SQLite' : 'PostgreSQL';
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(`Conectado com sucesso ao ${this.databaseType} via Prisma ORM!`);
    } catch (error: any) {
      this.logger.warn(`Falha ao conectar ao banco via Prisma: ${error?.message || error}`);
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
      this.logger.warn(`Conexão inativa ou timeout no banco de dados (${error?.message || error}). Tentando reconectar...`);
      try {
        await this.$disconnect();
        await this.$connect();
        await this.$queryRaw`SELECT 1`;
        this.logger.log('Reconexão com o banco de dados restabelecida com sucesso!');
        return true;
      } catch (reconnectErr: any) {
        this.logger.error(`Falha ao restabelecer conexão com o banco de dados: ${reconnectErr?.message || reconnectErr}`);
        return false;
      }
    }
  }
}

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseService } from './database.service';
import { PendingItemsRepository } from './pending-items.repository';

@Global()
@Module({
  providers: [PrismaService, DatabaseService, PendingItemsRepository],
  exports: [PrismaService, DatabaseService, PendingItemsRepository],
})
export class DatabaseModule {}

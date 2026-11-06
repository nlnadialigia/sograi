import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PendingItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    prId: string;
    repository: string;
    filePath: string;
    title: string;
    description: string;
    itemType?: string;
    priority?: string;
    authorName?: string;
  }) {
    return this.prisma.manualPendingItem.create({
      data: {
        pullRequestId: data.prId,
        repository: data.repository,
        filePath: data.filePath,
        title: data.title,
        description: data.description,
        itemType: data.itemType || 'TECH_DEBT',
        priority: data.priority || 'MEDIUM',
        authorName: data.authorName || 'Tech Lead',
        status: 'PENDING',
      },
    });
  }

  async findAll(filters?: { repository?: string; status?: string }) {
    const where: any = {};
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.repository && filters.repository !== 'all') {
      where.repository = filters.repository;
    }

    return this.prisma.manualPendingItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPr(repository: string, prId: string) {
    return this.prisma.manualPendingItem.findMany({
      where: { repository, pullRequestId: prId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(id: number, notes?: string) {
    return this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: notes || null,
        resolvedAt: new Date(),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.manualPendingItem.delete({
      where: { id },
    });
  }

  async update(
    id: number,
    data: {
      title?: string;
      description?: string;
      filePath?: string;
      itemType?: string;
      priority?: string;
    }
  ) {
    return this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.filePath ? { filePath: data.filePath } : {}),
        ...(data.itemType ? { itemType: data.itemType } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
      },
    });
  }
}

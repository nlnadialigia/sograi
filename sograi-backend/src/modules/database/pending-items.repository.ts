import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function mapPendingItem(item: any) {
  if (!item) return item;
  return {
    id: item.id,
    pull_request_id: item.pullRequestId,
    pullRequestId: item.pullRequestId,
    repository: item.repository,
    file_path: item.filePath,
    filePath: item.filePath,
    title: item.title,
    description: item.description,
    item_type: item.itemType,
    itemType: item.itemType,
    priority: item.priority,
    author_name: item.authorName,
    authorName: item.authorName,
    status: item.status,
    resolution_notes: item.resolutionNotes,
    resolutionNotes: item.resolutionNotes,
    resolved_at: item.resolvedAt,
    resolvedAt: item.resolvedAt,
    created_at: item.createdAt,
    createdAt: item.createdAt,
  };
}

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
    const created = await this.prisma.manualPendingItem.create({
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
    return mapPendingItem(created);
  }

  async findAll(filters?: { repository?: string; status?: string }) {
    const where: any = {};
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.repository && filters.repository !== 'all') {
      where.repository = filters.repository;
    }

    const items = await this.prisma.manualPendingItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapPendingItem);
  }

  async findByPr(repository: string, prId: string) {
    const items = await this.prisma.manualPendingItem.findMany({
      where: { repository, pullRequestId: prId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapPendingItem);
  }

  async resolve(id: number, notes?: string) {
    const updated = await this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: notes || null,
        resolvedAt: new Date(),
      },
    });
    return mapPendingItem(updated);
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
    const updated = await this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.filePath ? { filePath: data.filePath } : {}),
        ...(data.itemType ? { itemType: data.itemType } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
      },
    });
    return mapPendingItem(updated);
  }
}

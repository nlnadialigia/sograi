import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function mapHistoryItem(h: any) {
  if (!h) return h;
  return {
    id: h.id,
    pending_item_id: h.pendingItemId,
    pendingItemId: h.pendingItemId,
    pull_request_id: h.pullRequestId,
    pullRequestId: h.pullRequestId,
    pr_title: h.prTitle,
    prTitle: h.prTitle,
    author: h.author,
    iteration: h.iteration,
    decision: h.decision,
    justification: h.justification,
    unresolved_at: h.unresolvedAt,
    unresolvedAt: h.unresolvedAt,
  };
}

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
    origin: item.origin || 'MANUAL',
    resolved_by_pr: item.resolvedByPr,
    resolvedByPr: item.resolvedByPr,
    resolution_notes: item.resolutionNotes,
    resolutionNotes: item.resolutionNotes,
    resolved_at: item.resolvedAt,
    resolvedAt: item.resolvedAt,
    created_at: item.createdAt,
    createdAt: item.createdAt,
    history: (item.history || []).map(mapHistoryItem),
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
    origin?: string;
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
        origin: data.origin || 'MANUAL',
        status: 'PENDING',
      },
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
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
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapPendingItem);
  }

  async findByPr(repository: string, prId: string) {
    const items = await this.prisma.manualPendingItem.findMany({
      where: { repository, pullRequestId: prId },
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapPendingItem);
  }

  async findActiveByFile(repository: string, filePath: string) {
    const item = await this.prisma.manualPendingItem.findFirst({
      where: {
        repository,
        filePath,
        status: 'PENDING',
      },
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
      },
    });
    return mapPendingItem(item);
  }

  async addHistoryEntry(data: {
    pendingItemId: number;
    prId: string;
    prTitle?: string;
    author?: string;
    iteration?: number;
    decision?: string;
    justification?: string;
  }) {
    return this.prisma.pendingItemHistory.create({
      data: {
        pendingItemId: data.pendingItemId,
        pullRequestId: data.prId,
        prTitle: data.prTitle,
        author: data.author,
        iteration: data.iteration || 1,
        decision: data.decision || 'REPROVADO',
        justification: data.justification,
      },
    });
  }

  async resolveByPr(id: number, prId: string, author?: string, justification?: string) {
    const notes = `Resolvido automaticamente na análise da PR #${prId}${author ? ` por ${author}` : ''}.${justification ? ` Parecer: ${justification}` : ''}`;
    const updated = await this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedByPr: prId,
        resolutionNotes: notes,
        resolvedAt: new Date(),
      },
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
      },
    });
    return mapPendingItem(updated);
  }

  async syncFromAnalysis(
    prInfo: { prId: string; title: string; author: string; repository: string; iteration?: number },
    files: { filePath: string; verdict: string; justification?: string; issues?: any[] }[]
  ) {
    for (const f of files) {
      const activePending = await this.findActiveByFile(prInfo.repository, f.filePath);

      if (f.verdict === 'REPROVADO') {
        if (activePending) {
          await this.addHistoryEntry({
            pendingItemId: activePending.id,
            prId: prInfo.prId,
            prTitle: prInfo.title,
            author: prInfo.author,
            iteration: prInfo.iteration || 1,
            decision: f.verdict,
            justification: f.justification || 'Arquivo continuou reprovado na auditoria da PR.',
          });
        } else {
          const mainIssue = f.issues?.[0];
          const title = mainIssue?.title || `Reprovação técnica em ${f.filePath}`;
          const description = f.justification || mainIssue?.description || 'Arquivo reprovado durante auditoria da IA.';
          const hasBlocker = (f.issues || []).some((i: any) => i.severity === 'BLOCKER');

          const created = await this.create({
            prId: prInfo.prId,
            repository: prInfo.repository,
            filePath: f.filePath,
            title,
            description,
            itemType: 'TECH_DEBT',
            priority: hasBlocker ? 'HIGH' : 'MEDIUM',
            authorName: 'SogrAI (Análise Automática)',
            origin: 'AUTOMATIC_ANALYSIS',
          });

          await this.addHistoryEntry({
            pendingItemId: created.id,
            prId: prInfo.prId,
            prTitle: prInfo.title,
            author: prInfo.author,
            iteration: prInfo.iteration || 1,
            decision: f.verdict,
            justification: f.justification,
          });
        }
      } else if (f.verdict === 'APROVADO' && activePending) {
        await this.resolveByPr(activePending.id, prInfo.prId, prInfo.author, f.justification);
      }
    }
  }

  async resolve(id: number, notes?: string) {
    const updated = await this.prisma.manualPendingItem.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: notes || null,
        resolvedAt: new Date(),
      },
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
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
      include: {
        history: { orderBy: { unresolvedAt: 'desc' } },
      },
    });
    return mapPendingItem(updated);
  }
}

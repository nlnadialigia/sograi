import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PendingItemsRepository } from '../database/pending-items.repository';

export class CreatePendingItemDto {
  prId: string;
  repository: string;
  filePath?: string;
  file_path?: string;
  description: string;
  itemType?: string;
  priority?: string;
  authorName?: string;
}

export class BatchCreatePendingItemDto {
  items: CreatePendingItemDto[];
}

export class ResolvePendingItemDto {
  notes?: string;
}

@Controller('api/pending-items')
export class PendingItemsController {
  constructor(private readonly pendingRepo: PendingItemsRepository) {}

  @Get()
  async findAll(
    @Query('repository') repository?: string,
    @Query('status') status?: string
  ) {
    return this.pendingRepo.findAll({ repository, status });
  }

  @Get('pr/:repository/:prId')
  async findByPr(
    @Param('repository') repository: string,
    @Param('prId') prId: string
  ) {
    return this.pendingRepo.findByPr(repository, prId);
  }

  @Post()
  async create(@Body() dto: CreatePendingItemDto) {
    const rawPath = (dto.filePath || dto.file_path || '').trim();
    if (!rawPath) {
      throw new Error('O caminho do arquivo modificado (filePath) é obrigatório.');
    }

    const lines = (dto.description || '')
      .split('\n')
      .map((l) => l.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);

    if (lines.length === 0) {
      throw new Error('A descrição da pendência é obrigatória.');
    }

    const createdItems = [];
    for (const line of lines) {
      const title = line.length > 70 ? `${line.slice(0, 67)}...` : line;
      const created = await this.pendingRepo.create({
        prId: String(dto.prId),
        repository: dto.repository,
        filePath: rawPath,
        title,
        description: line,
        itemType: dto.itemType || 'TECH_DEBT',
        priority: dto.priority || 'MEDIUM',
        authorName: dto.authorName || 'Tech Lead',
      });
      createdItems.push(created);
    }

    return createdItems.length === 1 ? createdItems[0] : createdItems;
  }

  @Post('batch')
  async createBatch(@Body() body: { items: CreatePendingItemDto[] }) {
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    if (rawItems.length === 0) {
      throw new Error('Nenhum item fornecido para cadastro em lote.');
    }

    const allCreated = [];
    for (const dto of rawItems) {
      const rawPath = (dto.filePath || dto.file_path || '').trim();
      if (!rawPath) continue;

      const lines = (dto.description || '')
        .split('\n')
        .map((l) => l.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean);

      for (const line of lines) {
        const title = line.length > 70 ? `${line.slice(0, 67)}...` : line;
        const created = await this.pendingRepo.create({
          prId: String(dto.prId),
          repository: dto.repository,
          filePath: rawPath,
          title,
          description: line,
          itemType: dto.itemType || 'TECH_DEBT',
          priority: dto.priority || 'MEDIUM',
          authorName: dto.authorName || 'Tech Lead',
        });
        allCreated.push(created);
      }
    }

    return { success: true, count: allCreated.length, items: allCreated };
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolvePendingItemDto
  ) {
    return this.pendingRepo.resolve(id, dto.notes);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { title?: string; description?: string; filePath?: string; itemType?: string; priority?: string }
  ) {
    return this.pendingRepo.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.pendingRepo.delete(id);
  }
}

import { PendingItemsRepository } from './pending-items.repository';
import { PrismaService } from './prisma.service';

describe('PendingItemsRepository', () => {
  let repository: PendingItemsRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      manualPendingItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repository = new PendingItemsRepository(mockPrisma as PrismaService);
  });

  it('deve criar um item de pendência e mapear os campos bidirecionalmente (camelCase e snake_case)', async () => {
    const fakeCreated = {
      id: 10,
      pullRequestId: '123',
      repository: 'sograi',
      filePath: 'src/main.ts',
      title: 'Refatorar main',
      description: 'Dividir responsabilidades',
      itemType: 'TECH_DEBT',
      priority: 'HIGH',
      authorName: 'Tech Lead',
      status: 'PENDING',
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date('2026-11-06'),
    };
    mockPrisma.manualPendingItem.create.mockResolvedValue(fakeCreated);

    const result = await repository.create({
      prId: '123',
      repository: 'sograi',
      filePath: 'src/main.ts',
      title: 'Refatorar main',
      description: 'Dividir responsabilidades',
      itemType: 'TECH_DEBT',
      priority: 'HIGH',
    });

    expect(result.id).toBe(10);
    expect(result.file_path).toBe('src/main.ts');
    expect(result.filePath).toBe('src/main.ts');
    expect(result.pull_request_id).toBe('123');
    expect(result.pullRequestId).toBe('123');
    expect(result.item_type).toBe('TECH_DEBT');
    expect(result.itemType).toBe('TECH_DEBT');
    expect(mockPrisma.manualPendingItem.create).toHaveBeenCalled();
  });

  it('deve marcar um item como resolvido com notas de resolução', async () => {
    const fakeUpdated = {
      id: 10,
      pullRequestId: '123',
      repository: 'sograi',
      filePath: 'src/main.ts',
      title: 'Refatorar main',
      description: 'Dividir responsabilidades',
      itemType: 'TECH_DEBT',
      priority: 'HIGH',
      authorName: 'Tech Lead',
      status: 'RESOLVED',
      resolutionNotes: 'Resolvido no commit abc',
      resolvedAt: new Date('2026-11-06'),
      createdAt: new Date('2026-11-06'),
    };
    mockPrisma.manualPendingItem.update.mockResolvedValue(fakeUpdated);

    const result = await repository.resolve(10, 'Resolvido no commit abc');

    expect(result.status).toBe('RESOLVED');
    expect(result.resolution_notes).toBe('Resolvido no commit abc');
    expect(result.resolutionNotes).toBe('Resolvido no commit abc');
    expect(mockPrisma.manualPendingItem.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        status: 'RESOLVED',
        resolutionNotes: 'Resolvido no commit abc',
      }),
    });
  });
});

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
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      pendingItemHistory: {
        create: jest.fn(),
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
      origin: 'MANUAL',
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date('2026-11-06'),
      history: [],
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
      origin: 'MANUAL',
      resolutionNotes: 'Resolvido no commit abc',
      resolvedAt: new Date('2026-11-06'),
      createdAt: new Date('2026-11-06'),
      history: [],
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
      include: expect.any(Object),
    });
  });

  it('deve salvar nota de resolução padrão quando não fornecida (Issue #19)', async () => {
    mockPrisma.manualPendingItem.update.mockResolvedValue({
      id: 10,
      pullRequestId: '123',
      repository: 'sograi-backend',
      filePath: 'src/main.ts',
      status: 'RESOLVED',
      resolutionNotes: 'Resolvido manualmente pelo usuário.',
      history: [],
    });

    await repository.resolve(10);

    expect(mockPrisma.manualPendingItem.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        status: 'RESOLVED',
        resolutionNotes: 'Resolvido manualmente pelo usuário.',
      }),
      include: expect.any(Object),
    });
  });

  describe('syncFromAnalysis (Issue #13)', () => {
    const prInfo = {
      prId: '456',
      title: 'feat: add payment gateway',
      author: 'dev-user',
      repository: 'sograi-backend',
      iteration: 1,
    };

    it('deve criar pendência automática e registro de histórico se arquivo for REPROVADO sem pendência prévia', async () => {
      mockPrisma.manualPendingItem.findFirst.mockResolvedValue(null);
      mockPrisma.manualPendingItem.create.mockResolvedValue({
        id: 20,
        pullRequestId: '456',
        repository: 'sograi-backend',
        filePath: 'src/payment.ts',
        title: 'Falta validação de payload',
        description: 'Não valida dados bancários',
        itemType: 'TECH_DEBT',
        priority: 'HIGH',
        status: 'PENDING',
        origin: 'AUTOMATIC_ANALYSIS',
        createdAt: new Date(),
        history: [],
      });
      mockPrisma.pendingItemHistory.create.mockResolvedValue({ id: 1 });

      await repository.syncFromAnalysis(prInfo, [
        {
          filePath: 'src/payment.ts',
          verdict: 'REPROVADO',
          justification: 'Não valida dados bancários',
          issues: [{ title: 'Falta validação de payload', severity: 'BLOCKER' }],
        },
      ]);

      expect(mockPrisma.manualPendingItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            filePath: 'src/payment.ts',
            origin: 'AUTOMATIC_ANALYSIS',
            priority: 'HIGH',
          }),
        })
      );
      expect(mockPrisma.pendingItemHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pendingItemId: 20,
          pullRequestId: '456',
          decision: 'REPROVADO',
        }),
      });
    });

    it('deve adicionar nova entrada no histórico se o arquivo já tiver pendência ativa e continuar REPROVADO', async () => {
      mockPrisma.manualPendingItem.findFirst.mockResolvedValue({
        id: 20,
        pullRequestId: '100',
        repository: 'sograi-backend',
        filePath: 'src/payment.ts',
        status: 'PENDING',
        history: [],
      });
      mockPrisma.pendingItemHistory.create.mockResolvedValue({ id: 2 });

      await repository.syncFromAnalysis(prInfo, [
        {
          filePath: 'src/payment.ts',
          verdict: 'REPROVADO',
          justification: 'Ainda sem testes de unidade',
        },
      ]);

      expect(mockPrisma.manualPendingItem.create).not.toHaveBeenCalled();
      expect(mockPrisma.pendingItemHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pendingItemId: 20,
          pullRequestId: '456',
          prTitle: 'feat: add payment gateway',
          author: 'dev-user',
          decision: 'REPROVADO',
          justification: 'Ainda sem testes de unidade',
        }),
      });
    });

    it('deve resolver a pendência automaticamente se o arquivo citado for APROVADO na nova PR', async () => {
      mockPrisma.manualPendingItem.findFirst.mockResolvedValue({
        id: 20,
        pullRequestId: '100',
        repository: 'sograi-backend',
        filePath: 'src/payment.ts',
        status: 'PENDING',
        history: [],
      });
      mockPrisma.manualPendingItem.update.mockResolvedValue({
        id: 20,
        status: 'RESOLVED',
        resolvedByPr: '456',
        history: [],
      });

      await repository.syncFromAnalysis(prInfo, [
        {
          filePath: 'src/payment.ts',
          verdict: 'APROVADO',
          justification: 'Código refatorado e coberto por testes',
        },
      ]);

      expect(mockPrisma.manualPendingItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 20 },
          data: expect.objectContaining({
            status: 'RESOLVED',
            resolvedByPr: '456',
            resolutionNotes: expect.stringContaining('Resolvido automaticamente na análise da PR #456'),
          }),
        })
      );
    });

    it('deve criar pendência automática de débito técnico quando arquivo for APROVADO com ressalvas/warnings (Issue #18)', async () => {
      mockPrisma.manualPendingItem.findFirst.mockResolvedValue(null);
      mockPrisma.manualPendingItem.create.mockResolvedValue({
        id: 30,
        pullRequestId: '456',
        repository: 'sograi-backend',
        filePath: 'src/logger.ts',
        title: 'Falta tipagem estrita no logger',
        description: 'Melhorar tipagem para conformidade',
        status: 'PENDING',
        origin: 'AUTOMATIC_ANALYSIS',
        history: [],
      });

      await repository.syncFromAnalysis(prInfo, [
        {
          filePath: 'src/logger.ts',
          verdict: 'APROVADO',
          justification: 'Código aprovado, mas com ressalvas de tipagem.',
          issues: [
            {
              title: 'Falta tipagem estrita no logger',
              description: 'Melhorar tipagem para conformidade',
              severity: 'WARNING',
            },
          ],
        },
      ]);

      expect(mockPrisma.manualPendingItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pullRequestId: '456',
            repository: 'sograi-backend',
            filePath: 'src/logger.ts',
            title: 'Falta tipagem estrita no logger',
            origin: 'AUTOMATIC_ANALYSIS',
            priority: 'MEDIUM',
          }),
        })
      );

      expect(mockPrisma.pendingItemHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pendingItemId: 30,
          pullRequestId: '456',
          decision: 'APROVADO_COM_RESSALVAS',
        }),
      });
    });

    it('deve adicionar histórico com APROVADO_COM_RESSALVAS se já houver pendência ativa no arquivo', async () => {
      mockPrisma.manualPendingItem.findFirst.mockResolvedValue({
        id: 30,
        pullRequestId: '100',
        repository: 'sograi-backend',
        filePath: 'src/logger.ts',
        status: 'PENDING',
        history: [],
      });

      await repository.syncFromAnalysis(prInfo, [
        {
          filePath: 'src/logger.ts',
          verdict: 'APROVADO',
          justification: 'Código aprovado com avisos.',
          issues: [
            {
              title: 'Aviso de performance',
              description: 'Otimizar loop',
              severity: 'WARNING',
            },
          ],
        },
      ]);

      expect(mockPrisma.manualPendingItem.create).not.toHaveBeenCalled();
      expect(mockPrisma.pendingItemHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pendingItemId: 30,
          pullRequestId: '456',
          decision: 'APROVADO_COM_RESSALVAS',
        }),
      });
    });
  });
});

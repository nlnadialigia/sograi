import { AnalysisQueueService } from './analysis-queue.service';

describe('AnalysisQueueService', () => {
  let service: AnalysisQueueService;

  beforeEach(() => {
    service = new AnalysisQueueService();
  });

  it('deve inicializar com a fila vazia e status ocioso', () => {
    const status = service.getStatus();
    expect(status.isBusy).toBe(false);
    expect(status.currentPrUrl).toBeNull();
    expect(status.queueLength).toBe(0);
  });

  it('deve processar uma tarefa individual imediatamente e retornar o resultado', async () => {
    const executeMock = jest.fn().mockResolvedValue('resultado-sucesso');

    const result = await service.enqueue('https://github.com/org/repo/pull/1', executeMock);

    expect(result).toBe('resultado-sucesso');
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(service.getStatus().isBusy).toBe(false);
  });

  it('deve garantir ordem FIFO e concorrência única para tarefas enfileiradas', async () => {
    const executionOrder: number[] = [];

    // Tarefa 1 com delay
    const p1 = service.enqueue('https://github.com/org/repo/pull/1', async () => {
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push(1);
      return 'p1-done';
    });

    // Tarefas 2 e 3 adicionadas enquanto 1 ainda executa
    const p2 = service.enqueue('https://github.com/org/repo/pull/2', async () => {
      await new Promise((r) => setTimeout(r, 20));
      executionOrder.push(2);
      return 'p2-done';
    });

    const p3 = service.enqueue('https://github.com/org/repo/pull/3', async () => {
      executionOrder.push(3);
      return 'p3-done';
    });

    // Logo após o enfileiramento, o serviço deve estar ocupado com a PR 1
    const statusWhileRunning = service.getStatus();
    expect(statusWhileRunning.isBusy).toBe(true);
    expect(statusWhileRunning.currentPrUrl).toBe('https://github.com/org/repo/pull/1');

    const results = await Promise.all([p1, p2, p3]);

    expect(results).toEqual(['p1-done', 'p2-done', 'p3-done']);
    expect(executionOrder).toEqual([1, 2, 3]);
    expect(service.getStatus().isBusy).toBe(false);
  });

  it('deve continuar processando a fila mesmo se uma tarefa falhar', async () => {
    const p1 = service.enqueue('https://github.com/org/repo/pull/1', async () => {
      throw new Error('Falha de conexão');
    });

    const p2 = service.enqueue('https://github.com/org/repo/pull/2', async () => {
      return 'p2-sucesso';
    });

    await expect(p1).rejects.toThrow('Falha de conexão');
    const result2 = await p2;
    expect(result2).toBe('p2-sucesso');
    expect(service.getStatus().isBusy).toBe(false);
  });
});

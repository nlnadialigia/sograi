import { HttpStatus } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';

describe('ReviewsController - Spec de Correção', () => {
  let controller: ReviewsController;
  let reviewsServiceMock: any;
  let resMock: any;

  beforeEach(() => {
    reviewsServiceMock = {
      getReviewById: jest.fn(),
      getSpecCorrecaoMarkdown: jest.fn(),
      getAllReviews: jest.fn(),
      toggleArchive: jest.fn(),
      deleteReview: jest.fn(),
    };

    const queueServiceMock: any = {};

    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    controller = new ReviewsController(reviewsServiceMock, queueServiceMock);
  });

  it('deve retornar 404 se a PR não for encontrada', async () => {
    reviewsServiceMock.getReviewById.mockResolvedValue(null);

    await controller.downloadSpecCorrecao(999, resMock);

    expect(resMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(resMock.json).toHaveBeenCalledWith({
      message: 'PR não encontrada para gerar spec.',
    });
  });

  it('deve recusar com 400 se a PR não tiver pendências ativas', async () => {
    reviewsServiceMock.getReviewById.mockResolvedValue({
      id: 1,
      has_active_pending: false,
    });

    await controller.downloadSpecCorrecao(1, resMock);

    expect(resMock.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(resMock.json).toHaveBeenCalledWith({
      message: 'Esta PR não possui pendências ativas para gerar a Spec de Correção.',
    });
    expect(reviewsServiceMock.getSpecCorrecaoMarkdown).not.toHaveBeenCalled();
  });

  it('deve permitir e enviar markdown quando a PR tiver pendências ativas', async () => {
    reviewsServiceMock.getReviewById.mockResolvedValue({
      id: 2,
      has_active_pending: true,
    });
    reviewsServiceMock.getSpecCorrecaoMarkdown.mockResolvedValue(
      '# 🛠️ Spec de Correção - PR #2'
    );

    await controller.downloadSpecCorrecao(2, resMock);

    expect(reviewsServiceMock.getSpecCorrecaoMarkdown).toHaveBeenCalledWith(2);
    expect(resMock.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/markdown; charset=utf-8'
    );
    expect(resMock.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="spec-correcao-PR-2.md"'
    );
    expect(resMock.send).toHaveBeenCalledWith('# 🛠️ Spec de Correção - PR #2');
  });
});

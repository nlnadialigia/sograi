import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { AnalyzePrDto } from './dto/analyze-pr.dto';

@Controller('api')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('health')
  async getHealth() {
    return this.reviewsService.getHealthStatus();
  }

  @Post('reviews/analyze')
  async analyze(@Body() dto: AnalyzePrDto) {
    return this.reviewsService.analyzePullRequest(dto);
  }

  @Post('reviews/analyze-stream')
  async analyzeStream(@Body() dto: AnalyzePrDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const result = await this.reviewsService.analyzePullRequest(
        dto,
        (stepText, percent, meta) => {
          sendEvent('progress', { step: stepText, percent, meta });
        }
      );
      sendEvent('done', result);
    } catch (err: any) {
      sendEvent('error', { message: err.message || 'Erro durante a análise.' });
    } finally {
      res.end();
    }
  }

  @Get('reviews')
  async findAll() {
    return this.reviewsService.getAllReviews();
  }

  @Get('reviews/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const pr = await this.reviewsService.getReviewById(id);
    if (!pr) {
      return { error: 'Revisão não encontrada.' };
    }
    return pr;
  }

  @Patch('reviews/:id/archive')
  async toggleArchive(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.toggleArchive(id);
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }

  @Get('reviews/:id/spec')
  async downloadSpecCorrecao(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const markdown = await this.reviewsService.getSpecCorrecaoMarkdown(id);
    if (!markdown) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'PR não encontrada para gerar spec.' });
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="spec-correcao-PR-${id}.md"`);
    return res.send(markdown);
  }
}

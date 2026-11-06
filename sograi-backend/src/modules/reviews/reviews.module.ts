import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { PendingItemsController } from './pending-items.controller';
import { ReviewsService } from './reviews.service';
import { ReportGeneratorService } from './report-generator.service';
import { AgentsModule } from '../agents/agents.module';
import { GeminiModule } from '../gemini/gemini.module';
import { AzureDevOpsModule } from '../azure-devops/azure-devops.module';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [AgentsModule, GeminiModule, AzureDevOpsModule, GitHubModule],

  controllers: [ReviewsController, PendingItemsController],
  providers: [ReviewsService, ReportGeneratorService],
  exports: [ReviewsService, ReportGeneratorService],
})
export class ReviewsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { AzureDevOpsModule } from './modules/azure-devops/azure-devops.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SettingsModule } from './modules/settings/settings.module';
import { GitHubModule } from './modules/github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../.env'],
    }),
    DatabaseModule,
    SettingsModule,
    GeminiModule,
    AzureDevOpsModule,
    GitHubModule,
    AgentsModule,
    ReviewsModule,
  ],
})
export class AppModule {}



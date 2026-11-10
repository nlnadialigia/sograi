import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { configuration } from './config/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { AzureDevOpsModule } from './modules/azure-devops/azure-devops.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SettingsModule } from './modules/settings/settings.module';
import { GitHubModule } from './modules/github/github.module';

const clientCandidates = [
  join(process.cwd(), '..', 'sograi-frontend', 'dist'),
  join(process.cwd(), 'public'),
  join(__dirname, '..', '..', 'sograi-frontend', 'dist'),
  join(__dirname, '..', 'public'),
];
const clientPath = clientCandidates.find((p) => existsSync(p));

const staticImports = clientPath
  ? [
      ServeStaticModule.forRoot({
        rootPath: clientPath,
        exclude: ['/api/(.*)'],
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../.env'],
    }),
    ...staticImports,
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



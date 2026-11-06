import { Controller, Get, Query } from '@nestjs/common';
import { GitHubService } from './github.service';
import { DatabaseService } from '../database/database.service';

@Controller('api/github')
export class GitHubController {
  constructor(
    private readonly gitHubService: GitHubService,
    private readonly dbService: DatabaseService
  ) {}

  @Get('repositories')
  async getRepositories() {
    return this.gitHubService.listRepositories();
  }

  @Get('open-prs')
  async getOpenPullRequests(
    @Query('owner') owner?: string,
    @Query('repository') repository?: string
  ) {
    if (!owner || !repository) {
      return [];
    }

    const prs = await this.gitHubService.listOpenPullRequests(owner, repository);
    const localPrs = await this.dbService.getAllPullRequests(200);

    const localMap = new Map<string, any>();
    localPrs.forEach((lp: any) => {
      const key = `${lp.repository}#${lp.pull_request_id}`;
      localMap.set(key, lp);
    });

    return prs.map((pr) => {
      const key = `${pr.repository}#${pr.pullRequestId}`;
      const local = localMap.get(key);

      return {
        ...pr,
        alreadyAnalyzed: !!local,
        dbId: local ? local.id : null,
        iteration: local ? local.iteration || 1 : null,
        lastStatus: local ? local.decision || local.status : null,
        lastRisk: local ? local.risk_level : null,
        lastAnalyzedAt: local ? local.updated_at || local.created_at : null,
      };
    });
  }
}

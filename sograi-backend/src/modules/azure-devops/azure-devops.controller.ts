import { Controller, Get, Query } from '@nestjs/common';
import { AzureDevOpsService } from './azure-devops.service';
import { DatabaseService } from '../database/database.service';

@Controller('api/azure')
export class AzureDevOpsController {
  constructor(
    private readonly azureService: AzureDevOpsService,
    private readonly dbService: DatabaseService
  ) {}

  @Get('projects')
  async getProjects() {
    return this.azureService.listProjects();
  }

  @Get('repositories')
  async getRepositories(@Query('project') project?: string) {
    return this.azureService.listRepositories(project);
  }

  @Get('open-prs')
  async getOpenPullRequests(
    @Query('project') project?: string,
    @Query('repository') repository?: string,
    @Query('repositories') repositories?: string
  ) {
    let prs = [];
    if (repositories) {
      const repoList = repositories.split(',').map((r) => r.trim()).filter(Boolean);
      prs = await this.azureService.listOpenPullRequestsForMultiple(repoList, project);
    } else {
      prs = await this.azureService.listOpenPullRequests(repository, project);
    }


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

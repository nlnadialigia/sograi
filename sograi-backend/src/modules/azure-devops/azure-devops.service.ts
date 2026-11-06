import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { SettingsService } from "../settings/settings.service";

export interface PullRequestUrlInfo {
  organization: string;
  project: string;
  repository: string;
  pullRequestId: number;
}

export interface PrFileChange {
  path: string;
  changeType: string;
  originalContent?: string;
  newContent?: string;
}

export interface AzureProjectItem {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface AzureRepoItem {
  id: string;
  name: string;
  url?: string;
}

export interface AzureOpenPrItem {
  pullRequestId: number;
  title: string;
  repository: string;
  organization: string;
  project: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  creationDate: string;
  azureUrl: string;
}

@Injectable()
export class AzureDevOpsService {
  private readonly logger = new Logger(AzureDevOpsService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {}

  parsePrUrl(url: string): PullRequestUrlInfo {
    const cleanUrl = url.trim();
    const devAzureRegex =
      /https:\/\/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/]+)\/pullrequest\/(\d+)/i;
    const visualStudioRegex =
      /https:\/\/([^.]+)\.visualstudio\.com\/([^/]+)\/_git\/([^/]+)\/pullrequest\/(\d+)/i;

    let match = cleanUrl.match(devAzureRegex);
    if (match) {
      return {
        organization: decodeURIComponent(match[1]),
        project: decodeURIComponent(match[2]),
        repository: decodeURIComponent(match[3]),
        pullRequestId: parseInt(match[4], 10),
      };
    }

    match = cleanUrl.match(visualStudioRegex);
    if (match) {
      return {
        organization: decodeURIComponent(match[1]),
        project: decodeURIComponent(match[2]),
        repository: decodeURIComponent(match[3]),
        pullRequestId: parseInt(match[4], 10),
      };
    }

    throw new Error(`Formato de URL do Azure DevOps inválido: ${url}`);
  }

  private async getAuthHeaders(customToken?: string) {
    let token = customToken;
    if (!token) {
      token = await this.settingsService.get("AZURE_DEVOPS_TOKEN");
    }
    if (!token) {
      token = this.configService.get<string>("azureDevOps.token") || "";
    }
    if (!token) {
      throw new Error("Token do Azure DevOps (PAT) não configurado.");
    }
    const auth = Buffer.from(`:${token}`).toString("base64");
    return {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };
  }

  async getDefaultOrg(): Promise<string> {
    const fromSettings = await this.settingsService.get("AZURE_DEVOPS_ORG");
    if (fromSettings) {
      return fromSettings
        .replace(/^https?:\/\/dev\.azure\.com\//i, "")
        .replace(/\/+$/, "");
    }
    return (
      this.configService.get<string>("azureDevOps.organization") ?? "teste"
    );
  }

  async getDefaultProject(): Promise<string> {
    return this.settingsService.get("AZURE_DEVOPS_PROJECT");
  }

  async listProjects(token?: string): Promise<AzureProjectItem[]> {
    const org = await this.getDefaultOrg();
    const url = `https://dev.azure.com/${encodeURIComponent(org)}/_apis/projects?api-version=7.0`;
    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    const list = res.data?.value || [];
    return list
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        url: p.url,
      }))
      .sort((a: AzureProjectItem, b: AzureProjectItem) =>
        a.name.localeCompare(b.name),
      );
  }

  async listRepositories(
    projectName?: string,
    token?: string,
  ): Promise<AzureRepoItem[]> {
    const org = await this.getDefaultOrg();
    const project = projectName || (await this.getDefaultProject());
    const url = `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_apis/git/repositories?api-version=7.0`;
    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    const list = res.data.value || [];
    return list
      .map((r: any) => ({ id: r.id, name: r.name, url: r.webUrl }))
      .sort((a: AzureRepoItem, b: AzureRepoItem) =>
        a.name.localeCompare(b.name),
      );
  }

  async listOpenPullRequests(
    repositoryName?: string,
    projectName?: string,
    token?: string,
  ): Promise<AzureOpenPrItem[]> {
    const org = await this.getDefaultOrg();
    const project = projectName || (await this.getDefaultProject());

    let url: string;
    if (repositoryName && repositoryName !== "all") {
      url = `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repositoryName)}/pullrequests?searchCriteria.status=active&api-version=7.0`;
    } else {
      url = `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_apis/git/pullrequests?searchCriteria.status=active&api-version=7.0`;
    }

    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    const prs = res.data.value || [];

    return prs.map((p: any) => {
      const repo = p.repository?.name || repositoryName || "";
      return {
        pullRequestId: p.pullRequestId,
        title: p.title,
        repository: repo,
        organization: org,
        project: decodeURIComponent(project),
        author: p.createdBy?.displayName || "Desconhecido",
        sourceBranch: (p.sourceRefName || "").replace("refs/heads/", ""),
        targetBranch: (p.targetRefName || "").replace("refs/heads/", ""),
        creationDate: p.creationDate,
        azureUrl: `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_git/${repo}/pullrequest/${p.pullRequestId}`,
      };
    });
  }

  async listOpenPullRequestsForMultiple(
    repoNames: string[],
    projectName?: string,
    token?: string,
  ): Promise<AzureOpenPrItem[]> {
    if (!repoNames || repoNames.length === 0) return [];
    if (repoNames.includes("all"))
      return this.listOpenPullRequests("all", projectName, token);

    const allPrs = await this.listOpenPullRequests("all", projectName, token);
    const set = new Set(repoNames.map((r) => r.toLowerCase()));
    return allPrs.filter((p) => set.has(p.repository.toLowerCase()));
  }

  async getPullRequestInfo(info: PullRequestUrlInfo, token?: string) {
    const url = `https://dev.azure.com/${encodeURIComponent(info.organization)}/${encodeURIComponent(info.project)}/_apis/git/repositories/${encodeURIComponent(info.repository)}/pullrequests/${info.pullRequestId}?api-version=7.0`;
    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    return res.data;
  }

  async getPullRequestIterations(info: PullRequestUrlInfo, token?: string) {
    const url = `https://dev.azure.com/${encodeURIComponent(info.organization)}/${encodeURIComponent(info.project)}/_apis/git/repositories/${encodeURIComponent(info.repository)}/pullrequests/${info.pullRequestId}/iterations?api-version=7.0`;
    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    return res.data.value || [];
  }

  async getPullRequestChanges(
    info: PullRequestUrlInfo,
    iterationId: number,
    token?: string,
  ) {
    const url = `https://dev.azure.com/${encodeURIComponent(info.organization)}/${encodeURIComponent(info.project)}/_apis/git/repositories/${encodeURIComponent(info.repository)}/pullrequests/${info.pullRequestId}/iterations/${iterationId}/changes?api-version=7.0`;
    const res = await axios.get(url, {
      headers: await this.getAuthHeaders(token),
    });
    return res.data.changeEntries || [];
  }

  async getFileContent(
    info: PullRequestUrlInfo,
    filePath: string,
    versionDescriptor?: { version: string; versionType?: string },
    token?: string,
  ): Promise<string> {
    const encodedPath = encodeURIComponent(filePath);
    let url = `https://dev.azure.com/${encodeURIComponent(info.organization)}/${encodeURIComponent(info.project)}/_apis/git/repositories/${encodeURIComponent(info.repository)}/items?path=${encodedPath}&api-version=7.0&$format=text`;

    if (versionDescriptor?.version) {
      url += `&versionDescriptor.version=${encodeURIComponent(versionDescriptor.version)}&versionDescriptor.versionType=${versionDescriptor.versionType || "commit"}`;
    }

    try {
      const res = await axios.get(url, {
        headers: await this.getAuthHeaders(token),
        responseType: "text",
      });
      return typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    } catch {
      return "";
    }
  }

  async getCompletePullRequestFiles(
    info: PullRequestUrlInfo,
    token?: string,
  ): Promise<{ prDetails: any; files: PrFileChange[] }> {
    const prDetails = await this.getPullRequestInfo(info, token);
    const iterations = await this.getPullRequestIterations(info, token);

    if (iterations.length === 0) {
      return { prDetails, files: [] };
    }

    const latestIteration = iterations[iterations.length - 1];
    const changes = await this.getPullRequestChanges(
      info,
      latestIteration.id,
      token,
    );

    const files: PrFileChange[] = [];
    const sourceCommit = latestIteration.sourceRefCommit?.commitId;
    const targetCommit = latestIteration.targetRefCommit?.commitId;

    for (const change of changes) {
      if (change.item?.isFolder) continue;

      const filePath = change.item?.path;
      if (!filePath) continue;

      let originalContent = "";
      let newContent = "";

      if (change.changeType !== "add" && targetCommit) {
        originalContent = await this.getFileContent(
          info,
          filePath,
          { version: targetCommit, versionType: "commit" },
          token,
        );
      }

      if (change.changeType !== "delete" && sourceCommit) {
        newContent = await this.getFileContent(
          info,
          filePath,
          { version: sourceCommit, versionType: "commit" },
          token,
        );
      }

      files.push({
        path: filePath,
        changeType: change.changeType || "edit",
        originalContent,
        newContent,
      });
    }

    return { prDetails, files };
  }
}

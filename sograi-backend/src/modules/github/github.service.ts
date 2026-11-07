import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import axios from 'axios';
import {
  GitHubFileChange,
  GitHubOpenPrItem,
  GitHubPrUrlInfo,
  GitHubRepoItem,
} from './github.types';

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(private readonly settingsService: SettingsService) {}

  parsePrUrl(url: string): GitHubPrUrlInfo {
    const cleanUrl = url.trim();
    const githubRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i;
    const match = cleanUrl.match(githubRegex);

    if (match) {
      return {
        owner: decodeURIComponent(match[1]),
        repository: decodeURIComponent(match[2]),
        pullRequestId: parseInt(match[3], 10),
      };
    }

    throw new Error(`Formato de URL do GitHub inválido: ${url}`);
  }

  private async getAuthHeaders(customToken?: string) {
    let token = customToken;
    if (!token) {
      token = await this.settingsService.get('GITHUB_TOKEN');
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async getApiUrl(): Promise<string> {
    const url = await this.settingsService.get('GITHUB_API_URL');
    return (url || 'https://api.github.com').replace(/\/+$/, '');
  }

  async listRepositories(token?: string): Promise<GitHubRepoItem[]> {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(token);

    try {
      const res = await axios.get(`${apiUrl}/user/repos?per_page=100&sort=updated`, {
        headers,
      });

      const list = res.data || [];
      return list.map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner?.login || '',
        isPrivate: !!r.private,
        defaultBranch: r.default_branch || 'main',
        htmlUrl: r.html_url,
      }));
    } catch (err: any) {
      this.logger.warn(`Falha ao listar repositórios do GitHub: ${err.message}`);
      return [];
    }
  }

  async listOpenPullRequests(
    owner: string,
    repository: string,
    token?: string
  ): Promise<GitHubOpenPrItem[]> {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(token);

    try {
      const url = `${apiUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/pulls?state=open&per_page=50`;
      const res = await axios.get(url, { headers });
      const prs = res.data || [];

      return prs.map((p: any) => ({
        pullRequestId: p.number,
        title: p.title || 'Pull Request',
        repository,
        organization: owner,
        project: owner,
        owner,
        author: p.user?.login || 'Autor Desconhecido',
        sourceBranch: p.head?.ref || '',
        targetBranch: p.base?.ref || '',
        creationDate: p.created_at,
        githubUrl: p.html_url,
      }));
    } catch (err: any) {
      this.logger.warn(`Falha ao listar PRs do GitHub (${owner}/${repository}): ${err.message}`);
      return [];
    }
  }

  async getPullRequestInfo(info: GitHubPrUrlInfo, token?: string) {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(token);
    const url = `${apiUrl}/repos/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repository)}/pulls/${info.pullRequestId}`;
    const res = await axios.get(url, { headers });
    return res.data;
  }

  async getFileRawContent(
    owner: string,
    repository: string,
    filePath: string,
    ref: string,
    token?: string
  ): Promise<string> {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(token);
    headers.Accept = 'application/vnd.github.v3.raw';

    try {
      const cleanPath = filePath.replace(/^\/+/, '');
      const url = `${apiUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${encodeURI(cleanPath)}?ref=${encodeURIComponent(ref)}`;
      const res = await axios.get(url, {
        headers,
        responseType: 'text',
      });
      return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    } catch {
      return '';
    }
  }

  async getCompletePullRequestFiles(
    info: GitHubPrUrlInfo,
    token?: string
  ): Promise<{ prDetails: any; files: GitHubFileChange[] }> {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(token);
    const prDetails = await this.getPullRequestInfo(info, token);

    const baseSha = prDetails.base?.sha;
    const headSha = prDetails.head?.sha;

    const filesUrl = `${apiUrl}/repos/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repository)}/pulls/${info.pullRequestId}/files?per_page=100`;
    const res = await axios.get(filesUrl, { headers });
    const fileEntries = res.data || [];

    const files: GitHubFileChange[] = [];

    for (const entry of fileEntries) {
      const filePath = entry.filename;
      if (!filePath) continue;

      let changeType = 'edit';
      if (entry.status === 'added') changeType = 'add';
      else if (entry.status === 'removed') changeType = 'delete';

      let originalContent = '';
      let newContent = '';

      if (changeType !== 'add' && baseSha) {
        originalContent = await this.getFileRawContent(
          info.owner,
          info.repository,
          entry.previous_filename || filePath,
          baseSha,
          token
        );
      }

      if (changeType !== 'delete' && headSha) {
        newContent = await this.getFileRawContent(
          info.owner,
          info.repository,
          filePath,
          headSha,
          token
        );
      }

      files.push({
        path: filePath.startsWith('/') ? filePath : `/${filePath}`,
        changeType,
        originalContent,
        newContent,
      });
    }

    return { prDetails, files };
  }

  async createIssue(
    data: { title: string; body: string; labels?: string[]; owner?: string; repository?: string },
    customToken?: string
  ) {
    const apiUrl = await this.getApiUrl();
    const headers = await this.getAuthHeaders(customToken);
    const defaultOrg = await this.settingsService.get('GITHUB_DEFAULT_ORG');

    const owner = data.owner || defaultOrg || 'nlnadialigia';
    const repository = data.repository || 'sograi';

    try {
      const res = await axios.post(
        `${apiUrl}/repos/${owner}/${repository}/issues`,
        {
          title: data.title,
          body: data.body,
          labels: data.labels || [],
        },
        { headers }
      );

      return {
        id: res.data.id,
        number: res.data.number,
        htmlUrl: res.data.html_url,
        title: res.data.title,
        state: res.data.state,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      this.logger.error(`Falha ao criar issue no GitHub (${owner}/${repository}): ${msg}`);
      throw new Error(`Falha ao criar issue no GitHub: ${msg}`);
    }
  }
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
}

export interface GitHubOpenPrItem {
  pullRequestId: number;
  title: string;
  repository: string;
  organization?: string;
  project?: string;
  owner: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  creationDate: string;
  githubUrl: string;
  alreadyAnalyzed?: boolean;
  dbId?: number | null;
  iteration?: number | null;
  lastStatus?: string | null;
  lastRisk?: string | null;
  lastAnalyzedAt?: string | null;
}

export interface GitHubPrUrlInfo {
  owner: string;
  repository: string;
  pullRequestId: number;
}

export interface GitHubFileChange {
  path: string;
  changeType: string;
  originalContent?: string;
  newContent?: string;
}

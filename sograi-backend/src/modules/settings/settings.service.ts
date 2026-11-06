import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "../database/prisma.service";
import {
  SettingCategory,
  SettingItemDto,
  TestConnectionDto,
  TestConnectionResult,
  UpdateSettingDto,
} from "./settings.types";

interface SettingMeta {
  category: SettingCategory;
  isSecret: boolean;
  description: string;
  envKey?: string;
}

const DEFAULT_SETTINGS: Record<string, SettingMeta> = {
  AZURE_DEVOPS_ORG: {
    category: "azure",
    isSecret: false,
    description: "Organização do Azure DevOps",
    envKey: "AZURE_DEVOPS_ORG",
  },
  AZURE_DEVOPS_PROJECT: {
    category: "azure",
    isSecret: false,
    description: "Projeto padrão do Azure DevOps",
    envKey: "AZURE_DEVOPS_PROJECT",
  },
  AZURE_DEVOPS_TOKEN: {
    category: "azure",
    isSecret: true,
    description: "PAT do Azure DevOps com escopo Code (Read)",
    envKey: "AZURE_DEVOPS_TOKEN",
  },
  GITHUB_TOKEN: {
    category: "github",
    isSecret: true,
    description: "Personal Access Token do GitHub (escopos repo / read:org)",
    envKey: "GITHUB_TOKEN",
  },
  GITHUB_API_URL: {
    category: "github",
    isSecret: false,
    description: "URL base da API GitHub (padrão: https://api.github.com)",
    envKey: "GITHUB_API_URL",
  },
  GITHUB_DEFAULT_OWNER: {
    category: "github",
    isSecret: false,
    description: "Organização ou usuário padrão no GitHub",
    envKey: "GITHUB_DEFAULT_OWNER",
  },
  GEMINI_API_KEY: {
    category: "ai",
    isSecret: true,
    description: "Chave de API do Google Gemini",
    envKey: "GEMINI_API_KEY",
  },
  GEMINI_MODEL: {
    category: "ai",
    isSecret: false,
    description: "Modelo padrão do Gemini para análise",
    envKey: "GEMINI_MODEL",
  },
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private maskSecret(val: string): string {
    if (!val) return "";
    if (val.length <= 8) return "••••••••";
    return `${val.slice(0, 4)}••••••••${val.slice(-2)}`;
  }

  async get(key: string, defaultValue = ""): Promise<string> {
    try {
      const row = await this.prisma.systemSetting.findUnique({
        where: { key },
      });
      if (row && row.value && row.value.trim() !== "") {
        return row.value.trim();
      }
    } catch (e: any) {
      this.logger.warn(`Falha ao buscar setting ${key}: ${e.message}`);
    }

    const envVal = process.env[key] || this.configService.get<string>(key);
    return envVal ? String(envVal).trim() : defaultValue;
  }

  async getAll(): Promise<SettingItemDto[]> {
    const dbSettings = await this.prisma.systemSetting.findMany();
    const dbMap = new Map(dbSettings.map((s) => [s.key, s]));

    const result: SettingItemDto[] = [];

    for (const [key, meta] of Object.entries(DEFAULT_SETTINGS)) {
      const dbRow = dbMap.get(key);
      const rawVal = dbRow?.value || process.env[key] || "";
      const isSet = Boolean(rawVal && rawVal.trim() !== "");

      result.push({
        key,
        value: meta.isSecret ? this.maskSecret(rawVal) : rawVal,
        category: meta.category,
        isSecret: meta.isSecret,
        isSet,
        description: dbRow?.description || meta.description,
      });
      dbMap.delete(key);
    }

    for (const [key, row] of dbMap.entries()) {
      const isSet = Boolean(row.value && row.value.trim() !== "");
      result.push({
        key,
        value: row.isSecret ? this.maskSecret(row.value) : row.value,
        category: (row.category as SettingCategory) || "general",
        isSecret: row.isSecret,
        isSet,
        description: row.description || undefined,
      });
    }

    return result;
  }

  async setMany(settings: UpdateSettingDto[]): Promise<void> {
    for (const item of settings) {
      const key = item.key.trim();
      const meta = DEFAULT_SETTINGS[key];
      const isSecret = item.isSecret ?? meta?.isSecret ?? false;
      const category = item.category || meta?.category || "general";
      const description = item.description || meta?.description;

      const existing = await this.prisma.systemSetting.findUnique({
        where: { key },
      });

      if (isSecret && item.value.includes("••••")) {
        continue;
      }

      await this.prisma.systemSetting.upsert({
        where: { key },
        create: {
          key,
          value: item.value.trim(),
          category,
          isSecret,
          description,
        },
        update: {
          value: item.value.trim(),
          category,
          isSecret,
          ...(description ? { description } : {}),
        },
      });
    }
  }

  async getAzureConfig(): Promise<{
    org: string;
    project: string;
    token: string;
  }> {
    const org = await this.get("AZURE_DEVOPS_ORG");
    const project = await this.get("AZURE_DEVOPS_PROJECT");
    const token = await this.get("AZURE_DEVOPS_TOKEN");
    return { org, project, token };
  }

  async getGitHubConfig(): Promise<{
    token: string;
    apiUrl: string;
    defaultOwner: string;
  }> {
    const token = await this.get("GITHUB_TOKEN");
    const apiUrl =
      (await this.get("GITHUB_API_URL")) || "https://api.github.com";
    const defaultOwner = await this.get("GITHUB_DEFAULT_OWNER");
    return { token, apiUrl, defaultOwner };
  }

  async getGeminiConfig(): Promise<{ apiKey: string; model: string }> {
    const apiKey = await this.get("GEMINI_API_KEY");
    const model = (await this.get("GEMINI_MODEL")) || "gemini-3.5-flash-lite";
    return { apiKey, model };
  }

  async testConnection(dto: TestConnectionDto): Promise<TestConnectionResult> {
    if (dto.provider === "azure") {
      const org = dto.credentials?.org ?? (await this.get("AZURE_DEVOPS_ORG"));
      const token =
        dto.credentials?.token && !dto.credentials.token.includes("••••")
          ? dto.credentials.token
          : await this.get("AZURE_DEVOPS_TOKEN");

      if (!token) {
        return {
          success: false,
          message: "Token do Azure DevOps não informado ou configurado.",
        };
      }

      try {
        const cleanOrg = org
          .replace(/^https?:\/\/dev\.azure\.com\//i, "")
          .replace(/\/+$/, "");
        const auth = Buffer.from(`:${token}`).toString("base64");
        const url = `https://dev.azure.com/${cleanOrg}/_apis/projects?api-version=7.0`;
        const res = await axios.get(url, {
          headers: { Authorization: `Basic ${auth}` },
          timeout: 10000,
        });

        const count = res.data?.count ?? res.data?.value?.length ?? 0;
        return {
          success: true,
          message: `Conexão bem-sucedida! ${count} projeto(s) encontrado(s) na organização "${cleanOrg}".`,
          details: { projectsCount: count },
        };
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        return {
          success: false,
          message: `Falha na conexão com Azure DevOps: ${msg}`,
        };
      }
    }

    if (dto.provider === "github") {
      const token =
        dto.credentials?.token && !dto.credentials.token.includes("••••")
          ? dto.credentials.token
          : await this.get("GITHUB_TOKEN");
      const apiUrl =
        dto.credentials?.apiUrl ||
        (await this.get("GITHUB_API_URL")) ||
        "https://api.github.com";

      if (!token) {
        return {
          success: false,
          message: "Token do GitHub não informado ou configurado.",
        };
      }

      try {
        const cleanApiUrl = apiUrl.replace(/\/+$/, "");
        const res = await axios.get(`${cleanApiUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          timeout: 10000,
        });

        const login = res.data?.login || "Autenticado";
        return {
          success: true,
          message: `Conexão com GitHub bem-sucedida! Autenticado como @${login}.`,
          details: { login, name: res.data?.name },
        };
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        return {
          success: false,
          message: `Falha na conexão com GitHub: ${msg}`,
        };
      }
    }

    if (dto.provider === "gemini") {
      const apiKey =
        dto.credentials?.apiKey && !dto.credentials.apiKey.includes("••••")
          ? dto.credentials.apiKey
          : await this.get("GEMINI_API_KEY");

      if (!apiKey) {
        return {
          success: false,
          message: "Chave de API do Gemini não informada.",
        };
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await axios.get(url, { timeout: 10000 });
        const models = res.data?.models?.length || 0;
        return {
          success: true,
          message: `Chave de API do Gemini válida! ${models} modelos disponíveis na conta.`,
          details: { modelsCount: models },
        };
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.message;
        return {
          success: false,
          message: `Falha na validação do Gemini: ${msg}`,
        };
      }
    }

    return {
      success: false,
      message: `Provedor desconhecido: ${dto.provider}`,
    };
  }
}

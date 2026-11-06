import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { jsonrepair } from 'jsonrepair';


@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private client: GoogleGenAI;
  private defaultModel: string;
  private fallbackModels: string[] = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    this.defaultModel = this.configService.get<string>('gemini.model') || 'gemini-3.5-flash-lite';

    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
      this.logger.log(`Gemini Client inicializado com modelo ${this.defaultModel}`);
    } else {
      this.logger.warn('GEMINI_API_KEY não encontrada nas variáveis de ambiente!');
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generate(
    prompt: string,
    systemInstruction?: string,
    modelName?: string,
    temperature: number = 0.2
  ): Promise<string> {
    return this.executeWithRetry(
      modelName,
      async (model) => {
        const response = await this.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature,
          },
        });
        return response.text || '';
      }
    );
  }

  private sanitizeJsonString(raw: string): string {
    let cleaned = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();

    const firstBrace = cleaned.search(/[{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const code = cleaned.charCodeAt(i);

      if (inString) {
        if (escaped) {
          escaped = false;
          result += char;
        } else if (char === '\\') {
          escaped = true;
          result += char;
        } else if (char === '"') {
          inString = false;
          result += char;
        } else if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else if (code < 32) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += char;
        }
      } else {
        if (char === '"') {
          inString = true;
        }
        result += char;
      }
    }

    return result.replace(/,\s*([}\]])/g, '$1');
  }

  async generateJson<T = any>(
    prompt: string,
    systemInstruction?: string,
    modelName?: string,
    temperature: number = 0.1
  ): Promise<T> {
    const text = await this.executeWithRetry(
      modelName,
      async (model) => {
        const response = await this.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature,
            responseMimeType: 'application/json',
          },
        });
        return response.text || '{}';
      }
    );

    const sanitized = this.sanitizeJsonString(text);

    try {
      return JSON.parse(sanitized) as T;
    } catch {}

    try {
      const repaired = jsonrepair(text);
      return JSON.parse(repaired) as T;
    } catch {}

    try {
      const repaired = jsonrepair(sanitized);
      return JSON.parse(repaired) as T;
    } catch {}

    try {
      const fallback = jsonrepair(sanitized.replace(/[\u0000-\u001F]+/g, ' '));
      return JSON.parse(fallback) as T;
    } catch (parseErr: any) {
      this.logger.error(`Falha ao parsear JSON retornado pelo Gemini: ${parseErr.message}\nRaw: ${text.slice(0, 300)}`);
      throw new Error(
        `Falha ao interpretar resposta estruturada da IA: ${parseErr.message}. A resposta do modelo não seguiu o padrão JSON esperado.`
      );
    }
  }


  private async executeWithRetry<T>(
    requestedModel: string | undefined,
    fn: (model: string) => Promise<T>
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Cliente Gemini não configurado. Verifique a GEMINI_API_KEY.');
    }

    const primaryModel = requestedModel || this.defaultModel;
    const modelsToTry = [primaryModel, ...this.fallbackModels.filter((m) => m !== primaryModel)];

    let lastError: any = null;

    for (const model of modelsToTry) {
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite de 45s excedido na resposta do Gemini')), 45000)
          );
          return await Promise.race([fn(model), timeoutPromise]);
        } catch (error: any) {
          lastError = error;
          const msg = error.message || '';
          const isTransient =
            msg.includes('503') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('high demand') ||
            msg.includes('429') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('Tempo limite');

          if (isTransient && attempt < maxRetries) {
            const backoffMs = attempt * 1000;
            this.logger.warn(`Gemini (${model}) sob alta demanda (tentativa ${attempt}/${maxRetries}). Aguardando ${backoffMs}ms...`);
            await this.sleep(backoffMs);
            continue;
          }

          this.logger.warn(`Falha na chamada com modelo ${model}: ${msg}`);
          break;
        }
      }
    }

    this.logger.error(`Todas as tentativas do Gemini falharam: ${lastError?.message}`);
    throw lastError;
  }

  isAvailable(): boolean {
    return !!this.client;
  }
}

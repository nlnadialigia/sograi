export type SettingCategory = 'azure' | 'github' | 'ai' | 'general';

export interface SettingItemDto {
  key: string;
  value: string;
  category: SettingCategory;
  isSecret: boolean;
  isSet: boolean;
  description?: string;
}

export interface UpdateSettingDto {
  key: string;
  value: string;
  category?: SettingCategory;
  isSecret?: boolean;
  description?: string;
}

export interface UpdateSettingsBatchDto {
  settings: UpdateSettingDto[];
}

export interface TestConnectionDto {
  provider: 'azure' | 'github' | 'gemini';
  credentials?: {
    org?: string;
    project?: string;
    token?: string;
    apiUrl?: string;
    apiKey?: string;
    model?: string;
  };
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
}

import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  UpdateSettingsBatchDto,
  TestConnectionDto,
  TestConnectionResult,
  SettingItemDto,
} from './settings.types';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<SettingItemDto[]> {
    return this.settingsService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async saveSettings(@Body() body: UpdateSettingsBatchDto): Promise<{ success: boolean; message: string }> {
    if (!body || !Array.isArray(body.settings)) {
      throw new BadRequestException('Formato de dados inválido. Esperado array "settings".');
    }

    await this.settingsService.setMany(body.settings);
    return { success: true, message: 'Configurações salvas com sucesso!' };
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() body: TestConnectionDto): Promise<TestConnectionResult> {
    if (!body || !body.provider) {
      throw new BadRequestException('Provedor não informado.');
    }

    return this.settingsService.testConnection(body);
  }
}

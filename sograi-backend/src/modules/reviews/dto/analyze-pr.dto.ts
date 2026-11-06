import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzePrDto {
  @IsString()
  @IsNotEmpty()
  prUrl: string;

  @IsString()
  @IsOptional()
  mode?: 'unified' | 'separated';

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsOptional()
  includeTests?: boolean;
}

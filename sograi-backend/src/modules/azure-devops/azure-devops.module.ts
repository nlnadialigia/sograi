import { Module } from '@nestjs/common';
import { AzureDevOpsService } from './azure-devops.service';
import { AzureDevOpsController } from './azure-devops.controller';

@Module({
  controllers: [AzureDevOpsController],
  providers: [AzureDevOpsService],
  exports: [AzureDevOpsService],
})
export class AzureDevOpsModule {}

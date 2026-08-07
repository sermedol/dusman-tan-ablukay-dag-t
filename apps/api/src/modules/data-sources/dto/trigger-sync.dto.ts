import { IsBoolean, IsOptional } from 'class-validator';

export class TriggerSyncDto {
  @IsOptional()
  @IsBoolean({ message: 'dryRun must be a boolean' })
  dryRun?: boolean;
}

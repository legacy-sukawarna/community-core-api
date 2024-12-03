import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  group_id: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  photo_url?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  group_id: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  date: Date;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo_file?: any;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo_file?: any;
}

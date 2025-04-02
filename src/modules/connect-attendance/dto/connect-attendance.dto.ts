import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  @Type(() => Date) // This will transform the string to Date
  date: Date;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo_file?: any;
}

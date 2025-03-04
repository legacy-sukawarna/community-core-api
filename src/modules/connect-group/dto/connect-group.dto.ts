import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  mentor_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  mentee_id: string[];
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  mentor_id: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  mentee_id: string[];
}

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
  leader_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  mentee_id: string[];
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  leader_id: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // Assuming IDs are UUIDs
  mentee_id: string[];
}

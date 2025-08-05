import { Gender, Role } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class UpdatedUserDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  congregation_id?: string;

  @IsString()
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsString()
  @IsOptional()
  birth_date?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  is_baptized?: boolean;

  @IsBoolean()
  @IsOptional()
  kom_100?: boolean;

  @IsBoolean()
  @IsOptional()
  encounter?: boolean;

  @IsBoolean()
  @IsOptional()
  establish?: boolean;

  @IsBoolean()
  @IsOptional()
  equip?: boolean;

  @IsBoolean()
  @IsOptional()
  is_committed?: boolean;
}

export class NewUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsString()
  @IsOptional()
  google_id?: string;

  @IsString()
  @IsOptional()
  congregation_id?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  birth_date?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  is_baptized?: boolean;

  @IsBoolean()
  @IsOptional()
  kom_100?: boolean;

  @IsBoolean()
  @IsOptional()
  encounter?: boolean;

  @IsBoolean()
  @IsOptional()
  establish?: boolean;

  @IsBoolean()
  @IsOptional()
  equip?: boolean;

  @IsBoolean()
  @IsOptional()
  is_committed?: boolean;
}

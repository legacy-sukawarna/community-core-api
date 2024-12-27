import { Gender, Role } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';

export class UpdatedUserDto {
  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  congregation_id: string;

  @IsString()
  @IsOptional()
  gender: Gender;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  role: Role;
}

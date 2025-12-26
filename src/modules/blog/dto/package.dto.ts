import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ description: 'Package name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Package description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdatePackageDto {
  @ApiPropertyOptional({ description: 'Package name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Package description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsString()
  @IsOptional()
  slug?: string;
}

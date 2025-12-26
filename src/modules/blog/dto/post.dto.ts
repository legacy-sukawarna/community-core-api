import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Post content (HTML)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt for previews' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsString()
  @IsOptional()
  featured_image?: string;

  @ApiProperty({ description: 'Package ID this post belongs to' })
  @IsUUID()
  @IsNotEmpty()
  package_id: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'Post title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Post content (HTML)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Short excerpt for previews' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsString()
  @IsOptional()
  featured_image?: string;

  @ApiPropertyOptional({ description: 'Package ID this post belongs to' })
  @IsUUID()
  @IsOptional()
  package_id?: string;
}

export class PostQueryDto {
  @ApiPropertyOptional({ description: 'Filter by package ID' })
  @IsUUID()
  @IsOptional()
  package_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: PostStatus,
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Filter by author ID' })
  @IsUUID()
  @IsOptional()
  author_id?: string;

  @ApiPropertyOptional({ description: 'Search in title' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number;
}

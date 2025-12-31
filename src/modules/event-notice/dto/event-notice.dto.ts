import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventLinkType } from '@prisma/client';

export class CreateEventNoticeDto {
  @ApiProperty({ description: 'Event notice title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Event notice description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Event poster image URL' })
  @IsString()
  @IsOptional()
  poster_url?: string;

  @ApiPropertyOptional({
    description:
      'Event link (internal route like /blog/post-1 or external URL like https://example.com)',
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    description: 'Link type (auto-detected if not provided)',
    enum: EventLinkType,
  })
  @IsEnum(EventLinkType)
  @IsOptional()
  link_type?: EventLinkType;
}

export class UpdateEventNoticeDto {
  @ApiPropertyOptional({ description: 'Event notice title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Event notice description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Event poster image URL' })
  @IsString()
  @IsOptional()
  poster_url?: string;

  @ApiPropertyOptional({
    description:
      'Event link (internal route like /blog/post-1 or external URL like https://example.com)',
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    description: 'Link type (auto-detected if not provided)',
    enum: EventLinkType,
  })
  @IsEnum(EventLinkType)
  @IsOptional()
  link_type?: EventLinkType;
}

export class EventNoticeQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number;
}


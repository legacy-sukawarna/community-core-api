import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormSubmissionDto {
  @ApiProperty({
    description: 'Name of the person submitting the form',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the person submitting the form',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the person submitting the form',
    example: '+62812345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Additional data from the form (flexible key-value pairs)',
    example: { message: 'Hello!', source: 'website' },
  })
  @IsObject()
  @IsOptional()
  additionalData?: Record<string, any>;
}

export class FormSubmissionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Form submitted successfully' })
  message: string;

  @ApiPropertyOptional({ example: 'email_123abc' })
  emailId?: string;
}

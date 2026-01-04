import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import {
  FormSubmissionDto,
  FormSubmissionResponseDto,
} from './dto/form-submission.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);
  private readonly apiKey: string | undefined;
  private readonly adminEmails: string[];

  constructor(private readonly emailService: EmailService) {
    this.apiKey = process.env.FORM_WEBHOOK_API_KEY;
    // Parse admin emails from environment variable (comma-separated)
    this.adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS
      ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map((e) => e.trim())
      : [];
  }

  @Post('form-submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle form submission from Google Forms',
    description:
      'Receives form data from Google Apps Script and sends confirmation email to submitter',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key for webhook authentication',
    required: false,
  })
  @ApiBody({ type: FormSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'Form submission processed successfully',
    type: FormSubmissionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async handleFormSubmission(
    @Body() formData: FormSubmissionDto,
    @Headers('x-api-key') apiKey?: string,
  ): Promise<FormSubmissionResponseDto> {
    // Validate API key if configured
    if (this.apiKey && apiKey !== this.apiKey) {
      this.logger.warn('Invalid API key received for form submission');
      throw new UnauthorizedException('Invalid API key');
    }

    this.logger.log(
      `Received form submission from ${formData.name} (${formData.email})`,
    );

    // Send confirmation email to the submitter
    const emailId = await this.emailService.sendFormConfirmation(formData);

    // Optionally send notification to admins
    if (this.adminEmails.length > 0) {
      await this.emailService.sendAdminNotification(formData, this.adminEmails);
    }

    return {
      success: true,
      message: 'Form submitted successfully',
      emailId: emailId || undefined,
    };
  }
}

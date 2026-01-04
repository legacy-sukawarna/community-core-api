import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { render } from '@react-email/render';
import { FormSubmissionDto } from './dto/form-submission.dto';
import { EventRegistrationEmail, AdminNotificationEmail } from './templates';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
  }

  onModuleInit() {
    // Create transporter based on environment configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.warn(`SMTP connection failed: ${error.message}`);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  /**
   * Send confirmation email to form submitter
   */
  async sendFormConfirmation(data: FormSubmissionDto): Promise<string | null> {
    try {
      const html = await render(
        EventRegistrationEmail({
          name: data.name,
          email: data.email,
          phone: data.phone,
          additionalData: data.additionalData,
        }),
      );

      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: data.email,
        subject: 'Thank you for your submission!',
        html,
      });

      this.logger.log(
        `Confirmation email sent to ${data.email}, ID: ${info.messageId}`,
      );
      return info.messageId;
    } catch (error) {
      this.logger.error('Error sending confirmation email', error);
      return null;
    }
  }

  /**
   * Send notification email to admin(s) about new form submission
   */
  async sendAdminNotification(
    data: FormSubmissionDto,
    adminEmails: string[],
  ): Promise<string | null> {
    if (!adminEmails.length) {
      this.logger.warn('No admin emails configured for notification');
      return null;
    }

    try {
      const html = await render(
        AdminNotificationEmail({
          name: data.name,
          email: data.email,
          phone: data.phone,
          additionalData: data.additionalData,
        }),
      );

      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: adminEmails.join(', '),
        subject: `New Form Submission from ${data.name}`,
        html,
      });

      this.logger.log(`Admin notification sent, ID: ${info.messageId}`);
      return info.messageId;
    } catch (error) {
      this.logger.error('Error sending admin notification', error);
      return null;
    }
  }
}

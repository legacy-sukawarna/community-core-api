import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from '@react-email/components';

interface ConfirmationEmailProps {
  name: string;
  email: string;
  phone?: string;
  additionalData?: Record<string, any>;
}

/**
 * Format a key string to title case
 * e.g., "user_name" -> "User Name"
 */
const formatKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ConfirmationEmail: React.FC<ConfirmationEmailProps> = ({
  name,
  email,
  phone,
  additionalData,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your submission, {name}!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Thank You!</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>
              Hi <strong>{name}</strong>,
            </Text>

            <Text style={paragraph}>
              Thank you for your submission! We have received your information
              and will get back to you soon.
            </Text>

            {/* Submission Details Box */}
            <Section style={detailsBox}>
              <Heading as="h3" style={detailsTitle}>
                Your Submission Details:
              </Heading>
              <Text style={detailItem}>
                <strong>Name:</strong> {name}
              </Text>
              <Text style={detailItem}>
                <strong>Email:</strong> {email}
              </Text>
              {phone && (
                <Text style={detailItem}>
                  <strong>Phone:</strong> {phone}
                </Text>
              )}
              {additionalData &&
                Object.entries(additionalData).map(([key, value]) => (
                  <Text key={key} style={detailItem}>
                    <strong>{formatKey(key)}:</strong> {String(value)}
                  </Text>
                ))}
            </Section>

            <Text style={helpText}>
              If you have any questions, feel free to reply to this email.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              This is an automated message. Please do not reply directly to this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '30px',
  textAlign: 'center',
  borderRadius: '10px 10px 0 0',
};

const headerTitle: React.CSSProperties = {
  color: 'white',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
};

const content: React.CSSProperties = {
  backgroundColor: '#f9f9f9',
  padding: '30px',
  borderRadius: '0 0 10px 10px',
};

const greeting: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333',
};

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333',
};

const detailsBox: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #667eea',
};

const detailsTitle: React.CSSProperties = {
  marginTop: '0',
  color: '#667eea',
  fontSize: '18px',
};

const detailItem: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '14px',
  color: '#333',
};

const helpText: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
};

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #ddd',
  margin: '30px 0',
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'center',
};

export default ConfirmationEmail;

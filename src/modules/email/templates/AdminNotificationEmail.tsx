import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Button,
  Preview,
} from '@react-email/components';

interface AdminNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  additionalData?: Record<string, any>;
  timestamp?: string;
}

/**
 * Format a key string to title case
 * e.g., "user_name" -> "User Name"
 */
const formatKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const AdminNotificationEmail: React.FC<AdminNotificationEmailProps> = ({
  name,
  email,
  phone,
  additionalData,
  timestamp,
}) => {
  const formattedTimestamp =
    timestamp ||
    new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

  return (
    <Html>
      <Head />
      <Preview>New form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>📬 New Form Submission</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={timestampText}>
              Received on: <strong>{formattedTimestamp}</strong>
            </Text>

            {/* Submission Details Table */}
            <Section style={detailsBox}>
              <Heading as="h3" style={detailsTitle}>
                Submission Details:
              </Heading>

              <table style={table}>
                <tbody>
                  <tr>
                    <td style={tableLabelCell}>Name</td>
                    <td style={tableValueCell}>{name}</td>
                  </tr>
                  <tr>
                    <td style={tableLabelCell}>Email</td>
                    <td style={tableValueCell}>
                      <Link href={`mailto:${email}`} style={emailLink}>
                        {email}
                      </Link>
                    </td>
                  </tr>
                  {phone && (
                    <tr>
                      <td style={tableLabelCell}>Phone</td>
                      <td style={tableValueCell}>{phone}</td>
                    </tr>
                  )}
                  {additionalData &&
                    Object.entries(additionalData).map(([key, value]) => (
                      <tr key={key}>
                        <td style={tableLabelCell}>{formatKey(key)}</td>
                        <td style={tableValueCell}>{String(value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button href={`mailto:${email}`} style={replyButton}>
                Reply to {name}
              </Button>
            </Section>
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
  backgroundColor: '#2d3748',
  padding: '30px',
  textAlign: 'center',
  borderRadius: '10px 10px 0 0',
};

const headerTitle: React.CSSProperties = {
  color: 'white',
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
};

const content: React.CSSProperties = {
  backgroundColor: '#f9f9f9',
  padding: '30px',
  borderRadius: '0 0 10px 10px',
};

const timestampText: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
};

const detailsBox: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const detailsTitle: React.CSSProperties = {
  marginTop: '0',
  color: '#2d3748',
  fontSize: '18px',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableLabelCell: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  fontWeight: 'bold',
  width: '120px',
  color: '#333',
};

const tableValueCell: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  color: '#333',
};

const emailLink: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '20px',
};

const replyButton: React.CSSProperties = {
  backgroundColor: '#667eea',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

export default AdminNotificationEmail;

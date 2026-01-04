import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Link,
  Img,
  Preview,
  Row,
  Column,
} from '@react-email/components';

interface EventRegistrationEmailProps {
  name: string;
  eventName: string;
  eventCode: string;
  eventDate: string;
  eventMonth: string;
  eventDay: string;
  eventYear: string;
  eventDescription?: string;
  heroImageUrl?: string;
  calendarUrl?: string;
  instagramUrl?: string;
  hotlineNumber?: string;
}

export const EventRegistrationEmail: React.FC<EventRegistrationEmailProps> = ({
  name,
  eventName = 'ENCOUNTER',
  eventCode = 'E1',
  eventDate = 'January 27, 2024',
  eventMonth = 'Januari 2024',
  eventDay = '27',
  eventYear = '2024',
  eventDescription = 'Prepare your heart to experience an encounter with God and receive a complete healing from God.\nLet the dry bones awaken!',
  heroImageUrl,
  calendarUrl = '#',
  instagramUrl = 'https://instagram.com/legacy',
  hotlineNumber = '08973339888',
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Congratulations! You have registered for ALIVE 3710 : {eventName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>ALIVE 3710 : {eventName}</Heading>
            <Text style={headerSubtitle}>LEGACY</Text>
          </Section>

          {/* Hero Image/Banner */}
          <Section style={heroBanner}>
            {heroImageUrl ? (
              <Img
                src={heroImageUrl}
                alt={eventName}
                width="100%"
                style={heroImage}
              />
            ) : (
              <>
                {/* Logos */}
                <Section style={logoContainer}>
                  <Text style={aliveLogo}>
                    <span style={aliveText}>Alive</span>
                    <span style={aliveNumber}>3710</span>
                  </Text>
                  <Text style={legacyLogo}>LEGACY</Text>
                </Section>

                {/* Event Name */}
                <Heading style={eventTitle}>encounter</Heading>
                <Text style={eventDateText}>{eventDate}</Text>

                {/* Topics */}
                <Section style={topicsContainer}>
                  <Row>
                    <Column style={topicColumn}>
                      <Text style={topicText}>Father's Heart</Text>
                    </Column>
                    <Column style={topicColumn}>
                      <Text style={topicText}>Self Image</Text>
                    </Column>
                    <Column style={topicColumn}>
                      <Text style={topicText}>Holiness</Text>
                    </Column>
                  </Row>
                </Section>
              </>
            )}
          </Section>

          {/* Content Section */}
          <Section style={contentSection}>
            <Row>
              {/* Left Column - Message */}
              <Column style={messageColumn}>
                <Text style={greeting}>Hello, {name}!</Text>
                <Text style={congratsText}>
                  Congratulation! You have already registered in
                </Text>
                <Text style={eventNameText}>
                  ALIVE 3710 : {eventName} ({eventCode})
                </Text>
                <Text style={descriptionText}>
                  {eventDescription.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < eventDescription.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Text>
                <Text style={seeYouText}>See you at {eventCode}!</Text>
              </Column>

              {/* Right Column - Calendar */}
              <Column style={calendarColumn}>
                <Section style={calendarBox}>
                  <Text style={calendarMonth}>{eventMonth}</Text>
                  <Text style={calendarDay}>{eventDay}</Text>
                </Section>
                <Text style={seeYouEvent}>See you on the event</Text>
                <Button href={calendarUrl} style={calendarButton}>
                  ADD TO YOUR CALENDAR
                </Button>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Link href={instagramUrl} style={instagramLink}>
              <Text style={instagramText}>📷 Instagram</Text>
            </Link>
            <Text style={copyright}>
              <em>Copyright © {eventYear} Legacy, All rights reserved.</em>
            </Text>
            <Text style={hotline}>
              <strong>Our hotline number: {hotlineNumber}</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#ffffff',
};

const headerTitle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0 0 5px 0',
};

const headerSubtitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0',
  letterSpacing: '2px',
};

const heroBanner: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '40px 20px',
  textAlign: 'center',
};

const heroImage: React.CSSProperties = {
  width: '100%',
  display: 'block',
};

const logoContainer: React.CSSProperties = {
  marginBottom: '30px',
};

const aliveLogo: React.CSSProperties = {
  display: 'inline',
  marginRight: '20px',
};

const aliveText: React.CSSProperties = {
  color: '#f5a623',
  fontSize: '18px',
  fontStyle: 'italic',
};

const aliveNumber: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '12px',
};

const legacyLogo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  display: 'inline',
  margin: '0',
};

const eventTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '72px',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 'normal',
  margin: '0 0 10px 0',
  letterSpacing: '2px',
};

const eventDateText: React.CSSProperties = {
  color: '#c9a962',
  fontSize: '24px',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  margin: '0 0 40px 0',
  textDecoration: 'underline',
};

const topicsContainer: React.CSSProperties = {
  width: '100%',
};

const topicColumn: React.CSSProperties = {
  width: '33.33%',
  textAlign: 'center',
};

const topicText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
};

const contentSection: React.CSSProperties = {
  padding: '30px 20px',
};

const messageColumn: React.CSSProperties = {
  width: '55%',
  verticalAlign: 'top',
  paddingRight: '20px',
};

const calendarColumn: React.CSSProperties = {
  width: '45%',
  verticalAlign: 'top',
  textAlign: 'center',
};

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#333333',
  margin: '0 0 10px 0',
};

const congratsText: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '0',
};

const eventNameText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0',
};

const descriptionText: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
};

const seeYouText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0',
};

const calendarBox: React.CSSProperties = {
  backgroundColor: '#e8e8e8',
  padding: '15px 30px',
  display: 'inline-block',
  marginBottom: '10px',
};

const calendarMonth: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '0 0 5px 0',
  textAlign: 'center',
};

const calendarDay: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0',
  textAlign: 'center',
};

const seeYouEvent: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '10px 0',
};

const calendarButton: React.CSSProperties = {
  backgroundColor: '#7cb342',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '15px 25px',
  textDecoration: 'none',
  borderRadius: '0',
  display: 'inline-block',
};

const footer: React.CSSProperties = {
  padding: '30px 20px',
  textAlign: 'center',
  borderTop: '1px solid #eeeeee',
};

const instagramLink: React.CSSProperties = {
  textDecoration: 'none',
};

const instagramText: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '0 0 20px 0',
};

const copyright: React.CSSProperties = {
  fontSize: '12px',
  color: '#666666',
  margin: '0 0 5px 0',
};

const hotline: React.CSSProperties = {
  fontSize: '12px',
  color: '#333333',
  margin: '0',
};

export default EventRegistrationEmail;

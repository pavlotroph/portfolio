import React from 'react';
import { Helmet } from 'react-helmet-async';
import ContactForm from '../../components/ContactForm/ContactForm';
import {
  AdditionalWrapper,
  ContactContainer,
  ContactTitel,
  WrapperInfo,
  SocialContainerLink,
  TextContact,
  EmailSocialLink,
  LocationContainer,
  LocationLink,
} from './Contact.styled';

const Contact: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Contact</title>
        <meta name="description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
        <meta property="og:title" content="Contact" />
        <meta property="og:description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
        <meta property="og:url" content="https://pavlo-protfolio.vercel.app/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact | Pavlo Troph Portfolio" />
        <meta name="twitter:description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
      </Helmet>
      
      <AdditionalWrapper>
        <ContactContainer>
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
            Contact
          </h1>
          <ContactTitel as="h2">Let's Talk</ContactTitel>
          <WrapperInfo>
            <SocialContainerLink>
              <TextContact>Contact</TextContact>
              <EmailSocialLink href="mailto:info@pavlotroph.com" aria-label="Send email to info@pavlotroph.com">
                info@pavlotroph.com
              </EmailSocialLink>
              <EmailSocialLink href="https://www.linkedin.com/in/pavlo-trofimenko/" target="_blank" rel="noopener noreferrer" aria-label="Visit LinkedIn profile (opens in new tab)">
                LinkedIn
              </EmailSocialLink>
              <EmailSocialLink href="https://t.me/pavlotroph" target="_blank" rel="noopener noreferrer" aria-label="Contact on Telegram (opens in new tab)">
                Telegram
              </EmailSocialLink>
              <EmailSocialLink href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Instagram profile (opens in new tab)">
                Instagram
              </EmailSocialLink>
            </SocialContainerLink>
            <LocationContainer>
              <TextContact>Location</TextContact>
              <LocationLink
                href="https://maps.app.goo.gl/b7UCDY41c7FuzzFC6"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View location on Google Maps (opens in new tab)"
              >
                Toronto, ON, CA
              </LocationLink>
            </LocationContainer>
          </WrapperInfo>
          <ContactForm />
        </ContactContainer>
      </AdditionalWrapper>
    </>
  );
};

export default Contact;

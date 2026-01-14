import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  CollectionHeader,
  CollectionWrapper,
  CollectionAdditionalWrapper,
  CUSTOM_SPLITTER,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
} from '../CollectionComponent/CollectionComponent.styled';
import DOMPurify from "dompurify";
import styled from 'styled-components';

export const FooterContainer = styled.footer`
  width: 100%;
  background: #000;
  color: #fff;
`;

/* hover-animated link */
export const FooterLink = styled.a`
  text-decoration: none;
  color: inherit;
  transition: color 200ms ease;

  &:hover,
  &:focus {
    color: #2ea3ff;
  }
`;

type FooterSection = {
  id: number;
  position: number;
  label: string;
  text: string;
  tag?: 'h1' | 'h2' | 'h3';
  link?: string | null;
};

const Footer: React.FC = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('footer_sections')
        .select('*')
        .order('position');

      if (error) {
        console.error('[Footer] fetch error:', error.message);
      } else {
        setSections(data as FooterSection[]);
      }
    })();
  }, []);

  const grouped = sections.reduce<Record<string, FooterSection[]>>((acc, sec) => {
    acc[sec.label] = acc[sec.label] ? [...acc[sec.label], sec] : [sec];
    return acc;
  }, {});

  const isLoaded = sections.length > 0;

return (
  <FooterContainer
    role="contentinfo"
    data-loaded={isLoaded}
    aria-busy={!isLoaded}
  >
    <CUSTOM_SPLITTER />
    <CollectionAdditionalWrapper>
      <CollectionHeader>
        {isLoaded ? (
          Object.entries(grouped).map(([label, items]) => (
            <CollectionWrapper key={label}>
              <COLLECTION_4SEC_TITLE>{label}</COLLECTION_4SEC_TITLE>

              {items.length === 1 ? (
                renderItem(items[0])
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {items.map(renderItem)}
                </div>
              )}
            </CollectionWrapper>
          ))
        ) : (
          <div style={{ height: 220 }} />
        )}
      </CollectionHeader>
    </CollectionAdditionalWrapper>
  </FooterContainer>
);
};

/* helper: render a footer item */
function renderItem(sec: FooterSection) {
  const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
    if (typeof tag !== 'string') return false;
    return /^[a-z][a-z0-9]*$/.test(tag) && !tag.includes(':') && !tag.includes('/');
  };

  const Tag = isValidTag(sec.tag) ? sec.tag : 'h3';
  const cleanHtml = DOMPurify.sanitize(sec.text, {
  ALLOWED_TAGS: ["br", "strong", "em", "span", "p", "h1", "h2", "h3", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
});

  if (sec.link) {
    const external = /^https?:\/\//i.test(sec.link);
    
    return (
      <FooterLink
        key={sec.id}
        href={sec.link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={
          sec.text
            ? `${sec.text}${external ? ' (opens in new tab)' : ''}`
            : undefined
        }
      >
        <COLLECTION_4SEC_DESCRIPTION
          as={Tag}
          dangerouslySetInnerHTML={{ __html: cleanHtml  }}
        />
      </FooterLink>
    );
  }
  
  return (
  <COLLECTION_4SEC_DESCRIPTION
    key={sec.id}
    as={Tag}
    dangerouslySetInnerHTML={{ __html: cleanHtml }}
  />
);
}

export default Footer;

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import QuoteBlock from '../../components/Quote/QuoteBlock';
import {
  CollectionContainer,
  CollectionWrapper,
  CollectionAdditionalWrapper,
  CollectionHeader,
  COLLECTION_1SEC_TITLE,
  COLLECTION_1SEC_DESCRIPTION,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
  CollectionTextWrapper
} from '../../components/CollectionComponent/CollectionComponent.styled';
import { CUSTOM_SPLITTER } from '../../components/CollectionComponent/CollectionComponent.styled';
import { Quote } from '../Work/Work';
import { supabase } from '../../supabaseClient';

const Info: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    const { data, error } = await supabase.from('quotes').select('*');
    if (error) {
      console.error('Помилка при отриманні цитат:', error.message);
    } else {
      setQuotes(data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchQuotes();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);
  return (
    <>
      <Helmet>
        <title>Info / CV</title>
        <meta property="og:title" content="Info / CV" />
        <meta name="description" content="Info & CV — tools, skills, and experience of Pavlo Troph . Available for collaborations and studio roles." />
        <meta property="og:description" content="Info & CV — tools, skills, and experience of Pavlo Troph . Available for collaborations and studio roles." />
        <meta property="og:url" content="https://pavlo-protfolio.vercel.app/info" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Info / CV | Pavlo Troph Portfolio" />
        <meta name="twitter:description" content="Info & CV — tools, skills, and experience of Pavlo Troph. Available for collaborations and studio roles." />
      </Helmet>
      
      <CollectionContainer style={{ marginTop: '10px' }}>
        <CollectionAdditionalWrapper>
          <CollectionHeader>
            {[
              { tag: 'h2', text: 'Pavlo Troph', label: 'Artist Name', bold: true },
            { tag: 'h3', text: 'Graphic Design\nCGI\nPhotography\nCinematography\nArt Direction', label: 'Specialization' },
            { tag: 'h3', text: 'Toronto, ON, CA', label: 'Location' },
            { tag: 'h3', text: 'info@pavlotroph.com', label: 'Contact' },
          ].map((s, i) => {
            // Validate tag to ensure it's a valid HTML tag and not a data URI
            const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
              if (typeof tag !== 'string') return false;
              // Prevent data URIs and other invalid tag names
              return /^[a-z][a-z0-9]*$/.test(tag) && !tag.includes(':') && !tag.includes('/');
            };
            const validTag = isValidTag(s.tag) ? s.tag : 'h3';
            
            return (
            <CollectionWrapper key={i}>
              <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
              <COLLECTION_4SEC_DESCRIPTION as={validTag as any} style={(s as any).bold ? { fontWeight: 550 } : {}}>
                {s.text.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </COLLECTION_4SEC_DESCRIPTION>
            </CollectionWrapper>
          );
          })}
        </CollectionHeader>
        <CollectionTextWrapper>
          {[
            {
              label: "Description",
              segments: [
                {
                  tag: "h2",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "Pavlo Troph"
                },
                {
                  tag: "span",
                  text: " is a multidisciplinary artist dedicated to creating impactful and emotionally resonant experiences. By skillfully blending visuals, sound, and storytelling, he transforms ideas into memorable and engaging products. "
                }
              ]
            },
            {
              label: "Companies",
              segments: [
                {
                  tag: "h2",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "FiveMods"
                },
                {
                 "text": "\n",
                },
                {
                  tag: "h2",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "Network Graphics"
                },
                {
                 "text": "\n",
                },  
                {
                  tag: "h2",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "Meta Network"
                }
              ]
            },
            {
              label: "Software Skills",
              segments: [
                {
                  tag: "h2",
                  text: "Adobe Suite"
                },
                {
                 "text": "\n",
                },
                {
                  tag: "h2",
                  text: "Blender"
                },
                {
                 "text": "\n",
                },  
                {
                  tag: "h2",
                  text: "Figma"
                }
              ]
            }
          ].map((section, i) => (
            <div key={i}>
              <COLLECTION_1SEC_TITLE>{section.label}</COLLECTION_1SEC_TITLE>
              <COLLECTION_1SEC_DESCRIPTION>
                {section.segments.map((seg, idx) => {
                  // Validate tag to ensure it's a valid HTML tag and not a data URI
                  const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
                    if (typeof tag !== 'string') return false;
                    // Prevent data URIs and other invalid tag names
                    return /^[a-z][a-z0-9]*$/.test(tag) && !tag.includes(':') && !tag.includes('/');
                  };
                  
                  const Tag = isValidTag(seg.tag) ? seg.tag : 'span';

                  const renderTextWithBreaks = (text: string) =>
                    text.split("\n").map((line, lineIdx) => (
                      <React.Fragment key={lineIdx}>
                        {line}
                        {lineIdx < text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ));

                  const element = (
                    <Tag key={idx} style={{ display: "inline" }}>
                      {renderTextWithBreaks(seg.text)}
                    </Tag>
                  );

                  return seg.link ? (
                    <a
                      key={idx}
                      href={seg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${seg.text} (opens in new tab)`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {element}
                      <span style={{ marginLeft: '4px', fontSize: '0.9em', opacity: 0.7 }} aria-hidden="true" title="Opens in new tab"></span>
                    </a>
                  ) : (
                    element
                  );
                })}
              </COLLECTION_1SEC_DESCRIPTION>
            </div>
          ))}
        </CollectionTextWrapper>
      </CollectionAdditionalWrapper>
    
      <CUSTOM_SPLITTER />

      {currentQuote && <QuoteBlock quote={currentQuote} />}
    </CollectionContainer>
    </>
  );
};

export default Info;
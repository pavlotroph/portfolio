import React, { useEffect, useState } from 'react';
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
    <CollectionContainer>
      <CollectionAdditionalWrapper>
        <CollectionHeader>
          {[
            { tag: 'h1', text: 'Pavlo Troph', label: 'Artist Name' },
            { tag: 'h3', text: 'Graphic Design\nCGI\nPhotography\nCinematography\nArt Direction', label: 'Specialization' },
            { tag: 'h3', text: 'Toronto, ON, CA', label: 'Location' },
            { tag: 'h3', text: 'info@pavlotroph.com', label: 'Contact' },
          ].map((s, i) => (
            <CollectionWrapper key={i}>
              <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
              <COLLECTION_4SEC_DESCRIPTION as={s.tag}>
                {s.text.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </COLLECTION_4SEC_DESCRIPTION>
            </CollectionWrapper>
          ))}
        </CollectionHeader>
        <CollectionTextWrapper>
          {[
            {
              label: "Description",
              segments: [
                {
                  tag: "h1",
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
                  tag: "h1",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "FiveMods"
                },
                {
                 "text": "\n",
                },
                {
                  tag: "h1",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "Network Graphics"
                },
                {
                 "text": "\n",
                },  
                {
                  tag: "h1",
                  link: "https://www.instagram.com/pavlotroph/",
                  text: "Meta Network"
                }
              ]
            },
            {
              label: "Software Skills",
              segments: [
                {
                  tag: "h1",
                  text: "Adobe Suite"
                },
                {
                 "text": "\n",
                },
                {
                  tag: "h1",
                  text: "Blender"
                },
                {
                 "text": "\n",
                },  
                {
                  tag: "h1",
                  text: "Figma"
                }
              ]
            }
          ].map((section, i) => (
            <div key={i}>
              <COLLECTION_1SEC_TITLE>{section.label}</COLLECTION_1SEC_TITLE>
              <COLLECTION_1SEC_DESCRIPTION>
                {section.segments.map((seg, idx) => {
                  const Tag = (seg.tag || 'span') as keyof JSX.IntrinsicElements;

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
                    >
                      {element}
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
  );
};

export default Info;

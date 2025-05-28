import React, { useEffect, useState } from 'react';
import {
  WorkDescription,
  WorkDescriptionWrapp,
  WorkTextDescription,
} from './Info.styled';
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
            { tag: 'h1', text: 'Toronto', label: 'Collection' },
            { tag: 'h2', text: '2024', label: 'Year' },
            { tag: 'h3', text: 'Personal\nStreet', label: 'Category' },
            { tag: 'h1', text: 'Tokyo drift', label: 'Synopsis' },
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
                  text: " is a multidisciplinary artist."
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

      {currentQuote && (
        <WorkDescriptionWrapp>
          <WorkDescription>{currentQuote.text}</WorkDescription>
          <WorkTextDescription>
            — {currentQuote.author}, <i>{currentQuote.source}</i>
          </WorkTextDescription>
        </WorkDescriptionWrapp>
      )}
    </CollectionContainer>
  );
};

export default Info;

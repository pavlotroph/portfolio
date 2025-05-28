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
                  text: "Pavlo Troph",
                  weight: 700,
                  size: "18px",
                  link: "https://www.instagram.com/pavlotroph/"
                },
                {
                  text: " is a multidisciplinary artist dedicated to creating impactful and emotionally resonant experiences. By skillfully blending visuals, sound, and storytelling, he transforms ideas into memorable and engaging products.",
                  weight: 500,
                  size: "16px"
                },
              ]
            }
          ].map((section, i) => (
            <div key={i}>
              <COLLECTION_1SEC_TITLE>{section.label}</COLLECTION_1SEC_TITLE>
              <COLLECTION_1SEC_DESCRIPTION>
                {section.segments.map((seg, idx) => {
                  const style: React.CSSProperties = {};
                  if (seg.weight) style.fontWeight = seg.weight;
                  if (seg.size) style.fontSize = seg.size;

                  const content = (
                    <span key={idx} style={style}>
                      {seg.text}
                    </span>
                  );

                  return seg.link ? (
                    <a
                      key={idx}
                      href={seg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    content
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

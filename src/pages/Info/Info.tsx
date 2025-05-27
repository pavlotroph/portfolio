import React, { useEffect, useState } from 'react';
import {
  InfoColumnContainer,
  InfoSmollName,
  InfoText,
  UnderlinedText,
  WorkDescription,
  WorkDescriptionWrapp,
  WorkTextDescription,
  WrapperLink,
} from './Info.styled';
import {
  CollectionContainer,
  CollectionWrapper,
  CollectionAdditionalWrapper,
  CollectionHeader,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION
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
      </CollectionAdditionalWrapper>
      <InfoColumnContainer>
        <InfoText>Info</InfoText>
        <InfoSmollName>
          Pavlo Troph
          <span>
            {' '}
            is a multidisciplinary artist dedicated to creating impactful and
            emotionally resonant experiences. By skillfully blending visuals,
            sound, and storytelling, he transforms ideas into memorable and
            engaging products.
          </span>{' '}
        </InfoSmollName>

        <InfoText>Companies</InfoText>

        <InfoSmollName>
          FiveMods
          <br /> Network <br />
          Graphics
          <br /> Meta Network
        </InfoSmollName>

        <InfoText>Software Skills</InfoText>
        <InfoSmollName>
          Blender 3D <br />
          Adobe Suite
          <br /> Figma
        </InfoSmollName>

        <InfoText>Links</InfoText>
        <WrapperLink>
          <UnderlinedText
            target="_blank"
            rel="noopener noreferrer"
            href="https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/global//RESUME.pdf"
          >
            Resume
          </UnderlinedText>
          <UnderlinedText
            href="https://www.youtube.com/watch?v=LUzVjS18PjI"
            target="_blank"
            rel="noopener noreferrer"
          >
            Latest ShowReel
          </UnderlinedText>
        </WrapperLink>
      </InfoColumnContainer>
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

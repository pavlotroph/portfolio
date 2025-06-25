import React from 'react';
import { Quote } from '../../pages/Work/Work';
import {
  Wrapper,
  TextBlock,
  QuoteText,
  QuoteSource,
} from '../Quote/QuoteBlock.styled';

interface QuoteBlockProps {
  quote: Quote;
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({ quote }) => (
  <Wrapper>
    <TextBlock>
      {/* Render as plain text; CSS handles clamping and preserving newlines */}
      <QuoteText>{quote.text}</QuoteText>
      <QuoteSource>
        — {quote.author}, <i>{quote.source}</i>
      </QuoteSource>
    </TextBlock>
  </Wrapper>
);

export default QuoteBlock;
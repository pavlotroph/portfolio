import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 48px 24px;
  gap: 10px;
  width: 100%;
  max-width: 1920px;
  background: #000;
  margin: 0 auto;

  @media screen and (min-width: 744px){
    padding: 72px 24px;
  }

    transition: padding 0.4s ease-in-out, gap 0.4s ease-in-out;

  @media screen and (min-width: 1440px){
    padding: 96px 24px;
  }
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 1440px;
  /* let the content decide the height */
  height: auto;
`;

export const QuoteText = styled.div`
  width: 100%;
  max-width: 1440px;

  /* typography */
  font-family: 'Geist', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 140%;
  text-align: center;
  color: #fff;

  /* preserve manual line breaks from the DB */
  white-space: pre-line;

  /* multi-line clamp */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;          /* show ≤ 5 lines */
`;


export const QuoteSource = styled.div`
  width: 100%;
  max-width: 1440px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  font-size: 16px;
  line-height: 161.8%;
  text-align: center;
  color: #808080;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

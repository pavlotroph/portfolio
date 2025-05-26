import styled, { css } from 'styled-components'; 

/* ────────────────────────────────────────────── */
/* ОБЩАЯ ОБЁРТКА                                  */
/* ────────────────────────────────────────────── */
export const CollectionContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  margin-top: 5rem;
  @media (min-width: 1440px) {
    max-width: 100%;
  }
`;
export const CollectionAdditionalWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0px 18px;
  gap: 40px;

  @media (min-width: 744px) {
    padding: 0px 24px;
  }
`;

/* ────────────────────────────────────────────── */
/* VIMEO                                          */
/* ────────────────────────────────────────────── */
export const PlayerVimeo = styled.div`
  width: 100%;
  margin: 0 auto;
  background: #000;
  position: relative;
`;

export const VimeoVideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.125%;
  overflow: hidden;
  background: #000;

  iframe {
    background: #000;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    transform: translateY(-25%);
  }

  video {
    object-fit: cover;
  }
`;

export const VideoCaption = styled.div`
  color: #fff;
  text-align: center;
  padding: 20px 5%;
  width: 90%;
  margin: 0 auto;
  max-width: 1200px;
  line-height: 1.5;

  h3 {
    font-size: 1.5rem;
    margin-top: 12px;
  }
`;

export const VimeoContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background: #000;

  iframe {
    background: #000;
    position: absolute;
    top: -10%;
    left: 0;
    width: 100vw;
    height: 50vh;
    background-size: cover;
  }
`;

/* ────────────────────────────────────────────── */
/* ЗАГОЛОВОК + ФИЛЬТР                             */
/* ────────────────────────────────────────────── */
export const WorkTitelContainer = styled.div`
  margin: 30px auto 50px;
`;

export const WorkTitel = styled.h1`
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 28px;
  line-height: 162%;
  color: #fff;
  text-align: center;

  @media (min-width: 744px) {
    font-size: 48px;
  }
`;

export const WorkFilterWrapp = styled.div`
  margin: 0 auto;
  display: flex;
  gap: 25px;
  justify-content: center;
`;

export const activeStyles = css`
   color: rgb(255, 247, 247);
   pointer-events: none;
   cursor: default;
 `;

export const WorkTextFilter = styled.a`
  font-family: var(--second-family);
  font-weight: 400;
  font-size: 13px;
  line-height: 162%;
  color: #808080;
  transition: all 0.3s ease-in-out;

  &.active {
    ${activeStyles};
  }

  @media (min-width: 744px) {
    font-size: 16px;
  }
`;

/* ────────────────────────────────────────────── */
/* МЕТАДАННЫЕ КОЛЛЕКЦИИ                           */
/* ────────────────────────────────────────────── */
export const COLLECTION_1SEC_TITLE = styled.h4`
  padding-bottom: 20px;

  @media (min-width: 1440px) {
    padding-bottom: 30px;
  }
`;

export const COLLECTION_1SEC_DESCRIPTION = styled.h2`
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 162%;
  color: #fff;

  @media (min-width: 1440px) {
    font-size: 16px;
  }
`;

export const CollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: auto;
  padding-bottom: 32px;

  @media (min-width: 744px) {
    width: 50%;
  }

  @media (min-width: 1440px) {
    width: 300px;
  }
`;

export const COLLECTION_4SEC_TITLE = styled.h4`
  color: #808080;
  
  @media (min-width: 1440px) {
    padding-bottom: 30px;
  }
`;

export const COLLECTION_4SEC_DESCRIPTION = styled.h1`
  padding-bottom: 8px;
  color: white;
  transition: color 0.3s ease;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #00bfff; /* голубой */
    }
  }
`;

export const CollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 0px 40px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 744px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    padding: 50px 0px;
    align-items: flex-start;
  }
`;

export const CollectionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 32px 18px;
  padding-bottom: 10px;

  @media (min-width: 744px) {
    margin: 32px 24px;
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    margin: 80px auto;
    padding-bottom: 20px;
  }
`;

/* ────────────────────────────────────────────── */
/* ГАЛЕРЕИ                                        */
/* ────────────────────────────────────────────── */

type IMAGE_PROPS = {
  $itemsCount?: number;
  $aspectRatio?: string;
};


export const SliderWrapper = styled.div<IMAGE_PROPS>`
  position: relative;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '16 / 9'};
  overflow: hidden;
  display: flex;
  align-items: center;

  touch-action: pan-y
`;


export const SliderContent = styled.div<{
  index: number;
  animate: boolean;
  offset: number;
  isDragging: boolean;           /* ← новое */
}>`
  display: flex;
  transition: ${({ animate, isDragging }) =>
    !animate || isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0, 0.2, 1)'};
  transform: ${({ index, offset }) =>
    `translateX(calc(-${index * 100}% + ${offset}px))`};
`;

export const Slide = styled.div`
  min-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;


export const Arrow = styled.button<{ left?: boolean }>`
  position: absolute;
  top: 50%;
  ${({ left }) => (left ? 'left: 0px' : 'right: 0px')};
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  width: 64px;
  height: 64px;
  justify-content: center;
  opacity: 0.66;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  @media (min-width: 1080px) {
    width: 96px;
    height: 96px;
  }
    
  img {
    width: 12px;
    height: auto;
    pointer-events: none;

    @media (min-width: 1080px) {
    width: 16px;
    }
  }
`;

const IMAGE_BASEGRID = styled.div<IMAGE_PROPS>`
  display: grid;
  width: 100%;
  gap: 3px;
  margin-bottom: 3rem;

  img {
    width: 100%;
    aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '16 / 9'};
    object-fit: cover;
    cursor: pointer;
    display: block;
  }

  @media (max-width: 743px) {
    grid-template-columns: 1fr;
  }
`;

export const IMAGE_DOUBLE = styled(IMAGE_BASEGRID).attrs({ as: 'div' })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(2, 1fr)'
        : $itemsCount >= 2
        ? 'repeat(2, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(2, 1fr)'
        : $itemsCount >= 2
        ? 'repeat(2, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
`;

export const IMAGE_TRIPLE = styled(IMAGE_BASEGRID).attrs({ as: 'div' })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(3, 1fr)'
        : $itemsCount >= 3
        ? 'repeat(3, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(3, 1fr)'
        : $itemsCount >= 3
        ? 'repeat(3, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
`;

export const IMAGE_QUADRUPLE = styled(IMAGE_BASEGRID).attrs({ as: 'div' })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(4, 1fr)'
        : $itemsCount >= 4
        ? 'repeat(4, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(4, 1fr)'
        : $itemsCount >= 4
        ? 'repeat(4, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
`;

export const IMAGE_QUINTUPLE = styled(IMAGE_BASEGRID).attrs({ as: 'div' })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(5, 1fr)'
        : $itemsCount >= 5
        ? 'repeat(5, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) =>
      !$itemsCount
        ? 'repeat(5, 1fr)'
        : $itemsCount >= 5
        ? 'repeat(5, 1fr)'
        : `repeat(${$itemsCount}, 1fr)`};
  }
`;

export const CollectionImageWrapper = styled.div`
  display: grid;
  width: 100%;
  margin: 32px 0;
  gap: 6px;              

  .image-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 2;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }
  }

  @media (max-width: 743px) {
    grid-template-columns: 1fr;
  }
  @media (min-width: 744px) and (max-width: 1439px) {
    grid-template-columns: repeat(2, 1fr);
    .image-container:last-child:nth-child(odd) {
      grid-column: span 2;
      max-width: 50%;
      justify-self: center;
    }
  }
  @media (min-width: 1440px) {
    grid-template-columns: repeat(3, 1fr);
    .image-container:nth-last-child(2),
    .image-container:last-child {
      grid-column: span 1;
      width: 150%;
      margin-right: -100%;
    }
    .image-container:nth-last-child(2) {
      justify-self: start;
    }
    .image-container:last-child {
      justify-self: end;
    }
    .image-container:last-child:nth-child(3n + 1) {
      grid-column: span 3;
      max-width: 33.33%;
      margin: 0;
    }
  }
`;

/* ────────────────────────────────────────────── */
/* КАРТИНКА + ТЕКСТ                               */
/* ────────────────────────────────────────────── */
export const CollectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2rem 0;

  @media (min-width: 744px) {
    flex-direction: row;
    align-items: center;
    .image-container {
      max-width: 744px;
    }
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    margin: 0 auto;
  }
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  aspect-ratio: 1;
  h1 {
      font-size: 32px;
  }

  @media (min-width: 744px) {
    width: 50%;
    text-align: center;
    align-items: center;
    margin: 0 auto;
    padding: 80px;

    h1 {
      font-size: 32px;
    }
  }
`;


export const ImageBlock = styled.div`
  width: 100%;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    cursor: pointer;
  }

  @media (min-width: 744px) {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }
`;

/* ────────────────────────────────────────────── */
/* GLOBALS                                        */
/* ────────────────────────────────────────────── */

export const CUSTOM_SPLITTER = styled.div`
  /* внешний контейнер */
  width: 100%;
  display: flex;
  justify-content: center;   /* центрируем линию */
  padding: 9px 18px;
  background: #000;

  @media (min-width: 744px) {
    padding: 0px 24px;
  }

  /* сама линия */
  &::after {
    content: '';
    width: 100%;
    max-width: 1440px;
    height: 1px;
    background: #d9d9d9;
  }
`;
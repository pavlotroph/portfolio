import styled, { css } from 'styled-components';

type Align = 'left' | 'center' | 'right';

/* ────────────────────────────────────────────── */
/* ОБЩАЯ ОБЁРТКА                                  */
/* ────────────────────────────────────────────── */
export const WRAPPER_GLOBAL = styled.div<{ $isPhoto?: boolean }>`
  width: 100%;
  margin: 0 auto;
  margin-bottom: 0px;
  position: relative;
  @media (min-width: 1440px) {
    max-width: 100%;
  }
`;

// Back-compat export (old name)
export const CollectionContainer = WRAPPER_GLOBAL;

/* ────────────────────────────────────────────── */
/* NEW WRAPPERS (CONTENT system)                  */
/* ────────────────────────────────────────────── */

export const WRAPPER_COMPONENT = styled.div<{ $padding?: string }>`
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${({ $padding }) => $padding ?? '0px'};

  position: relative;
  width: 100%;
  height: fit-content;

  background: #000000;
`;

export const WRAPPER_BLOCKS = styled.div`
  /* WRAPPER_BLOCKS */

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  justify-content: center;
  align-items: start;
  align-content: center;

  padding: 0px;
  row-gap: 0px;
  column-gap: 0px;

  width: 100%;
  max-width: 1440px;
  height: fit-content;

  background: #000000;

  /* Special rule:
     If there are exactly 4 blocks, we want 4-per-row when there's room,
     otherwise jump to 2-per-row (avoid 3+1). */
  &[data-count="4"] {
    grid-template-columns: repeat(4, minmax(240px, 1fr));
  }

  @media (max-width: 960px) {
    &[data-count="4"] {
      grid-template-columns: repeat(2, minmax(240px, 1fr));
    }
  }

  @media (max-width: 520px) {
    &[data-count="4"] {
      grid-template-columns: repeat(1, minmax(240px, 1fr));
    }
  }

  /*
  Special mobile behavior for a 2-block CONTENT combo (text + media):
  - Desktop: preserve JSON order (checkerboard pattern across components)
  - Phones: always show Media first, then Text
*/
&[data-pair="yes"][data-count="2"] {
  display: flex;
  flex-wrap: wrap;

  > * {
    flex: 1 1 50%;
    min-width: 240px;
  }

  @media (max-width: 744px) {
    flex-direction: column;

    > * {
      flex: 1 1 auto;
      min-width: 0;
    }

    /* Force Media above Text on narrow screens */
    > [data-kind="media"] {
      order: 1;
    }
    > [data-kind="text"] {
      order: 2;
    }
  }
}
`;

export const ContentBlockWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
  margin-bottom: 15px;

  @media (min-width: 744px) {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  @media (min-width: 1440px) {
    margin-top: 40px;
    margin-bottom: 40px;
  }
`;


export const CollectionAdditionalWrapper = styled.div<{ $isPhoto?: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0px 14px;
  gap: 40px;

  @media (min-width: 744px) {
    padding: 0px 14px;
  }
`;

/* ────────────────────────────────────────────── */
/* YouTube                                       */
/* ────────────────────────────────────────────── */

export const YouTubePlayerWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 744px) {
  }

  @media (min-width: 1440px) {
  }
`;

export const YouTubeIframeContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
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
  gap: 0px;
  justify-content: center;
  
  @media (min-width: 744px) {
    gap: 0px;
  }
`;

export const activeStyles = css`
  color: rgb(255, 247, 247);
  pointer-events: none;
  cursor: default;
`;

export const WorkTextFilter = styled.button`
  font-family: var(--second-family);
  font-weight: 400;
  font-size: 13px;
  line-height: 162%;
  color: #808080;
  text-decoration: none;
  background: transparent;
  border: none;
  padding: 10px 4px;
  transition: all 0.3s ease-in-out;
  white-space: nowrap;

  &.active {
    ${activeStyles};
  }

  @media (min-width: 744px) {
    font-size: 16px;
    padding: 10px 6px;
  }

  @media (min-width: 1440px) {
    padding: 10px 8px;
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

export const COLLECTION_1SEC_DESCRIPTION = styled.div`
  font-family: var(--font-family);
  line-height: 162%;
  color: #fff;

  /* Only normal text uses this size */
  :where(p, span, strong, em, a) {
    font-size: 14px;

    @media (min-width: 1440px) {
      font-size: 16px;
    }
  }

  /* Don’t override headings here — GlobalStyle owns them */

  /* Make everything behave like inline segments (so you can build sentences) */
  :where(h1, h2, h3, h4, h5, h6, p, span, strong, em) {
    display: inline;
  }

  a {
    text-decoration: underline;
  }
`;

export const TEXT_MBLOCK_WRAPPER = styled.div<{ $isPhoto?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: auto;
  padding-bottom: ${props => props.$isPhoto ? '16px' : '32px'};

  @media (min-width: 744px) {
    width: 50%;
  }

  @media (min-width: 1440px) {
    width: 300px;
  }
`;

export const TEXT_MBLOCK_WRAPPER_LIGHT = styled.div<{ $isPhoto?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: auto;
  padding-bottom: ${props => props.$isPhoto ? '16px' : '32px'};

  @media (min-width: 744px) {
    width: 50%;
  }
`;

export const COLLECTION_4SEC_TITLE = styled.h4`
  color: #808080;

  @media (min-width: 1440px) {
    padding-bottom: 30px;
  }
`;

export const COLLECTION_TEXT_TITLE_WRAPPER = styled.div<{ align?: Align }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ align }) =>
    align === 'left'
      ? 'flex-start'
      : align === 'right'
      ? 'flex-end'
      : 'center'};
  align-items: center;
  padding: 20px 0;
  gap: 10px;

  position: relative;
  width: 100%;
  max-width: 1440px;
  height: 100px;

  background: #000;
  margin: 0 auto;
`;

export const COLLECTION_TEXT_TITLE = styled.h2<{
  fontSize?: string;
  align?: Align;
}>`
  margin: 0;
  flex: none;
  order: 0;
  flex-grow: 0;

  width: auto;
  height: auto;

  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '32px')};
  line-height: 1;
  text-align: ${({ align }) => align || 'left'};
  color: #fff;
`;

export const COLLECTION_4SEC_DESCRIPTION = styled.div`
  padding-bottom: 8px;
`;

export const CollectionHeader = styled.div<{ $isPhoto?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${props => props.$isPhoto ? '20px' : '0px'} 0px ${props => props.$isPhoto ? '20px' : '0px'};
  width: 100%;
  margin: 0 auto;

  @media (min-width: 744px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    padding: ${props => props.$isPhoto ? '30px' : '0px'} 0px;
    align-items: flex-start;
  }
`;

export const CollectionHeader2Sec = styled(CollectionHeader)`
  /* only change behavior on desktop wide layout */
  @media (min-width: 1440px) {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
`;


export const CollectionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;

  @media (min-width: 744px) {
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
  }
`;

/* ────────────────────────────────────────────── */
/* ГАЛЕРЕИ                                        */
/* ────────────────────────────────────────────── */

type IMAGE_PROPS = {
  $itemsCount?: number;
  $aspectRatio?: string;
};

// helper to make elements full-bleed across the viewport
// use left:50% + translateX(-50%) so it cannot be overridden by margin:auto
const fullBleed = css`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
`;

export const SliderWrapper = styled.div<IMAGE_PROPS>`
  position: relative;
  ${fullBleed};
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '16 / 9'};
  overflow: hidden;
  display: flex;

  touch-action: pan-y;
`;

export const SliderContent = styled.div<{
  $index: number;
  $animate: boolean;
  $offset: number;
  $isDragging: boolean /* transient prop */;
}>`
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 0 0 100%;
  transition: ${({ $animate, $isDragging }) =>
    !$animate || $isDragging
      ? 'none'
      : 'transform 0.25s cubic-bezier(0.25, 0, 0.2, 1)'};
  transform: ${({ $index, $offset }) =>
    `translateX(calc(-${$index * 100}% + ${$offset}px))`};
`;

export const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    height: 100%;
    object-fit: cover;
  }
`;

export const Arrow = styled.button<{ $left?: boolean }>`
  position: absolute;
  top: 50%;
  ${({ $left }) => ($left ? 'left: 0px' : 'right: 0px')};
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  width: 64px;
  height: 256px;
  justify-content: center;
  opacity: 0.66;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  @media (min-width: 1080px) {
    width: 96px;
    height: 384px;
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

export const ImageGalleryRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  @media (min-width: 744px) {
    gap: 1px;
  }
`;

export const ImageGalleryRow = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => Math.max(1, $cols)}, 1fr);
  gap: 1px;

  @media (min-width: 744px) {
    gap: 1px;
  }
`;


const IMAGE_BASEGRID = styled.div<IMAGE_PROPS>`
  display: grid;
  ${fullBleed};
  gap: 1px;

  img {
    width: 100%;
    aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '16 / 9'};
    object-fit: cover;
    cursor: pointer;
    display: block;
  }

  @media (min-width: 744px) {
    gap: 2px;
  }

  @media (min-width: 1440px) {
  }
`;

export const IMAGE_GALLERY = styled(IMAGE_BASEGRID)<{
  $itemsCount?: number;
}>`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) => {
      const count = Math.max(1, Math.min($itemsCount || 1, 5)); // clamp 1–5
      return `repeat(${count}, 1fr)`;
    }};
  }

  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) => {
      const count = Math.max(1, Math.min($itemsCount || 1, 5));
      return `repeat(${count}, 1fr)`;
    }};
  }
`;


/* ────────────────────────────────────────────── */
/* КАРТИНКА + ТЕКСТ                               */
/* ────────────────────────────────────────────── */
export const CollectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  .square-media { order: 1; }
  .square-text  { order: 2; }

  @media (min-width: 744px) {
    flex-direction: row;
    align-items: center;
     .square-media, .square-text { order: initial; }
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
  width: 100%;
  aspect-ratio: 1 / 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 1rem;
  text-align: center;

  /* ✅ this is the key: content can't make the square taller */
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0; /* important for line clamp in flex layouts */

  h1 {
    font-size: 32px;

    /* ✅ keep long titles from breaking the square */
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;

    /* pick how many lines you allow */
    -webkit-line-clamp: 6;

    /* handle long words/URLs */
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  @media (min-width: 744px) {
    width: 50%;
    padding: 80px;

    /* on desktop you may allow a bit more lines */
    h1 {
      -webkit-line-clamp: 8;
    }
  }
`;

export const ImageBlock = styled.div`
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 14px; 

  background: #000;

  @media (min-width: 744px) {
    padding: 40px 14px; 
  }

   @media (min-width: 1440px) {
    padding: 60px 14px; 
  }

  &::after {
    content: '';
    width: 100%;
    max-width: 1412px;
    height: 1px;
    background: #d9d9d9;
  }
`;

export const TopSplitter = styled(CUSTOM_SPLITTER)`
  position: fixed;
  top: 78px;
  left: 0;
  right: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  z-index: 98;
  background: #000;
  
  @media (min-width: 744px) {
    top: 78px;
  }
`;

/* ────────────────────────────────────────────── */
/* CONTENT (new universal system)                 */
/* ────────────────────────────────────────────── */

export const CONTENT_TEXT_BLOCK = styled.div<{ $padding: string; $aspectRatio?: string | null }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  justify-content: center;

  width: 100%;
  min-width: 240px;

  ${({ $aspectRatio }) =>
    $aspectRatio
      ? css`
          aspect-ratio: ${$aspectRatio};
          height: auto;
          overflow: hidden;
        `
      : css`
          height: fit-content;
        `}

  padding: ${({ $padding }) => $padding};
`;

const contentAlignCss = ($align: any) => {
  const a = typeof $align === 'string' ? $align : 'left';
  if (a === 'right') return css`align-self: flex-end; text-align: right;`;
  if (a === 'center') return css`align-self: center; text-align: center;`;
  return css`align-self: flex-start; text-align: left;`;
};

export const CONTENT_TEXT_HEADING = styled.h4<{ $align: 'left' | 'center' | 'right' }>`
  width: 100%;
  height: fit-content;
  margin: 0;

  color: #808080;

  ${({ $align }) => contentAlignCss($align)}

  /* Inside auto layout */
  flex: none;
flex-grow: 0;
`;

export const CONTENT_TEXT_BODY = styled.h3<{ $align: 'left' | 'center' | 'right' }>`
  width: 100%;
  height: fit-content;
  margin: 0;

  max-height: 420px;
  overflow: hidden;

  ${({ $align }) => contentAlignCss($align)}

  /* Inside auto layout */
  flex: none;
flex-grow: 0;
`;

export const CONTENT_LINK = styled.a`
  width: 100%;
  display: block;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 6px;

  &:hover {
    opacity: 0.75;
  }
`;

export const CONTENT_INLINE_LINK = styled.a`
  display: inline;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 6px;

  &:hover {
    opacity: 0.75;
  }
`;


export const CONTENT_MEDIA_BLOCK = styled.div<{ $padding: string; $aspectRatio: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-width: 240px;
  height: auto;

  padding: ${({ $padding }) => $padding};

  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};

  flex: 1 1 0;

  position: relative;
  overflow: hidden;


  &[data-modal='yes'] {
    cursor: pointer;
  }

  &[data-modal='yes']:hover {
    opacity: 0.96;
  }
`;

export const CONTENT_MEDIA_INNER = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const CONTENT_EMPTY_BLOCK = styled.div<{ $padding: string }>`
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 240px;

  padding: ${({ $padding }) => $padding};

  flex: 1 1 0;

  align-self: stretch;
  min-height: 1px;
`;

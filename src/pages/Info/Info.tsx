import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import QuoteBlock from '../../components/Quote/QuoteBlock';
import {
  CollectionContainer,
  CollectionAdditionalWrapper,
  CollectionHeader,
  CollectionTextWrapper,
  ContentBlockWrapper,
  CUSTOM_SPLITTER,

  // CONTENT system
  WRAPPER_COMPONENT,
  WRAPPER_BLOCKS,
  CONTENT_TEXT_BLOCK,
  CONTENT_TEXT_HEADING,
  CONTENT_TEXT_BODY,
  CONTENT_LINK,
  CONTENT_INLINE_LINK,
} from '../../components/CollectionComponent/CollectionComponent.styled';
import { Quote } from '../Work/Work';
import { supabase } from '../../supabaseClient';

/* ────────── CONTENT helpers (mirrors CollectionComponent.tsx) ────────── */
const aspectLockToCss = (raw: any): string | null => {
  if (typeof raw !== 'string') return null;

  const v = raw.trim().toLowerCase();
  if (!v || v === 'no' || v === 'none' || v === 'off' || v === '0') return null;

  const compact = v.replace(/\s+/g, '');

  const parsePair = (a: string, b: string) => {
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isFinite(an) || !Number.isFinite(bn)) return null;
    if (an <= 0 || bn <= 0) return null;
    return `${an} / ${bn}`;
  };

  if (compact.includes(':')) {
    const [a, b] = compact.split(':');
    return a && b ? parsePair(a, b) : null;
  }

  if (compact.includes('/')) {
    const [a, b] = compact.split('/');
    return a && b ? parsePair(a, b) : null;
  }

  if (raw.includes('/')) return raw.trim();

  return null;
};

const normalizeAlign = (a: any): 'left' | 'center' | 'right' => {
  const s = typeof a === 'string' ? a.toLowerCase().trim() : 'left';
  if (s.startsWith('right')) return 'right';
  if (s.startsWith('center')) return 'center';
  return 'left';
};

const paddingToCss = (pad: any, fallback: string): string => {
  const raw = typeof pad === 'string' ? pad : fallback;
  const nums = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x));

  const safe = (n: any) => (Number.isFinite(n) ? Math.max(0, Math.min(128, n)) : 0);

  let t = 0, r = 0, b = 0, l = 0;
  if (nums.length === 1) {
    t = r = b = l = safe(nums[0]);
  } else if (nums.length === 2) {
    t = b = safe(nums[0]);
    r = l = safe(nums[1]);
  } else if (nums.length >= 4) {
    t = safe(nums[0]);
    r = safe(nums[1]);
    b = safe(nums[2]);
    l = safe(nums[3]);
  } else {
    return paddingToCss(fallback, fallback);
  }

  return `${t}px ${r}px ${b}px ${l}px`;
};

const renderMultiline = (text: any) => {
  const s = typeof text === 'string' ? text : '';
  const lines = s.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

type ContentJson = {
  items: any[];
  componentPadding?: string;
};

const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
  if (typeof tag !== 'string') return false;
  const t = tag.toLowerCase().trim();
  return /^[a-z][a-z0-9]*$/.test(t) && !t.includes(':') && !t.includes('/');
};

const isInlineFlag = (v: any) => v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';

const StaticCONTENT: React.FC<{ content: ContentJson }> = ({ content }) => {
  const contentItems = Array.isArray(content?.items) ? content.items : [];
  const componentPaddingCss = paddingToCss(content?.componentPadding, '0,0,0,0');

  const renderTextItem = useCallback((t: any, key: string, forceInline: boolean) => {
    const obj = typeof t?.object === 'string' ? t.object.toLowerCase().trim() : 'body';
    const isHeading = obj === 'heading';

    const tagRaw = typeof t?.style === 'string' ? t.style.toLowerCase().trim() : '';
    const fallbackTag = isHeading ? 'h4' : 'h3';
    const tag = (isValidTag(tagRaw) ? tagRaw : fallbackTag) as any;

    const align = normalizeAlign(t?.alignment);
    const size = Number(t?.size ?? 0);
    const sizeStyle = Number.isFinite(size) && size > 0 ? { fontSize: Math.min(128, size) } : undefined;

    const href =
      typeof t?.link === 'string' && t.link.trim() !== '' && t.link !== 'none'
        ? t.link.trim()
        : null;

    const Line = isHeading ? CONTENT_TEXT_HEADING : CONTENT_TEXT_BODY;

    // Inline mode: remove 100% width / max-height clamp so it can behave like sentence parts.
    const inlineStyle = forceInline
      ? {
          display: 'inline',
          width: 'auto',
          maxHeight: 'none',
          overflow: 'visible',
          ...sizeStyle,
        }
      : sizeStyle;

    const lineNode = (
      <Line as={tag} $align={align} style={inlineStyle}>
        {renderMultiline(t?.text)}
      </Line>
    );

    if (!href) return <React.Fragment key={key}>{lineNode}</React.Fragment>;

    // For inline segments we must use inline anchor (so it doesn't break the sentence).
    const LinkTag = forceInline ? CONTENT_INLINE_LINK : CONTENT_LINK;

    return (
      <LinkTag
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={typeof t?.text === 'string' ? t.text : 'Open link'}
      >
        {lineNode}
      </LinkTag>
    );
  }, []);

  return (
    <WRAPPER_COMPONENT $padding={componentPaddingCss}>
      <WRAPPER_BLOCKS data-count={contentItems.length}>
        {contentItems.map((it: any, idx: number) => {
          const blockKind = typeof it?.block === 'string' ? it.block.toLowerCase().trim() : 'empty';

          const paddingCss =
            blockKind === 'text'
              ? paddingToCss(it?.padding, '24,24,24,24')
              : paddingToCss(it?.padding, '0,0,0,0');

          if (blockKind !== 'text') return <div key={`content-empty-${idx}`} />;

          const blockItems = Array.isArray(it?.block_items) ? it.block_items : [];
          const aspectRatioLock = aspectLockToCss(it?.['aspect-ratio'] ?? it?.aspectRatio ?? it?.aspect_ratio);

          // Group inline items so CONTENT_TEXT_BLOCK "gap: 20px" doesn't create gaps between sentence parts.
          const nodes: React.ReactNode[] = [];
          let inlineGroup: any[] = [];

          const flushInline = () => {
            if (!inlineGroup.length) return;
            nodes.push(
              <div key={`inline-wrap-${idx}-${nodes.length}`} style={{ width: '100%' }}>
                {inlineGroup.map((t, j) => renderTextItem(t, `inline-${idx}-${j}`, true))}
              </div>
            );
            inlineGroup = [];
          };

          blockItems.forEach((t: any, j: number) => {
            const wantInline = isInlineFlag(t?.inline);

            if (wantInline) {
              inlineGroup.push(t);
              return;
            }

            flushInline();
            nodes.push(renderTextItem(t, `block-${idx}-${j}`, false));
          });

          flushInline();

          return (
            <CONTENT_TEXT_BLOCK key={`content-text-${idx}`} $padding={paddingCss} $aspectRatio={aspectRatioLock}>
              {nodes}
            </CONTENT_TEXT_BLOCK>
          );
        })}
      </WRAPPER_BLOCKS>
    </WRAPPER_COMPONENT>
  );
};

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
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);

  // ────────── HEADER (4 blocks) ──────────
  const headerContent: ContentJson = {
    componentPadding: '0,0,0,0',
    items: [
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Artist Name', style: 'h6', object: 'heading', alignment: 'left' },
          { link: 'none', size: 0, text: 'Pavlo Troph', style: 'h2', object: 'body', alignment: 'left' },
        ],
      },
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Specialization', style: 'h6', object: 'heading', alignment: 'left' },
          { link: 'none', size: 0, text: 'Graphic Design\nCGI\nPhotography\nCinematography\nArt Direction', style: 'h3', object: 'body', alignment: 'left' },
        ],
      },
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Location', style: 'h6', object: 'heading', alignment: 'left' },
          { link: 'https://www.google.com/maps/search/?api=1&query=Toronto,+ON,+CA', size: 0, text: 'Toronto, ON, CA', style: 'h3', object: 'body', alignment: 'left' },
        ],
      },
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Contact', style: 'h6', object: 'heading', alignment: 'left' },
          { link: 'mailto:info@pavlotroph.com', size: 0, text: 'info@pavlotroph.com', style: 'h3', object: 'body', alignment: 'left' },
        ],
      },
    ],
  };

  // ────────── DESCRIPTION (inline sentence segments) ──────────
  const descriptionContent: ContentJson = {
    componentPadding: '0,0,0,0',
    items: [
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Description', style: 'h6', object: 'heading', alignment: 'left' },

          // Inline flow (sentence)
          { link: 'https://www.instagram.com/pavlotroph/', size: 0, text: 'Pavlo Troph', style: 'h2', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'none', size: 0, text: ' is a multidisciplinary artist dedicated to creating impactful and emotionally resonant experiences. By skillfully blending visuals, sound, and storytelling, he transforms ideas into memorable and engaging products. ', style: 'span', object: 'body', alignment: 'left', inline: 'yes' },
        ],
      },
    ],
  };

  // ────────── COMPANIES (separate CONTENT so it won’t share a row) ──────────
  const companiesContent: ContentJson = {
    componentPadding: '0,0,0,0',
    items: [
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: 'Companies', style: 'h6', object: 'heading', alignment: 'left' },

          { link: 'https://fivemods.io/', size: 0, text: 'FiveMods\n', style: 'h1', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'https://ntw.graphics/', size: 0, text: 'Network Graphics\n', style: 'h1', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'https://metarp.net/en', size: 0, text: 'Meta Role Play', style: 'h1', object: 'body', alignment: 'left', inline: 'yes' },
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Info / CV</title>
        <meta property="og:title" content="Info / CV" />
        <meta
          name="description"
          content="Info & CV — tools, skills, and experience of Pavlo Troph . Available for collaborations and studio roles."
        />
        <meta
          property="og:description"
          content="Info & CV — tools, skills, and experience of Pavlo Troph . Available for collaborations and studio roles."
        />
        <meta property="og:url" content="https://pavlotroph.com/info" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Info / CV | Pavlo Troph Portfolio" />
        <meta
          name="twitter:description"
          content="Info & CV — tools, skills, and experience of Pavlo Troph. Available for collaborations and studio roles."
        />
      </Helmet>

      <CollectionContainer style={{ marginTop: '10px' }}>
        <ContentBlockWrapper>
          <CollectionAdditionalWrapper>
            <CollectionHeader>
              <StaticCONTENT content={headerContent} />
            </CollectionHeader>

            <CollectionTextWrapper>
              <StaticCONTENT content={descriptionContent} />
              <StaticCONTENT content={companiesContent} />
            </CollectionTextWrapper>
          </CollectionAdditionalWrapper>
        </ContentBlockWrapper>

        <CUSTOM_SPLITTER />

        {currentQuote && <QuoteBlock quote={currentQuote} />}
      </CollectionContainer>
    </>
  );
};

export default Info;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import ContactForm from '../../components/ContactForm/ContactForm';
import {
  ContactContainer,
} from './Contact.styled';

import {
  WRAPPER_GLOBAL,
  WRAPPER_COMPONENT,
  WRAPPER_BLOCKS,
  CONTENT_TEXT_BLOCK,
  CONTENT_TEXT_HEADING,
  CONTENT_TEXT_BODY,
  CONTENT_LINK,
  CONTENT_INLINE_LINK,
} from '../../components/CollectionComponent/CollectionComponent.styled';

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

const isInlineFlag = (v: any) => v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';

const StaticCONTENT: React.FC<{ content: ContentJson }> = ({ content }) => {
  const contentItems = Array.isArray(content?.items) ? content.items : [];
  const componentPaddingCss = paddingToCss(content?.componentPadding, '0,0,0,0');

  const renderTextLine = (t: any, key: string, forceInline: boolean) => {
    const obj = typeof t?.object === 'string' ? t.object.toLowerCase().trim() : 'body';
    const isHeading = obj === 'heading';

    const tagRaw = typeof t?.style === 'string' ? t.style.toLowerCase().trim() : '';
    const fallbackTag = isHeading ? 'h4' : 'h3';
    const tag = (['h1','h2','h3','h4','h5','h6','p','span','strong','em'].includes(tagRaw) ? tagRaw : fallbackTag) as any;

    const align = normalizeAlign(t?.alignment);

    const href =
      typeof t?.link === 'string' && t.link.trim() !== '' && t.link !== 'none'
        ? t.link.trim()
        : null;

    const Line = isHeading ? CONTENT_TEXT_HEADING : CONTENT_TEXT_BODY;

    const lineNode = (
      <Line
        as={tag}
        $align={align}
        style={forceInline ? { display: 'inline', width: 'auto', maxHeight: 'none', overflow: 'visible' } : undefined}
      >
        {renderMultiline(t?.text)}
      </Line>
    );

    if (!href) return <React.Fragment key={key}>{lineNode}</React.Fragment>;

    const isHttp = /^https?:\/\//i.test(href);
    const LinkTag = forceInline ? CONTENT_INLINE_LINK : CONTENT_LINK;

    return (
      <LinkTag
        key={key}
        href={href}
        target={isHttp ? '_blank' : undefined}
        rel={isHttp ? 'noopener noreferrer' : undefined}
        aria-label={typeof t?.text === 'string' ? t.text : 'Open link'}
      >
        {lineNode}
      </LinkTag>
    );
  };

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

          // Inline grouping so sentence parts don’t get spaced out by block gap.
          const nodes: React.ReactNode[] = [];
          let inlineGroup: any[] = [];

          const flushInline = () => {
            if (!inlineGroup.length) return;
            nodes.push(
              <div key={`inline-wrap-${idx}-${nodes.length}`} style={{ width: '100%' }}>
                {inlineGroup.map((t, j) => renderTextLine(t, `inline-${idx}-${j}`, true))}
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
            nodes.push(renderTextLine(t, `block-${idx}-${j}`, false));
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

const Contact: React.FC = () => {
  // One CONTENT with 2 items → keeps the same “two blocks” layout idea:
  // left: Contact links, right: Location
  const contactInfoContent: ContentJson = {
    componentPadding: '0,0,40,0',
    items: [
      {
        block: 'text',
        padding: '14, 14, 14, 14',
        block_items: [
          { link: 'none', size: 0, text: 'Contact', style: 'h6', object: 'heading', alignment: 'left' },

          { link: 'mailto:info@pavlotroph.com', size: 0, text: 'info@pavlotroph.com\n', style: 'h3', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'https://www.linkedin.com/in/pavlo-trofimenko/', size: 0, text: 'LinkedIn\n', style: 'h3', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'https://t.me/pavlotroph', size: 0, text: 'Telegram\n', style: 'h3', object: 'body', alignment: 'left', inline: 'yes' },
          { link: 'https://www.instagram.com/', size: 0, text: 'Instagram', style: 'h3', object: 'body', alignment: 'left', inline: 'yes'},
        ],
      },
      {
        block: 'text',
        padding: '14, 14, 14, 14',
        block_items: [
          { link: 'none', size: 0, text: 'Location', style: 'h6', object: 'heading', alignment: 'left' },
          { link: 'https://maps.app.goo.gl/b7UCDY41c7FuzzFC6', size: 0, text: 'Toronto, ON, CA', style: 'h3', object: 'body', alignment: 'left' },
        ],
      },
    ],
  };

  const contactInfoTitle: ContentJson = {
    componentPadding: '0,0,0,0',
    items: [
      {
        block: 'text',
        padding: '12, 12, 12, 12',
        block_items: [
          { link: 'none', size: 0, text: "Let's Talk", style: 'h1', object: 'body', alignment: 'left' },
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Contact</title>
        <meta name="description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
        <meta property="og:title" content="Contact" />
        <meta property="og:description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
        <meta property="og:url" content="https://pavlotroph.com/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact | Pavlo Troph Portfolio" />
        <meta name="twitter:description" content="Contact Pavlo Troph — inquiries, collaborations, and freelance/studio opportunities." />
      </Helmet>

      <WRAPPER_GLOBAL>
        <ContactContainer>
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
            Contact
          </h1>
          {/* Replaces old styled link blocks with CONTENT (supports inline links if you ever need them) */}
          <StaticCONTENT content={contactInfoTitle} />
          <StaticCONTENT content={contactInfoContent} />

          <ContactForm />
        </ContactContainer>
      </WRAPPER_GLOBAL>
    </>
  );
};

export default Contact;

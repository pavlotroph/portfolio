import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  CollectionHeader,
  CUSTOM_SPLITTER,
} from '../CollectionComponent/CollectionComponent.styled';
import styled from 'styled-components';

import {
  WRAPPER_COMPONENT,
  WRAPPER_BLOCKS,
  CONTENT_TEXT_BLOCK,
  CONTENT_TEXT_HEADING,
  CONTENT_TEXT_BODY,
  CONTENT_INLINE_LINK,
} from '../CollectionComponent/CollectionComponent.styled';
import {
  getContentLinkProps,
  isInlineFlag,
  renderMultiline,
  renderTextWithInlineLinks,
} from '../CollectionComponent/contentTextUtils';

export const FooterContainer = styled.footer`
  width: 100%;
  background: #000;
  color: #fff;
`;

/* hover-animated link */
export const FooterLink = styled.a`
  text-decoration: none;
  color: inherit;
  transition: color 200ms ease;

  &:hover,
  &:focus {
    color: #2ea3ff;
  }
`;

type FooterSection = {
  id: number;
  position: number;
  label: string;
  text: string;
  tag?: 'h1' | 'h2' | 'h3';
  link?: string | null;
};

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

type ContentJson = {
  items: any[];
  componentPadding?: string;
};

// Footer DB may contain legacy HTML (e.g. <br/>). We normalize to plain text + newlines.
// If you ever need rich formatting (strong/em), move that into structured CONTENT instead of HTML.
const htmlToPlain = (raw: any) => {
  const s = typeof raw === 'string' ? raw : '';
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .trim();
};

const StaticCONTENT: React.FC<{ content: ContentJson }> = ({ content }) => {
  const contentItems = Array.isArray(content?.items) ? content.items : [];
  const componentPaddingCss = paddingToCss(content?.componentPadding, '0,0,0,0');

  const renderTextLine = useCallback((t: any, key: string, forceInline: boolean) => {
    const obj = typeof t?.object === 'string' ? t.object.toLowerCase().trim() : 'body';
    const isHeading = obj === 'heading';

    const tagRaw = typeof t?.style === 'string' ? t.style.toLowerCase().trim() : '';
    const fallbackTag = isHeading ? 'h4' : 'h3';
    const tag = (['h1','h2','h3','h4','h5','h6','p','span','strong','em'].includes(tagRaw) ? tagRaw : fallbackTag) as any;

    const align = normalizeAlign(t?.alignment);

    const linkProps = getContentLinkProps(t?.link);

    const Line = isHeading ? CONTENT_TEXT_HEADING : CONTENT_TEXT_BODY;

    const lineNode = (
      <Line
        as={tag}
        $align={align}
        style={forceInline ? { display: 'inline', width: 'auto', maxHeight: 'none', overflow: 'visible' } : undefined}
      >
        {linkProps ? renderMultiline(t?.text) : renderTextWithInlineLinks(t?.text)}
      </Line>
    );

    if (!linkProps) return <React.Fragment key={key}>{lineNode}</React.Fragment>;

    // Footer wants its own hover treatment:
    const LinkTag: any = forceInline ? CONTENT_INLINE_LINK : FooterLink;

    return (
      <LinkTag
        key={key}
        {...linkProps}
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

const Footer: React.FC = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('footer_sections')
        .select('*')
        .order('position');

      if (error) {
        console.error('[Footer] fetch error:', error.message);
      } else {
        setSections(data as FooterSection[]);
      }
    })();
  }, []);

  const grouped = sections.reduce<Record<string, FooterSection[]>>((acc, sec) => {
    acc[sec.label] = acc[sec.label] ? [...acc[sec.label], sec] : [sec];
    return acc;
  }, {});

  const isLoaded = sections.length > 0;

  const footerContent: ContentJson = {
    componentPadding: '0,0,0,0',
    items: Object.entries(grouped).map(([label, items]) => ({
      block: 'text',
      padding: '20, 14, 20, 14',
      block_items: [
        {
          link: 'none',
          size: 0,
          text: label,
          style: 'h6',
          object: 'heading',
          alignment: 'left',
        },
        ...items.map((sec) => ({
          link: sec.link ? sec.link : 'none',
          size: 0,
          text: htmlToPlain(sec.text) + "\n",
          style: sec.tag ? sec.tag : 'h3',
          object: 'body',
          alignment: 'left',
          inline: 'yes'
        })),
      ],
    })),
  };

  return (
    <FooterContainer role="contentinfo" data-loaded={isLoaded} aria-busy={!isLoaded}>
      <CUSTOM_SPLITTER />
        <CollectionHeader>
          {isLoaded ? <StaticCONTENT content={footerContent} /> : <div style={{ height: 220 }} />}
        </CollectionHeader>
    </FooterContainer>
  );
};

export default Footer;

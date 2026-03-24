import React from 'react';
import { CONTENT_INLINE_LINK } from './CollectionComponent.styled';

const CONTENT_URL_TAG = /\[url=(.+?)\]([\s\S]*?)\[\/url\]/gi;
const ABSOLUTE_LINK_RE = /^(https?:\/\/|mailto:|tel:)/i;
const RELATIVE_LINK_RE = /^(\/(?!\/)|#|\?)/;

export const renderMultiline = (text: any) => {
  const s = typeof text === 'string' ? text : '';
  const lines = s.split('\n');

  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

export const isInlineFlag = (v: any) =>
  v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';

export const getContentLinkProps = (rawHref: any) => {
  const href = typeof rawHref === 'string' ? rawHref.trim() : '';
  if (!href || href.toLowerCase() === 'none') return null;
  if (!ABSOLUTE_LINK_RE.test(href) && !RELATIVE_LINK_RE.test(href)) return null;

  const isExternalHttp = /^https?:\/\//i.test(href);

  return {
    href,
    target: isExternalHttp ? '_blank' : undefined,
    rel: isExternalHttp ? 'noopener noreferrer' : undefined,
  };
};

export const renderTextWithInlineLinks = (input: any) => {
  const text = typeof input === 'string' ? input : '';
  if (!text) return null;

  const renderLine = (line: string, lineKey: string) => {
    const urlTag = new RegExp(CONTENT_URL_TAG);
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = urlTag.exec(line)) !== null) {
      const [fullMatch = '', hrefRaw = '', labelRaw = ''] = match;
      const start = match.index;
      const end = start + fullMatch.length;

      if (start > lastIndex) {
        nodes.push(line.slice(lastIndex, start));
      }

      const linkProps = getContentLinkProps(hrefRaw);
      const label = String(labelRaw);

      if (linkProps) {
        nodes.push(
          <CONTENT_INLINE_LINK key={`${lineKey}-url-${start}`} {...linkProps}>
            {label}
          </CONTENT_INLINE_LINK>
        );
      } else {
        nodes.push(label);
      }

      lastIndex = end;
    }

    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex));
    }

    return nodes;
  };

  const lines = text.split('\n');

  return lines.map((line, i) => (
    <React.Fragment key={`inline-${i}`}>
      {renderLine(line, `inline-${i}`)}
      {i < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

#!/usr/bin/env node
import fs from 'fs/promises';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].substring(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      args[key] = value;
      if (value !== true) i++;
    }
  }
  return args;
}

function extractText(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return '';
  let body = bodyMatch[1];
  body = body.replace(/<!--[^]*?-->/g, '');
  body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<[^>]+>/g, '');
  return body.replace(/\s+/g, ' ').trim();
}

function extractLinks(html, base) {
  const links = [];
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match;
  while ((match = anchorRegex.exec(html))) {
    const href = match[2] || match[3] || match[4];
    try {
      const url = new URL(href, base).toString();
      links.push(url);
    } catch {}
  }
  return links;
}

function checkBlank(html, threshold) {
  const text = extractText(html);
  return { isBlank: text.length <= threshold, textLength: text.length };
}

async function crawl(base, depth, threshold) {
  const results = [];
  const visited = new Set();
  const queue = [{ url: base, depth: 0 }];

  while (queue.length) {
    const { url, depth: d } = queue.shift();
    if (visited.has(url) || d > depth) continue;
    visited.add(url);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const { isBlank, textLength } = checkBlank(html, threshold);
      results.push({ url, blank: isBlank, textLength, status: res.status });
      if (d < depth) {
        const links = extractLinks(html, url);
        for (const link of links) {
          if (link.startsWith(base) && !visited.has(link)) {
            queue.push({ url: link, depth: d + 1 });
          }
        }
      }
    } catch (e) {
      results.push({ url, blank: true, textLength: 0, status: 'error', error: e.message });
    }
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = args.base;
  const depth = Number(args.depth || 0);
  const out = args.out || 'report.csv';
  const threshold = Number(args.threshold || 10);
  if (!base) {
    console.error('Usage: node detect-blank-pages.js --base <url> [--depth n] [--out file] [--threshold n]');
    process.exit(1);
  }
  const results = await crawl(base, depth, threshold);
  let csv = 'url,blank,textLength,status\n';
  csv += results.map(r => `${r.url},${r.blank},${r.textLength},${r.status}`).join('\n');
  await fs.writeFile(out, csv);
}

main();

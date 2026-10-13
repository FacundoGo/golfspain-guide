#!/usr/bin/env node
// Regenerates sitemap.xml with real <lastmod> dates.
//
// Usage (from the repo root, before committing):
//   node scripts/generate-sitemap.js                    # refresh the URLs already in sitemap.xml
//   node scripts/generate-sitemap.js --include-missing  # also add indexable pages not yet listed
//
// - The URL list comes from the current sitemap.xml (it stays the source of truth),
//   so adding a page to the sitemap is a deliberate choice.
// - <lastmod> is the date of the last git commit that touched the page's index.html.
//   Pages with uncommitted changes get today's date (they are about to be committed).
//   Needs full git history: in a shallow clone, run `git fetch --depth=1000 origin main` first.
// - hreflang alternates are read from each page's own <link rel="alternate" hreflang> tags.
// - changefreq / priority are kept from the existing entry (defaults: monthly / 0.7).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://golfspain.guide';
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const includeMissing = process.argv.includes('--include-missing');

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

if (git('rev-parse', '--is-shallow-repository') === 'true') {
  console.error('Shallow git clone: lastmod dates would be wrong. Run `git fetch --depth=1000 origin main` first.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
// Porcelain lines are "XY path"; read them untrimmed so the leading status column survives
const dirty = new Set(
  execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean).map(l => l.slice(3))
);

const fileFor = url => path.join(url.replace(SITE, '').replace(/^\//, ''), 'index.html');

function lastmod(url) {
  const file = fileFor(url);
  if (dirty.has(file)) return today;
  return git('log', '-1', '--format=%cs', '--', file) || today;
}

function alternates(url) {
  const html = fs.readFileSync(path.join(ROOT, fileFor(url)), 'utf8');
  return [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map(m => ({ lang: m[1], href: m[2] }));
}

function isIndexable(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (/name="robots" content="[^"]*noindex/.test(html)) return false;
  if (/http-equiv="refresh"/.test(html)) return false;   // redirect pages (e.g. the root /)
  return true;
}

// Existing entries: URL order, changefreq, priority
const current = fs.readFileSync(SITEMAP, 'utf8');
const entries = [...current.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => ({
  loc: m[1].match(/<loc>([^<]+)<\/loc>/)[1],
  changefreq: (m[1].match(/<changefreq>([^<]+)</) || [])[1] || 'monthly',
  priority: (m[1].match(/<priority>([^<]+)</) || [])[1] || '0.7',
}));

const listed = new Set(entries.map(e => e.loc));
const missing = [];
(function walk(dir) {
  for (const name of fs.readdirSync(path.join(ROOT, dir))) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const rel = path.join(dir, name);
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
    else if (name === 'index.html' && dir && isIndexable(rel)) {
      const loc = `${SITE}/${dir.split(path.sep).join('/')}/`;
      if (!listed.has(loc)) missing.push(loc);
    }
  }
})('');

if (includeMissing) missing.forEach(loc => entries.push({ loc, changefreq: 'monthly', priority: '0.6' }));

const body = entries.map(e => {
  const alts = alternates(e.loc)
    .map(a => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`).join('\n');
  return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${lastmod(e.loc)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
${alts}
  </url>`;
}).join('\n');

fs.writeFileSync(SITEMAP, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`);

console.log(`sitemap.xml: ${entries.length} URLs`);
if (!includeMissing && missing.length) {
  console.log(`Indexable pages not in the sitemap (${missing.length}), add with --include-missing:`);
  missing.forEach(m => console.log('  ' + m));
}

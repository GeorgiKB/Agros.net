import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, 'products');

function findDivEnd(html, startPos) {
  let depth = 0;
  let i = startPos;
  while (i < html.length) {
    if (html[i] === '<') {
      if (/^<div[\s>]/.test(html.substring(i))) {
        depth++;
        i += 4;
      } else if (html.substring(i, i + 6) === '</div>') {
        depth--;
        if (depth === 0) return i + 6;
        i += 6;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  return -1;
}

function undoCategoryPage(html) {
  const navEnd = html.indexOf('</nav>');
  if (navEnd === -1) return null;

  // Find banner div right after nav
  const bannerDivIdx = html.indexOf('<div style="background:linear-gradient', navEnd);
  if (bannerDivIdx === -1 || bannerDivIdx > navEnd + 300) return null;
  const bannerEnd = findDivEnd(html, bannerDivIdx);
  if (bannerEnd === -1) return null;

  // Find the flex container
  const bodyComment = html.indexOf('<!-- Body: sidebar + content -->', bannerEnd);
  if (bodyComment === -1) return null;
  const flexDivIdx = html.indexOf('<div class="max-w-7xl mx-auto flex"', bodyComment);
  if (flexDivIdx === -1) return null;

  // Skip past the sidebar aside
  const asideStart = html.indexOf('<aside ', flexDivIdx);
  if (asideStart === -1) return null;
  const asideEnd = html.indexOf('</aside>', asideStart) + 8;

  // Find the content wrapper div
  const wrapperStart = html.indexOf('<div style="flex:1;', asideEnd);
  if (wrapperStart === -1) return null;
  const wrapperOpenEnd = html.indexOf('>', wrapperStart) + 1;
  const wrapperEnd = findDivEnd(html, wrapperStart);
  if (wrapperEnd === -1) return null;

  // Find flex container end
  const flexEnd = findDivEnd(html, flexDivIdx);
  if (flexEnd === -1) return null;

  // Extract inner content (inside the wrapper div, excluding opening/closing tags)
  let innerContent = html.substring(wrapperOpenEnd, wrapperEnd - 6);

  // Restore max-w-7xl mx-auto on breadcrumb and grid divs
  innerContent = innerContent
    .replace(
      'class="px-5 sm:px-8 lg:px-10" style="padding-top:16px; padding-bottom:8px;"',
      'class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10" style="padding-top:16px; padding-bottom:8px;"'
    )
    .replace(
      'class="grid grid-cols-1 lg:grid-cols-2 gap-8 px-5 sm:px-8 lg:px-10"',
      'class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10"'
    );

  const bannerHtml = html.substring(bannerDivIdx, bannerEnd);

  const before = html.substring(0, navEnd + 6);
  const after = html.substring(flexEnd);

  // Re-wrap in original <div><div> structure
  return before + `\n  <div>\n    <div>\n      ${bannerHtml}\n${innerContent}\n    </div>\n  </div>\n` + after;
}

function undoIndividualPage(html) {
  const navEnd = html.indexOf('</nav>');
  if (navEnd === -1) return null;

  // Find Brand banner comment (individual pages had this inserted)
  const bannerComment = html.indexOf('<!-- Brand banner -->', navEnd);
  if (bannerComment === -1 || bannerComment > navEnd + 300) return null;

  // Find flex container
  const bodyComment = html.indexOf('<!-- Body: sidebar + content -->', bannerComment);
  if (bodyComment === -1) return null;
  const flexDivIdx = html.indexOf('<div class="max-w-7xl mx-auto flex"', bodyComment);
  if (flexDivIdx === -1) return null;

  // Skip past sidebar
  const asideStart = html.indexOf('<aside ', flexDivIdx);
  if (asideStart === -1) return null;
  const asideEnd = html.indexOf('</aside>', asideStart) + 8;

  // Find content wrapper
  const wrapperStart = html.indexOf('<div style="flex:1;', asideEnd);
  if (wrapperStart === -1) return null;
  const wrapperOpenEnd = html.indexOf('>', wrapperStart) + 1;
  const wrapperEnd = findDivEnd(html, wrapperStart);
  if (wrapperEnd === -1) return null;

  const flexEnd = findDivEnd(html, flexDivIdx);
  if (flexEnd === -1) return null;

  // Extract inner content
  let innerContent = html.substring(wrapperOpenEnd, wrapperEnd - 6).trim();

  // Restore max-w-7xl mx-auto on breadcrumb div and main
  innerContent = innerContent
    .replace(
      'class="px-5 sm:px-8 lg:px-10 pt-6 pb-2"',
      'class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-6 pb-2"'
    )
    .replace(
      'class="px-5 sm:px-8 lg:px-10 py-10"',
      'class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10"'
    );

  const before = html.substring(0, navEnd + 6);
  const after = html.substring(flexEnd);

  return before + `\n\n  ${innerContent}\n` + after;
}

let processed = 0;
let skipped = 0;

const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

for (const filename of files) {
  const filePath = path.join(productsDir, filename);
  const html = fs.readFileSync(filePath, 'utf8');

  if (!html.includes('<!-- Left Sidebar -->')) {
    skipped++;
    continue;
  }

  const hasAddedBanner = html.includes('<!-- Brand banner -->');
  let updated;

  if (hasAddedBanner) {
    // Individual page (banner was added by script)
    updated = undoIndividualPage(html);
    if (updated) console.log(`UNDO INDIVIDUAL: ${filename}`);
  } else {
    // Category page (banner was already there)
    updated = undoCategoryPage(html);
    if (updated) console.log(`UNDO CATEGORY: ${filename}`);
  }

  if (!updated) {
    console.log(`  WARNING: Could not undo ${filename}`);
    skipped++;
  } else {
    fs.writeFileSync(filePath, updated, 'utf8');
    processed++;
  }
}

console.log(`\nDone! Reverted: ${processed}, Skipped: ${skipped}`);

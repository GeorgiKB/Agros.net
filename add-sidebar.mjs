import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, 'products');

// Active category per page
const PAGE_ACTIVE = {
  'olleo-bottles.html': 'olleo-bottles',
  'olleo-doses.html': 'olleo-doses',
  'noteo-proteins.html': 'noteo-proteins',
  'noteo-flours.html': 'noteo-flours',
  'noteo-choco-creams.html': 'noteo-choco-creams',
  'dorso-masks.html': 'dorso-masks',
  'dorso-scrubs.html': 'dorso-scrubs',
  'dorso-body-care.html': 'dorso-body-care',
  'dorso-body-oils.html': 'dorso-body-oils',
  // OLLEO individual
  'chilli-8ml.html': 'olleo-bottles',
  'chilli-250ml.html': 'olleo-bottles',
  'garlic-8ml.html': 'olleo-bottles',
  'garlic-250ml.html': 'olleo-bottles',
  'lemon-8ml.html': 'olleo-bottles',
  'lemon-250ml.html': 'olleo-bottles',
  'olive-blend-250ml.html': 'olleo-bottles',
  'truffle-250ml.html': 'olleo-bottles',
  'omega-mix-250ml.html': 'olleo-bottles',
  'coriander-250ml.html': 'olleo-bottles',
  'flax-250ml.html': 'olleo-bottles',
  'soy-8ml.html': 'olleo-bottles',
  'natural-14ml.html': 'olleo-bottles',
  'natural-750ml.html': 'olleo-bottles',
  'balsamic-8ml.html': 'olleo-bottles',
  'doses-10x8ml.html': 'olleo-doses',
  // NOTEO individual
  'noteo-protein-chocolate-300g.html': 'noteo-proteins',
  'noteo-protein-natural-300g.html': 'noteo-proteins',
  'noteo-protein-raspberry-300g.html': 'noteo-proteins',
  'noteo-flax-flour-300g.html': 'noteo-flours',
  'noteo-walnut-flour-300g.html': 'noteo-flours',
  'noteo-choco-cream-cocoa-65g.html': 'noteo-choco-creams',
  'noteo-choco-cream-mint-65g.html': 'noteo-choco-creams',
  'noteo-choco-cream-orange-65g.html': 'noteo-choco-creams',
  'noteo-choco-cream-mix-65g.html': 'noteo-choco-creams',
  // DORSO individual
  'dorso-mask-rose.html': 'dorso-masks',
  'dorso-mask-sunflower.html': 'dorso-masks',
  'dorso-scrub-coriander.html': 'dorso-scrubs',
  'dorso-scrub-sunflower.html': 'dorso-scrubs',
  'dorso-body-lotion.html': 'dorso-body-care',
  'dorso-oil-natural.html': 'dorso-body-oils',
  'dorso-oil-rose.html': 'dorso-body-oils',
  'dorso-oil-coriander.html': 'dorso-body-oils',
  'dorso-booster-citrus.html': 'dorso-body-care',
  'dorso-booster-lavender.html': 'dorso-body-care',
  'dorso-massage-balm.html': 'dorso-body-care',
};

// Banners for individual product pages (category pages already have banners)
const PAGE_BANNER = {
  olleo: `
  <!-- Brand banner -->
  <div style="background:linear-gradient(120deg,#2D1800 0%,#7A4500 55%,#C8922A 100%);padding:28px 0 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,rgba(255,200,60,0.18) 0%,transparent 65%);pointer-events:none;"></div>
    <div class="max-w-full px-5 sm:px-8 lg:px-10 relative">
      <span style="display:inline-block;background:rgba(0,0,0,0.30);color:rgba(255,255,255,0.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Студено пресовани масла</span>
      <div><img src="../images/olleo/olleo-logo.png" alt="OLLEO" style="height:36px;width:auto;filter:brightness(0) invert(1);opacity:0.92;" /></div>
    </div>
  </div>`,
  'noteo-proteins': `
  <!-- Brand banner -->
  <div style="background:linear-gradient(120deg,#042420 0%,#0A5E56 55%,#18988B 100%);padding:28px 0 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,rgba(94,196,188,.2) 0%,transparent 65%);pointer-events:none;"></div>
    <div class="max-w-full px-5 sm:px-8 lg:px-10 relative">
      <span style="display:inline-block;background:rgba(0,0,0,.28);color:rgba(255,255,255,.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Растителни протеини</span>
      <div><img src="../images/noteo/NOTEO-logo.png" alt="NOTEO" style="height:32px;width:auto;filter:brightness(0) invert(1);opacity:.92;" /></div>
    </div>
  </div>`,
  'noteo-flours': `
  <!-- Brand banner -->
  <div style="background:linear-gradient(120deg,#042420 0%,#0A5E56 55%,#18988B 100%);padding:28px 0 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,rgba(94,196,188,.2) 0%,transparent 65%);pointer-events:none;"></div>
    <div class="max-w-full px-5 sm:px-8 lg:px-10 relative">
      <span style="display:inline-block;background:rgba(0,0,0,.28);color:rgba(255,255,255,.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Натурални брашна</span>
      <div><img src="../images/noteo/NOTEO-logo.png" alt="NOTEO" style="height:32px;width:auto;filter:brightness(0) invert(1);opacity:.92;" /></div>
    </div>
  </div>`,
  'noteo-choco-creams': `
  <!-- Brand banner -->
  <div style="background:linear-gradient(120deg,#042420 0%,#0A5E56 55%,#18988B 100%);padding:28px 0 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,rgba(94,196,188,.2) 0%,transparent 65%);pointer-events:none;"></div>
    <div class="max-w-full px-5 sm:px-8 lg:px-10 relative">
      <span style="display:inline-block;background:rgba(0,0,0,.28);color:rgba(255,255,255,.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Шоко кремове</span>
      <div><img src="../images/noteo/NOTEO-logo.png" alt="NOTEO" style="height:32px;width:auto;filter:brightness(0) invert(1);opacity:.92;" /></div>
    </div>
  </div>`,
  dorso: `
  <!-- Brand banner -->
  <div style="background:linear-gradient(120deg,#1A0010 0%,#4A1838 55%,#7B3A60 100%);padding:28px 0 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,rgba(196,123,142,.2) 0%,transparent 65%);pointer-events:none;"></div>
    <div class="max-w-full px-5 sm:px-8 lg:px-10 relative">
      <span style="display:inline-block;background:rgba(0,0,0,.28);color:rgba(255,255,255,.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Натурална козметика</span>
      <div><img src="../images/dorso/dorso-logo.png" alt="D'ORSO" style="height:32px;width:auto;filter:brightness(0) invert(1);opacity:.92;" /></div>
    </div>
  </div>`,
};

function getBannerKey(filename, activeCategory) {
  if (filename.startsWith('olleo') || ['chilli','garlic','lemon','olive','truffle','omega','coriander','flax','soy','natural','balsamic','doses'].some(k => filename.startsWith(k))) return 'olleo';
  if (activeCategory && activeCategory.startsWith('noteo')) return activeCategory;
  if (filename.startsWith('dorso')) return 'dorso';
  return null;
}

function getSidebar(activeCategory) {
  function lnk(href, label, cat, bg, color) {
    const active = activeCategory === cat;
    const style = active
      ? `background:${bg};color:${color};font-weight:700;`
      : 'color:#4B5563;';
    return `    <a href="${href}" style="display:block;padding:6px 20px;font-family:'Inter',sans-serif;font-size:0.8rem;text-decoration:none;${style}">${label}</a>`;
  }
  return `
  <!-- Left Sidebar -->
  <aside class="hidden lg:block" style="width:200px;flex-shrink:0;border-right:1px solid #EDE5D5;padding:20px 0 48px;align-self:flex-start;position:sticky;top:64px;">
    <a href="olleo-bottles.html" style="display:block;padding:0 16px 8px;"><img src="../images/olleo/olleo-logo.png" alt="OLLEO" style="height:26px;width:auto;" /></a>
${lnk('olleo-bottles.html','Бутилки','olleo-bottles','rgba(200,146,42,.13)','#7A4500')}
${lnk('olleo-doses.html','Дози','olleo-doses','rgba(200,146,42,.13)','#7A4500')}
    <div style="margin:10px 16px;border-top:1px solid #EDE5D5;"></div>
    <a href="noteo-proteins.html" style="display:block;padding:0 16px 8px;"><img src="../images/noteo/NOTEO-logo.png" alt="NOTEO" style="height:20px;width:auto;" /></a>
${lnk('noteo-proteins.html','Протеини','noteo-proteins','rgba(24,152,139,.1)','#083F3B')}
${lnk('noteo-flours.html','Брашна','noteo-flours','rgba(24,152,139,.1)','#083F3B')}
${lnk('noteo-choco-creams.html','Шоко кремове','noteo-choco-creams','rgba(24,152,139,.1)','#083F3B')}
    <div style="margin:10px 16px;border-top:1px solid #EDE5D5;"></div>
    <a href="dorso-body-oils.html" style="display:block;padding:0 16px 8px;"><img src="../images/dorso/dorso-logo.png" alt="D'ORSO" style="height:22px;width:auto;" /></a>
${lnk('dorso-body-oils.html','Масла за тяло','dorso-body-oils','rgba(123,58,96,.1)','#5A2A4A')}
${lnk('dorso-masks.html','Маски','dorso-masks','rgba(123,58,96,.1)','#5A2A4A')}
${lnk('dorso-scrubs.html','Скрабове','dorso-scrubs','rgba(123,58,96,.1)','#5A2A4A')}
${lnk('dorso-body-care.html','Грижа за тяло','dorso-body-care','rgba(123,58,96,.1)','#5A2A4A')}
  </aside>`;
}

// Find div end position by balancing <div> and </div> tags
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

function isCategoryPage(html) {
  // Category pages have banner inside div wrappers after nav
  return /\<\/nav\>[\s\S]{0,200}<div[^>]*>\s*<div[^>]*>\s*<div style="background:linear-gradient/.test(html) ||
         /\<\/nav\>[\s\S]{0,300}<div style="background:linear-gradient/.test(html);
}

function isIndividualPage(html) {
  // Individual pages have Breadcrumb comment after nav, no big outer wrappers
  return /\<\/nav\>[\s\S]{0,200}<!-- Breadcrumb -->/.test(html);
}

function transformCategoryPage(html, filename, activeCategory) {
  // Find the section after </nav>
  const navEnd = html.indexOf('</nav>');
  if (navEnd === -1) return html;
  const afterNav = navEnd + 6;

  // Find the outer <div> wrapper start (the one right after </nav>)
  const outerDivMatch = html.indexOf('<div>', afterNav);
  if (outerDivMatch === -1 || outerDivMatch > afterNav + 200) return html;

  // Find inner <div> wrapper
  const innerDivStart = html.indexOf('<div>', outerDivMatch + 5);
  if (innerDivStart === -1) return html;
  const contentStart = innerDivStart + 5;

  // Find the banner div (should start with <div style="background:linear-gradient)
  const bannerDivIdx = html.indexOf('<div style="background:linear-gradient', contentStart);
  if (bannerDivIdx === -1 || bannerDivIdx > contentStart + 200) return html;

  const bannerEnd = findDivEnd(html, bannerDivIdx);
  if (bannerEnd === -1) return html;

  // Find the end of the two outer wrapper divs (closing </div></div> pair after all content)
  // The inner wrapper closes first, then outer
  // Find last closing divs before <footer
  const footerIdx = html.indexOf('<footer', bannerEnd);
  if (footerIdx === -1) return html;

  // The content between bannerEnd and footerIdx contains: breadcrumb div, grid div, </div>, </div>
  const innerContent = html.substring(bannerEnd, footerIdx);

  // Remove the two trailing </div> from innerContent
  // They appear as \n    </div>\n  </div>\n or similar
  const closingDivsPattern = /(\s*<\/div>\s*<\/div>\s*)$/;
  const closingMatch = innerContent.match(closingDivsPattern);
  let contentBetween = innerContent;
  let trailingClosings = '';
  if (closingMatch) {
    contentBetween = innerContent.substring(0, innerContent.length - closingMatch[0].length);
    trailingClosings = '\n';
  }

  // Remove max-w-7xl mx-auto from breadcrumb and grid divs in contentBetween
  contentBetween = contentBetween
    .replace(/class="max-w-7xl mx-auto (px-5 sm:px-8 lg:px-10)" style="padding-top:16px; padding-bottom:8px;"/g,
             'class="$1" style="padding-top:16px; padding-bottom:8px;"')
    .replace(/class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto (px-5 sm:px-8 lg:px-10)"/g,
             'class="grid grid-cols-1 lg:grid-cols-2 gap-8 $1"');

  const sidebar = getSidebar(activeCategory);
  const bannerHtml = html.substring(bannerDivIdx, bannerEnd);

  // Build the before-nav, banner, flex wrapper with sidebar + content
  const before = html.substring(0, afterNav);
  const after = html.substring(footerIdx);

  return before + `\n\n  ${bannerHtml}\n\n  <!-- Body: sidebar + content -->\n  <div class="max-w-7xl mx-auto flex" style="align-items:flex-start;">${sidebar}\n    <div style="flex:1;min-width:0;overflow:hidden;">${contentBetween}\n    </div>\n  </div>\n\n  ` + after;
}

function transformIndividualPage(html, filename, activeCategory) {
  const navEnd = html.indexOf('</nav>');
  if (navEnd === -1) return html;
  const afterNav = navEnd + 6;

  // Find breadcrumb div
  const breadcrumbComment = html.indexOf('<!-- Breadcrumb -->', afterNav);
  if (breadcrumbComment === -1 || breadcrumbComment > afterNav + 300) return html;

  // Find the breadcrumb div start
  const breadcrumbDivStart = html.indexOf('<div ', breadcrumbComment);
  if (breadcrumbDivStart === -1) return html;

  // Find main element
  const mainStart = html.indexOf('<main ', afterNav);
  if (mainStart === -1) return html;
  const mainEnd = html.indexOf('</main>', mainStart);
  if (mainEnd === -1) return html;
  const mainEndFull = mainEnd + 7;

  // Get banner
  const bannerKey = getBannerKey(filename, activeCategory);
  const banner = PAGE_BANNER[bannerKey] || '';

  // Content from breadcrumb comment to end of main
  let innerContent = html.substring(breadcrumbComment, mainEndFull);

  // Remove max-w-7xl mx-auto from breadcrumb div
  innerContent = innerContent
    .replace('class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-6 pb-2"',
             'class="px-5 sm:px-8 lg:px-10 pt-6 pb-2"')
    .replace('class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10"',
             'class="px-5 sm:px-8 lg:px-10 py-10"');

  const sidebar = getSidebar(activeCategory);

  const before = html.substring(0, afterNav);
  const after = html.substring(mainEndFull);

  return before + `\n${banner}\n\n  <!-- Body: sidebar + content -->\n  <div class="max-w-7xl mx-auto flex" style="align-items:flex-start;">${sidebar}\n    <div style="flex:1;min-width:0;overflow:hidden;">\n      ${innerContent}\n    </div>\n  </div>\n` + after;
}

// Process all files
let processed = 0;
let skipped = 0;

for (const [filename, activeCategory] of Object.entries(PAGE_ACTIVE)) {
  const filePath = path.join(productsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filename}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if sidebar already added
  if (html.includes('<!-- Left Sidebar -->')) {
    console.log(`SKIP (already has sidebar): ${filename}`);
    skipped++;
    continue;
  }

  let updated;
  if (isCategoryPage(html)) {
    updated = transformCategoryPage(html, filename, activeCategory);
    console.log(`CATEGORY: ${filename}`);
  } else if (isIndividualPage(html)) {
    updated = transformIndividualPage(html, filename, activeCategory);
    console.log(`INDIVIDUAL: ${filename}`);
  } else {
    console.log(`SKIP (unknown type): ${filename}`);
    skipped++;
    continue;
  }

  if (updated === html) {
    console.log(`  WARNING: No changes made to ${filename}`);
    skipped++;
  } else {
    fs.writeFileSync(filePath, updated, 'utf8');
    processed++;
  }
}

console.log(`\nDone! Processed: ${processed}, Skipped: ${skipped}`);

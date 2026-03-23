import { readFileSync, writeFileSync } from 'fs';

const BASE = 'c:/Users/G.Berbenkov/Desktop/Agros.net/products/';

// Individual NOTEO pages with hardcoded render content
const NOTEO_INDIVIDUAL = [
  'noteo-protein-chocolate-300g.html',
  'noteo-protein-natural-300g.html',
  'noteo-protein-raspberry-300g.html',
  'noteo-flax-flour-300g.html',
  'noteo-walnut-flour-300g.html',
  'noteo-choco-cream-cocoa-65g.html',
  'noteo-choco-cream-mint-65g.html',
  'noteo-choco-cream-mix-65g.html',
  'noteo-choco-cream-orange-65g.html',
];

// Individual DORSO pages
const DORSO_INDIVIDUAL = [
  'dorso-body-lotion.html',
  'dorso-booster-citrus.html',
  'dorso-booster-lavender.html',
  'dorso-massage-balm.html',
  'dorso-mask-rose.html',
  'dorso-mask-sunflower.html',
  'dorso-oil-coriander.html',
  'dorso-oil-natural.html',
  'dorso-oil-rose.html',
  'dorso-scrub-coriander.html',
  'dorso-scrub-sunflower.html',
];

function fixNoteoIndividual(filename) {
  const path = BASE + filename;
  let html = readFileSync(path, 'utf8');
  const issues = [];
  let changed = false;

  // Fix 2: Name truncation - hardcoded text pattern
  // Pattern: color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">SOME TEXT</div>
  // Replace with: color:#083F3B;line-height:1.3;">SOME TEXT</div>
  const truncPattern = /color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">((?!<\/div>)[^"]*)<\/div>/g;
  const truncMatches = html.match(truncPattern);
  if (truncMatches) {
    html = html.replace(truncPattern, 'color:#083F3B;line-height:1.3;">$1</div>');
    changed = true;
    console.log(`  Fixed truncation: ${truncMatches.length} occurrence(s)`);
  } else {
    issues.push('name truncation pattern not found');
  }

  // Fix 3: Move price under size - hardcoded pattern
  // Pattern in single long line: ...${v.size}</div></div><div style="font-family:'Inter',sans-serif;font-size:.85rem;font-weight:700;color:#083F3B;white-space:nowrap;margin-right:6px;">${fmtEUR(NUMBER)}</div>...
  // After the size div closes, we need to:
  //   - add the price div inside the flex:1 before it closes
  //   - remove the standalone price div
  const priceHardcoded = /<\/div><\/div><div style="font-family:'Inter',sans-serif;font-size:\.85rem;font-weight:700;color:#083F3B;white-space:nowrap;margin-right:6px;">\$\{fmtEUR\((\d+\.?\d*)\)\}<\/div>/g;
  const priceMatches = html.match(priceHardcoded);
  if (priceMatches) {
    // Find the size div before this pattern and move price inside
    // The pattern context: ...size text</div></div><div style="...price...</div><div onclick...
    html = html.replace(priceHardcoded, (match, price) => {
      return `<div style="font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:700;color:#083F3B;margin-top:2px;">\${fmtEUR(${price})}</div></div></div>`;
    });
    changed = true;
    console.log(`  Fixed price position: ${priceMatches.length} occurrence(s)`);
  } else {
    issues.push('hardcoded price pattern not found - checking if already fixed');
    // Check if price is already in new format (inside flex:1)
    if (html.includes('font-size:0.78rem;font-weight:700;color:#083F3B;margin-top:2px;')) {
      issues.push('price already in new format - OK');
    }
  }

  if (changed || issues.length === 0) {
    writeFileSync(path, html, 'utf8');
    return { filename, status: issues.length === 0 ? 'OK' : 'OK (with notes)', issues };
  } else {
    writeFileSync(path, html, 'utf8');
    return { filename, status: 'CHECKED', issues };
  }
}

function fixDorsoIndividual(filename) {
  const path = BASE + filename;
  let html = readFileSync(path, 'utf8');
  const issues = [];
  let changed = false;

  // Fix 2: Name truncation for DORSO - hardcoded text pattern
  // Pattern: color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">SOME TEXT</div>
  const truncPattern = /color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">((?!<\/div>)[^"]*)<\/div>/g;
  const truncMatches = html.match(truncPattern);
  if (truncMatches) {
    html = html.replace(truncPattern, 'color:#3B2030;line-height:1.3;">$1</div>');
    changed = true;
    console.log(`  Fixed truncation: ${truncMatches.length} occurrence(s)`);
  } else {
    // Check if already fixed
    if (html.includes('color:#3B2030;line-height:1.3;')) {
      issues.push('name truncation already fixed');
    } else {
      issues.push('DORSO name truncation pattern not found');
    }
  }

  if (changed || issues.length === 0) {
    writeFileSync(path, html, 'utf8');
    return { filename, status: issues.length === 0 ? 'OK' : 'OK (with notes)', issues };
  } else {
    writeFileSync(path, html, 'utf8');
    return { filename, status: 'CHECKED', issues };
  }
}

console.log('=== Fixing individual NOTEO pages ===');
for (const f of NOTEO_INDIVIDUAL) {
  const result = fixNoteoIndividual(f);
  console.log(`${result.status}: ${result.filename}`);
  if (result.issues && result.issues.length > 0) {
    result.issues.forEach(i => console.log(`  NOTE: ${i}`));
  }
}

console.log('\n=== Fixing individual DORSO pages ===');
for (const f of DORSO_INDIVIDUAL) {
  const result = fixDorsoIndividual(f);
  console.log(`${result.status}: ${result.filename}`);
  if (result.issues && result.issues.length > 0) {
    result.issues.forEach(i => console.log(`  NOTE: ${i}`));
  }
}

console.log('\nDone!');

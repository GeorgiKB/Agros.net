import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/Users/G.Berbenkov/Desktop/Agros.net/products/';

const NOTEO_FILES = [
  'noteo-proteins.html',
  'noteo-flours.html',
  'noteo-choco-creams.html',
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

const DORSO_FILES = [
  'dorso-body-care.html',
  'dorso-body-oils.html',
  'dorso-masks.html',
  'dorso-scrubs.html',
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

const NOTEO_STICKY_BAR = `
  <!-- Sticky mini product bar (mobile only) -->
  <div id="sticky-product-bar" class="lg:hidden" style="position:fixed;top:64px;left:0;right:0;z-index:39;background:rgba(247,243,236,0.97);backdrop-filter:blur(10px);border-bottom:1.5px solid #EDE5D5;padding:8px 16px;display:flex;align-items:center;gap:12px;transform:translateY(-110%);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;box-shadow:0 4px 16px rgba(0,0,0,0.07);">
    <div style="width:48px;height:58px;background:#D0F0EE;border-radius:8px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
      <img id="sticky-img" src="" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px;" />
    </div>
    <div style="flex:1;min-width:0;">
      <div id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
      <div id="sticky-size" style="font-family:'Inter',sans-serif;font-size:0.7rem;color:#9CA3AF;margin-top:1px;"></div>
      <div id="sticky-price" style="font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:700;color:#083F3B;margin-top:2px;"></div>
    </div>
  </div>`;

const DORSO_STICKY_BAR = `
  <!-- Sticky mini product bar (mobile only) -->
  <div id="sticky-product-bar" class="lg:hidden" style="position:fixed;top:64px;left:0;right:0;z-index:39;background:rgba(247,243,236,0.97);backdrop-filter:blur(10px);border-bottom:1.5px solid #EDE5D5;padding:8px 16px;display:flex;align-items:center;gap:12px;transform:translateY(-110%);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;box-shadow:0 4px 16px rgba(0,0,0,0.07);">
    <div style="width:48px;height:58px;background:#F5E0EC;border-radius:8px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
      <img id="sticky-img" src="" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px;" />
    </div>
    <div style="flex:1;min-width:0;">
      <div id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
      <div id="sticky-size" style="font-family:'Inter',sans-serif;font-size:0.7rem;color:#9CA3AF;margin-top:1px;"></div>
    </div>
  </div>`;

const NOTEO_STICKY_JS = `
// Sticky mini product bar
function updateStickyBar() {
  const v = VARIANTS.find(x => x.id === selectedId);
  if (!v) return;
  document.getElementById('sticky-img').src = v.img;
  document.getElementById('sticky-name').textContent = v.name;
  document.getElementById('sticky-size').textContent = v.size;
  document.getElementById('sticky-price').innerHTML = fmtEUR(parseFloat(v.price));
}
updateStickyBar();
const _stickyBar = document.getElementById('sticky-product-bar');
const _imgWrap = document.getElementById('main-img-wrap');
new IntersectionObserver(([entry]) => {
  if (window.innerWidth >= 1024) return;
  if (!entry.isIntersecting) {
    _stickyBar.style.transform = 'translateY(0)';
    _stickyBar.style.opacity = '1';
  } else {
    _stickyBar.style.transform = 'translateY(-110%)';
    _stickyBar.style.opacity = '0';
  }
}, { threshold: 0 }).observe(_imgWrap);`;

const DORSO_STICKY_JS = `
// Sticky mini product bar
function updateStickyBar() {
  const v = VARIANTS.find(x => x.id === selectedId);
  if (!v) return;
  document.getElementById('sticky-img').src = v.img;
  document.getElementById('sticky-name').textContent = v.name;
  document.getElementById('sticky-size').textContent = v.size;
}
updateStickyBar();
const _stickyBar = document.getElementById('sticky-product-bar');
const _imgWrap = document.getElementById('main-img-wrap');
new IntersectionObserver(([entry]) => {
  if (window.innerWidth >= 1024) return;
  if (!entry.isIntersecting) {
    _stickyBar.style.transform = 'translateY(0)';
    _stickyBar.style.opacity = '1';
  } else {
    _stickyBar.style.transform = 'translateY(-110%)';
    _stickyBar.style.opacity = '0';
  }
}, { threshold: 0 }).observe(_imgWrap);`;

function processFile(filename, isNoteo) {
  const fp = join(BASE, filename);
  if (!existsSync(fp)) {
    return { filename, status: 'SKIPPED - file not found', changes: [] };
  }

  let html = readFileSync(fp, 'utf8');
  const original = html;
  const changes = [];
  const notes = [];

  // === CHANGE 1: Thumbnail 44x52 -> 56x66 ===
  if (html.includes('width:44px;height:52px;')) {
    html = html.replaceAll('width:44px;height:52px;', 'width:56px;height:66px;');
    changes.push('thumbnail 44x52->56x66');
  }

  // === CHANGE 2: Name truncation fix in render() variant rows ===
  // We need to remove ellipsis CSS from the variant row name divs in render() functions.
  // The sticky-name div (id="sticky-name") intentionally KEEPS the ellipsis.
  //
  // Strategy: We do a targeted replace for each specific color variant.
  // For NOTEO (#083F3B): remove white-space:nowrap;overflow:hidden;text-overflow:ellipsis; and replace with line-height:1.3;
  // For DORSO (#3B2030): same
  //
  // We MUST NOT touch the sticky-name div. To avoid that, we:
  // 1. Replace all occurrences of the pattern
  // 2. Then restore the sticky-name div to its original form

  if (isNoteo) {
    const NOTEO_ELLIPSIS = `font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">`;
    const NOTEO_LINEHEIGHT = `font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:600;color:#083F3B;line-height:1.3;">`;
    // Also handle the 0.78rem variant (some files use 0.78rem not .78rem)
    const NOTEO_ELLIPSIS_ALT = `font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">`;
    const NOTEO_LINEHEIGHT_ALT = `font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#083F3B;line-height:1.3;">`;

    const countBefore = (html.match(/font-size:(?:\.78|0\.78)rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;/g) || []).length;

    if (html.includes(NOTEO_ELLIPSIS)) {
      html = html.replaceAll(NOTEO_ELLIPSIS, NOTEO_LINEHEIGHT);
    }
    if (html.includes(NOTEO_ELLIPSIS_ALT)) {
      html = html.replaceAll(NOTEO_ELLIPSIS_ALT, NOTEO_LINEHEIGHT_ALT);
    }

    // Restore sticky-name div (it should keep ellipsis)
    // The sticky-name div has id="sticky-name" and font-size:0.78rem
    const stickyNameWrong083 = `id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#083F3B;line-height:1.3;"`;
    const stickyNameCorrect083 = `id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"`;
    if (html.includes(stickyNameWrong083)) {
      html = html.replaceAll(stickyNameWrong083, stickyNameCorrect083);
    }

    const countAfter = (html.match(/font-size:(?:\.78|0\.78)rem;font-weight:600;color:#083F3B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;/g) || []).length;
    // If count went down (excluding sticky-name), we made changes
    if (countBefore !== countAfter) {
      changes.push(`NOTEO name ellipsis->line-height (${countBefore - countAfter} occurrences)`);
    }
  } else {
    // DORSO
    const DORSO_ELLIPSIS = `font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">`;
    const DORSO_LINEHEIGHT = `font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:600;color:#3B2030;line-height:1.3;">`;
    const DORSO_ELLIPSIS_ALT = `font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">`;
    const DORSO_LINEHEIGHT_ALT = `font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#3B2030;line-height:1.3;">`;

    const countBefore = (html.match(/font-size:(?:\.78|0\.78)rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;/g) || []).length;

    if (html.includes(DORSO_ELLIPSIS)) {
      html = html.replaceAll(DORSO_ELLIPSIS, DORSO_LINEHEIGHT);
    }
    if (html.includes(DORSO_ELLIPSIS_ALT)) {
      html = html.replaceAll(DORSO_ELLIPSIS_ALT, DORSO_LINEHEIGHT_ALT);
    }

    // Restore sticky-name div (it should keep ellipsis)
    const stickyNameWrong3B = `id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#3B2030;line-height:1.3;"`;
    const stickyNameCorrect3B = `id="sticky-name" style="font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"`;
    if (html.includes(stickyNameWrong3B)) {
      html = html.replaceAll(stickyNameWrong3B, stickyNameCorrect3B);
    }

    const countAfter = (html.match(/font-size:(?:\.78|0\.78)rem;font-weight:600;color:#3B2030;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;/g) || []).length;
    if (countBefore !== countAfter) {
      changes.push(`DORSO name ellipsis->line-height (${countBefore - countAfter} occurrences)`);
    }
  }

  // === CHANGE 3: Move price under size - NOTEO only ===
  if (isNoteo) {
    // Pattern A: template literal render() (multi-variant category pages)
    // size div then </div></div> then standalone price div with whitespace
    const pricePatternA = /(font-size:\.7rem;color:#9CA3AF;margin-top:1px;">\$\{v\.size\}<\/div>)<\/div>\s*\n?\s*<div style="font-family:'Inter',sans-serif;font-size:\.85rem;font-weight:700;color:#083F3B;white-space:nowrap;margin-right:6px;">\$\{fmtEUR\(parseFloat\(v\.price\)\)\}<\/div>/g;
    if (pricePatternA.test(html)) {
      html = html.replace(pricePatternA,
        `$1\n        <div style="font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:700;color:#083F3B;margin-top:2px;">\${fmtEUR(parseFloat(v.price))}</div></div>`
      );
      changes.push('NOTEO price under size (template)');
    }

    // Pattern B: hardcoded single-variant inline render() (e.g. noteo-protein-chocolate-300g.html)
    // The hardcoded name text, then size text, then </div></div>, then price div with fmtEUR(NUMBER)
    // Pattern: margin-top:1px;">SIZETEXT</div></div><div style="font-family:'Inter',sans-serif;font-size:.85rem;font-weight:700;color:#083F3B;white-space:nowrap;margin-right:6px;">${fmtEUR(
    const pricePatternB = /(font-size:\.7rem;color:#9CA3AF;margin-top:1px;">([^<]+)<\/div>)<\/div><div style="font-family:'Inter',sans-serif;font-size:\.85rem;font-weight:700;color:#083F3B;white-space:nowrap;margin-right:6px;">\$\{fmtEUR\(([^)]+)\)\}<\/div>/g;
    if (pricePatternB.test(html)) {
      // Reset lastIndex after test
      pricePatternB.lastIndex = 0;
      html = html.replace(pricePatternB,
        `$1\n        <div style="font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:700;color:#083F3B;margin-top:2px;">\${fmtEUR($3)}</div></div>`
      );
      changes.push('NOTEO price under size (hardcoded)');
    }
  }

  // === CHANGE 4: Add id="main-img-wrap" to main image container ===
  if (!html.includes('id="main-img-wrap"')) {
    // Try the standard class pattern first
    const imgWrapRe = /(<div )(class="rounded-2xl overflow-hidden flex items-center justify-center lg:sticky lg:top-20)/;
    if (imgWrapRe.test(html)) {
      html = html.replace(imgWrapRe, '$1id="main-img-wrap" $2');
      changes.push('added id="main-img-wrap"');
    } else {
      notes.push('main-img-wrap pattern not found - manual check needed');
    }
  }

  // === CHANGE 5: Add sticky mini product bar HTML after </nav> ===
  if (!html.includes('id="sticky-product-bar"')) {
    // Find the first </nav> (after the sticky top nav)
    const navCloseIdx = html.indexOf('</nav>');
    if (navCloseIdx !== -1) {
      const stickyBar = isNoteo ? NOTEO_STICKY_BAR : DORSO_STICKY_BAR;
      html = html.slice(0, navCloseIdx + 6) + stickyBar + html.slice(navCloseIdx + 6);
      changes.push('added sticky product bar HTML');
    } else {
      notes.push('</nav> not found for sticky bar');
    }
  }

  // === CHANGE 6: Update select() to call updateStickyBar() ===
  // Match compact form: function select(id,img){...render();}
  // and ensure updateStickyBar() is called
  if (!html.includes('updateStickyBar()')) {
    // Try compact form: function select(id,img){...}
    // The select function calls render() at the end of its body
    // We add updateStickyBar() before the closing }
    html = html.replace(
      /\bfunction select\(id,img\)\{([^}]+?)(render\(\);)\}/g,
      (match, body, renderCall) => {
        return `function select(id,img){${body}${renderCall}updateStickyBar();}`;
      }
    );

    // Also handle select functions with setTimeout (already calling updateStickyBar inside setTimeout)
    // This pattern is already handled if updateStickyBar is in the setTimeout callback
    if (changes.includes('added sticky product bar HTML') || html.includes('updateStickyBar()')) {
      changes.push('updateStickyBar() added to select()');
    }
  }

  // === CHANGE 7: Add sticky bar JS before closing </script> ===
  if (!html.includes('// Sticky mini product bar')) {
    const stickyJs = isNoteo ? NOTEO_STICKY_JS : DORSO_STICKY_JS;
    // Find the </script> tag that ends the main inline script block
    // (the one before <script src="/auth.js">)
    const authScriptIdx = html.indexOf('<script src="/auth.js">');
    if (authScriptIdx !== -1) {
      // Find the last </script> before auth.js
      const closeScriptIdx = html.lastIndexOf('</script>', authScriptIdx);
      if (closeScriptIdx !== -1) {
        html = html.slice(0, closeScriptIdx) + stickyJs + '\n' + html.slice(closeScriptIdx);
        changes.push('added sticky bar JS');
      } else {
        notes.push('could not find </script> before auth.js');
      }
    } else {
      // Try finding </script> before nav-dropdown.js
      const navDropIdx = html.indexOf('<script src="../nav-dropdown.js">');
      if (navDropIdx !== -1) {
        const closeScriptIdx = html.lastIndexOf('</script>', navDropIdx);
        if (closeScriptIdx !== -1) {
          html = html.slice(0, closeScriptIdx) + stickyJs + '\n' + html.slice(closeScriptIdx);
          changes.push('added sticky bar JS (before nav-dropdown)');
        }
      } else {
        notes.push('could not find insertion point for sticky JS');
      }
    }
  }

  // Write file only if changed
  if (html !== original) {
    writeFileSync(fp, html, 'utf8');
    return { filename, status: 'MODIFIED', changes, notes };
  } else {
    return { filename, status: 'NO CHANGE', changes: [], notes };
  }
}

console.log('=== Processing NOTEO files ===');
for (const f of NOTEO_FILES) {
  const result = processFile(f, true);
  const label = result.status === 'MODIFIED' ? `MODIFIED [${result.changes.join(', ')}]` : result.status;
  console.log(`${label}: ${result.filename}`);
  if (result.notes && result.notes.length > 0) {
    result.notes.forEach(n => console.log(`  NOTE: ${n}`));
  }
}

console.log('\n=== Processing DORSO files ===');
for (const f of DORSO_FILES) {
  const result = processFile(f, false);
  const label = result.status === 'MODIFIED' ? `MODIFIED [${result.changes.join(', ')}]` : result.status;
  console.log(`${label}: ${result.filename}`);
  if (result.notes && result.notes.length > 0) {
    result.notes.forEach(n => console.log(`  NOTE: ${n}`));
  }
}

console.log('\nDone!');

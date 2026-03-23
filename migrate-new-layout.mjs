// migrate-new-layout.mjs
// Converts all old-style individual product pages to the new olleo-bottles.html layout.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, 'products');

const SKIP = new Set([
  'olleo-bottles.html','olleo-doses.html','noteo-proteins.html',
  'noteo-flours.html','noteo-choco-creams.html','dorso-scrubs.html',
  'dorso-masks.html','dorso-body-care.html','dorso-body-oils.html'
]);

// ─── Brand configs ────────────────────────────────────────────────────────────

const OLLEO = {
  brand:'OLLEO', badgeBg:'#9B6200',
  gradient:'linear-gradient(120deg,#2D1800 0%,#7A4500 55%,#C8922A 100%)',
  radial:'rgba(255,200,60,0.18)',
  logo:'../images/olleo/olleo-logo.png', logoAlt:'OLLEO',
  imgBg:'#EEF2EB', imgShadowRgb:'65,98,65',
  variantHoverBg:'rgba(65,98,65,0.04)', variantSelBg:'rgba(65,98,65,0.07)', variantSelBorder:'rgba(65,98,65,0.2)',
  qtyBorder:'#D7E4D4', qtyColor:'#344B34', qtyHoverBg:'#EEF2EB', qtyHoverBorder:'#5F7E5F',
  tabActiveColor:'#344B34', tabActiveBorder:'#C8922A',
  accent:'#C8922A', btnBg:'#C8922A', btnShadowRgb:'200,146,42',
  pcBg:'#FFF8F4', pcActiveBg:'#FFF3EC', pcActiveBorder:'#C8922A',
  subColor:'#C8922A', subFocusBorder:'#C8922A', successBg:'#5F7E5F',
  scrollThumb:'#5F7E5F', breadcrumbColor:'#A97520',
  checkFill:'#5F7E5F', variantNameColor:'#2F412E', variantImgBg:'#EEF2EB', headingColor:'#2F412E',
  checkmarks:['Студено пресовано','Без консерванти','Богато на Омега 3 &amp; 6','100% Натурално','Произведено в България','Без ГМО'],
  tabs:['Съставки','Начин на употреба'], tabIds:['tab-ing','tab-use'],
  hasCart:true, cartBrand:'OLLEO',
};

const NOTEO_PROTEIN = {
  ...OLLEO,
  brand:'NOTEO', badgeBg:'#18988B',
  gradient:'linear-gradient(120deg,#042420 0%,#0A5E56 55%,#18988B 100%)',
  radial:'rgba(94,196,188,0.2)',
  logo:'../images/noteo/NOTEO-logo.png', logoAlt:'NOTEO',
  imgBg:'#D0F0EE', imgShadowRgb:'24,152,139',
  variantHoverBg:'rgba(24,152,139,0.04)', variantSelBg:'rgba(24,152,139,0.07)', variantSelBorder:'rgba(24,152,139,0.2)',
  qtyBorder:'#9ADAD6', qtyColor:'#083F3B', qtyHoverBg:'#D0F0EE', qtyHoverBorder:'#18988B',
  tabActiveColor:'#083F3B', tabActiveBorder:'#18988B',
  accent:'#18988B', btnBg:'#18988B', btnShadowRgb:'24,152,139',
  pcBg:'#F4FFFE', pcActiveBg:'#EDFAF9', pcActiveBorder:'#18988B',
  subColor:'#18988B', subFocusBorder:'#18988B', successBg:'#0F6B62',
  scrollThumb:'#18988B', breadcrumbColor:'#18988B',
  checkFill:'#18988B', variantNameColor:'#083F3B', variantImgBg:'#D0F0EE', headingColor:'#083F3B',
  checkmarks:['100% Растителен','Без глутен','Без лактоза','Без ГМО','Произведено в България','Богат на протеин'],
  cartBrand:'NOTEO',
};

const NOTEO_FLOUR = {
  ...NOTEO_PROTEIN,
  checkmarks:['100% Натурален','Студено смлян','Без добавки','Без ГМО','Произведено в България','Богат на фибри'],
};

const NOTEO_CHOCO = {
  ...NOTEO_PROTEIN,
  checkmarks:['100% Растителен','Без добавена захар','Без глутен','Без ГМО','Произведено в България','Богат на протеин'],
};

const DORSO = {
  brand:"D'ORSO", badgeBg:'#7B3A60',
  gradient:'linear-gradient(120deg,#1A0010 0%,#4A1838 55%,#7B3A60 100%)',
  radial:'rgba(196,123,142,0.2)',
  logo:'../images/dorso/dorso-logo.png', logoAlt:"D'ORSO",
  imgBg:'#F5E0EC', imgShadowRgb:'123,58,96',
  variantHoverBg:'rgba(123,58,96,0.04)', variantSelBg:'rgba(123,58,96,0.07)', variantSelBorder:'rgba(123,58,96,0.2)',
  qtyBorder:null, qtyColor:null, qtyHoverBg:null, qtyHoverBorder:null,
  tabActiveColor:'#3B2030', tabActiveBorder:'#7B3A60',
  accent:'#7B3A60', btnBg:'#7B3A60', btnShadowRgb:'123,58,96',
  pcBg:null, pcActiveBg:null, pcActiveBorder:null,
  subColor:null, subFocusBorder:null, successBg:null,
  scrollThumb:'#7B3A60', breadcrumbColor:'#7B3A60',
  checkFill:'#7B3A60', variantNameColor:'#3B2030', variantImgBg:'#F5E0EC', headingColor:'#3B2030',
  checkmarks:['Студено пресовано','100% Натурално','Без парабени','Произведено в България'],
  tabs:['Описание','Употреба'], tabIds:['tab-desc','tab-use'],
  hasCart:false, cartBrand:null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBrandConfig(filename) {
  if (filename.startsWith('dorso-')) return DORSO;
  if (filename.startsWith('noteo-protein-')) return NOTEO_PROTEIN;
  if (filename.startsWith('noteo-flax-flour-') || filename.startsWith('noteo-walnut-flour-')) return NOTEO_FLOUR;
  if (filename.startsWith('noteo-choco-cream-')) return NOTEO_CHOCO;
  return OLLEO;
}

function getParentPage(filename) {
  if (filename.startsWith('dorso-oil-')) return { file:'dorso-body-oils.html', label:'Олио за тяло' };
  if (filename.startsWith('dorso-scrub-')) return { file:'dorso-scrubs.html', label:'Скрабове' };
  if (filename.startsWith('dorso-mask-')) return { file:'dorso-masks.html', label:'Маски' };
  if (filename.startsWith('dorso-')) return { file:'dorso-body-care.html', label:'Грижа за тяло' };
  if (filename.startsWith('noteo-protein-')) return { file:'noteo-proteins.html', label:'Протеини' };
  if (filename.startsWith('noteo-flax-flour-') || filename.startsWith('noteo-walnut-flour-')) return { file:'noteo-flours.html', label:'Брашна' };
  if (filename.startsWith('noteo-choco-cream-')) return { file:'noteo-choco-creams.html', label:'Шоколадови кремове' };
  if (filename.endsWith('-8ml.html') || filename.endsWith('-14ml.html') || filename === 'doses-10x8ml.html') return { file:'olleo-doses.html', label:'Дози' };
  return { file:'olleo-bottles.html', label:'Бутилки' };
}

function getHeaderSubtitle(filename) {
  if (filename.startsWith('dorso-oil-')) return 'Олио за тяло';
  if (filename.startsWith('dorso-scrub-')) return 'Натурален скраб';
  if (filename.startsWith('dorso-mask-')) return 'Натурална маска';
  if (filename.startsWith('dorso-body-lotion')) return 'Лосион за тяло';
  if (filename.startsWith('dorso-massage-')) return 'Масажен балсам';
  if (filename.startsWith('dorso-booster-')) return 'Бустер серум';
  if (filename.startsWith('noteo-protein-')) return 'Растителен протеин';
  if (filename.startsWith('noteo-flax-flour-') || filename.startsWith('noteo-walnut-flour-')) return 'Натурално брашно';
  if (filename.startsWith('noteo-choco-cream-')) return 'Шоколадов крем';
  if (filename.endsWith('-8ml.html') || filename.endsWith('-14ml.html') || filename === 'doses-10x8ml.html') return 'Студено пресовано масло';
  return 'Студено пресовано масло';
}

function extractText(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1].trim() : '';
}

function extractData(html) {
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/);
  const pageTitle = titleM ? titleM[1].trim() : '';

  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const productName = h1M ? h1M[1].replace(/<[^>]*>/g, '').trim() : '';

  // size — first <p class="text-gray-400 ...">
  const sizeM = html.match(/<p class="text-gray-400 font-body text-sm[^"]*">([\s\S]*?)<\/p>/);
  const size = sizeM ? sizeM[1].trim() : '';

  // price — first occurrence of digits.digits&nbsp;лв.
  const priceM = html.match(/(\d+\.\d{2})&nbsp;лв\./);
  const price = priceM ? priceM[1] : null;

  // main product image — the large one with object-contain p-8
  const imgM = html.match(/<img src="(\.\.\/images\/[^"]+)"[^>]*class="w-full h-full object-contain p-8"/);
  let imgSrc = imgM ? imgM[1] : null;
  if (!imgSrc) {
    // fallback: sticky lg:top-20 image area
    const imgM2 = html.match(/lg:aspect-square[^>]*>[\s\S]*?<img src="(\.\.\/images\/[^"]+)"/);
    imgSrc = imgM2 ? imgM2[1] : null;
  }
  if (!imgSrc) {
    const imgM3 = html.match(/src="(\.\.\/images\/[^"]+\.png)"/);
    imgSrc = imgM3 ? imgM3[1] : '../images/agros-logo.png';
  }
  const imgAltM = html.match(/<img src="[^"]*" alt="([^"]+)"[^>]*class="w-full h-full object-contain p-8"/);
  const imgAlt = imgAltM ? imgAltM[1] : productName;

  // description — text after <h2...>Описание</h2>
  const descM = html.match(/<h2[^>]*>[^<]*Описание[^<]*<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const description = descM ? descM[1].trim() : '';

  // ingredients — after <h2...>Съставки</h2>
  const ingM = html.match(/<h2[^>]*>[^<]*Съставки[^<]*<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const ingredients = ingM ? ingM[1].trim() : '';

  // usage — after <h2...>Начин на употреба</h2>
  const useM = html.match(/<h2[^>]*>[^<]*Начин на употреба[^<]*<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const usage = useM ? useM[1].trim() : '';

  return { pageTitle, productName, size, price, imgSrc, imgAlt, description, ingredients, usage };
}

// ─── HTML generator ───────────────────────────────────────────────────────────

const FOOTER = `  <footer class="mt-20 bg-forest-900">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div class="lg:col-span-1">
          <a href="../index.html" class="mb-5 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 rounded-lg">
            <img src="../images/agros-logo.png" alt="Agros" class="h-10 w-auto" style="filter: brightness(0) invert(1);" />
          </a>
          <p class="text-forest-300 font-body text-sm mb-6" style="line-height:1.75;">Натурални продукти за здраве и красота. Произведено от Agros&nbsp;98, Варна, България.</p>
          <div class="flex items-center gap-2.5">
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" style="background:rgba(255,255,255,0.07);" aria-label="Facebook">
              <svg class="w-4 h-4 text-forest-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" style="background:rgba(255,255,255,0.07);" aria-label="YouTube">
              <svg class="w-4 h-4 text-forest-300" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
            </a>
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" style="background:rgba(255,255,255,0.07);" aria-label="Instagram">
              <svg class="w-4 h-4 text-forest-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-cream-100 font-body font-semibold text-sm tracking-wide mb-5">Продукти</h4>
          <ul class="space-y-3">
            <li><a href="../brands.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">OLLEO Масла</a></li>
            <li><a href="../brands.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">NOTEO Брашна</a></li>
            <li><a href="../brands.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">NOTEO Протеини</a></li>
            <li><a href="../brands.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">D'ORSO Козметика</a></li>
            <li><a href="../brands.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">Всички продукти</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-cream-100 font-body font-semibold text-sm tracking-wide mb-5">Информация</h4>
          <ul class="space-y-3">
            <li><a href="../about.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">За нас</a></li>
            <li><a href="../delivery.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">Доставка</a></li>
            <li><a href="../terms.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">Общи условия</a></li>
            <li><a href="../privacy.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">Политика за поверителност</a></li>
            <li><a href="../cookies.html" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">Информация за бисквитки</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-cream-100 font-body font-semibold text-sm tracking-wide mb-5">Контакти</h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="text-forest-300 font-body text-sm" style="line-height:1.6;">ул. Цар Иван Шишман 36,<br>Варна, България</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.58 4.5 2 2 0 0 1 3.55 2.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.88-.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.64z"/></svg>
              <a href="tel:+359888858996" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">+359 888 858 996</a>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:office@agros.net" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">office@agros.net</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style="border-top:1px solid rgba(255,255,255,0.07);">
        <p class="text-forest-500 font-body text-xs">© 2026 Agros Grain Group. Всички права запазені.</p>
        <div class="flex items-center gap-5">
          <a href="../privacy.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Поверителност</a>
          <a href="../cookies.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Бисквитки</a>
          <a href="../terms.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Условия</a>
        </div>
      </div>
    </div>
  </footer>`;

function generatePage(filename, data, cfg) {
  const { pageTitle, productName, size, price, imgSrc, imgAlt, description, ingredients, usage } = data;
  const parent = getParentPage(filename);
  const subtitle = getHeaderSubtitle(filename);
  const isDorso = !cfg.hasCart;

  // CSS for variant rows + qty btns (cart brands only) + tabs + purchase cards
  const variantCSS = `
    .variant-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;cursor:pointer;border:1.5px solid transparent;transition:background .15s ease,border-color .15s ease;}
    .variant-row:hover{background:${cfg.variantHoverBg};}
    .variant-row.selected{background:${cfg.variantSelBg};border-color:${cfg.variantSelBorder};}
    .tab-btn{padding:8px 0;font-size:.85rem;font-weight:600;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer;background:none;border-top:none;border-left:none;border-right:none;font-family:'Inter',sans-serif;transition:color .2s,border-color .2s;}
    .tab-btn.active{color:${cfg.tabActiveColor};border-bottom-color:${cfg.tabActiveBorder};}
    .tab-content{display:none;}.tab-content.active{display:block;}`;

  const qtyCSS = !isDorso ? `
    .qty-btn{width:26px;height:26px;border-radius:50%;border:1.5px solid ${cfg.qtyBorder};background:white;color:${cfg.qtyColor};font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s ease,border-color .15s ease;}
    .qty-btn:hover{background:${cfg.qtyHoverBg};border-color:${cfg.qtyHoverBorder};}
    .qty-val{min-width:22px;text-align:center;font-weight:600;font-size:.85rem;}` : '';

  const purchaseCSS = !isDorso ? `
    .purchase-card{border-radius:12px;border:1.5px solid #E5E7EB;padding:14px 16px;cursor:pointer;background:${cfg.pcBg};transition:border-color .15s ease,background .15s ease;user-select:none;}
    .purchase-card.active{border-color:${cfg.pcActiveBorder};background:${cfg.pcActiveBg};}
    .purchase-radio{width:20px;height:20px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;}
    .purchase-card.active .purchase-radio{border-color:#1A1A1A;background:#1A1A1A;}
    .purchase-radio-dot{width:8px;height:8px;border-radius:50%;background:white;opacity:0;transition:opacity .15s;}
    .purchase-card.active .purchase-radio-dot{opacity:1;}
    .sub-freq-select{width:100%;font-family:'Inter',sans-serif;font-size:.875rem;font-weight:500;color:#1A1A1A;background:white;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 40px 10px 14px;appearance:none;-webkit-appearance:none;cursor:pointer;outline:none;box-shadow:0 1px 4px rgba(0,0,0,.06);}
    .sub-freq-select:focus{border-color:${cfg.subFocusBorder};}` : '';

  // Checkmarks HTML
  const checkmarksHTML = cfg.checkmarks.map(c =>
    `<div class="flex items-center gap-2"><svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="${cfg.checkFill}"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="font-body text-sm text-gray-600">${c}</span></div>`
  ).join('\n            ');

  // Tab labels & content
  const tab0Label = cfg.tabs[0]; // Съставки / Описание
  const tab1Label = cfg.tabs[1]; // Начин на употреба / Употреба
  const tab0Id = cfg.tabIds[0];
  const tab1Id = cfg.tabIds[1];
  const tab0Content = isDorso ? (description || 'Натурален продукт от студено пресовани масла.') : (ingredients || 'Вижте опаковката за пълен списък на съставките.');
  const tab1Content = usage || 'Вижте указанията на опаковката.';

  // Description text (above tabs)
  const descText = description || '';

  // Variant row HTML
  const variantThumbHTML = `<div style="width:44px;height:52px;background:${cfg.variantImgBg};border-radius:8px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;"><img src="${imgSrc}" alt="${productName}" style="width:100%;height:100%;object-fit:contain;padding:3px;" /></div>`;
  const variantInfoHTML = `<div style="flex:1;min-width:0;"><div style="font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:600;color:${cfg.variantNameColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${productName}</div><div style="font-family:'Inter',sans-serif;font-size:.7rem;color:#9CA3AF;margin-top:1px;">${size}</div></div>`;

  let variantRowInner;
  if (isDorso) {
    variantRowInner = `${variantThumbHTML}${variantInfoHTML}<span style="font-size:.72rem;font-family:'Inter',sans-serif;color:${cfg.accent};font-weight:600;white-space:nowrap;">Проф. употреба</span>`;
  } else {
    variantRowInner = `${variantThumbHTML}${variantInfoHTML}<div style="font-family:'Inter',sans-serif;font-size:.85rem;font-weight:700;color:${cfg.variantNameColor};white-space:nowrap;margin-right:6px;">${price}&nbsp;лв.</div><div style="display:flex;align-items:center;gap:5px;" onclick="event.stopPropagation()"><button class="qty-btn" onclick="chQty('p',-1)">−</button><span class="qty-val" id="q-p">0</span><button class="qty-btn" onclick="chQty('p',1)">+</button></div>`;
  }

  // Purchase widget (for cart brands)
  const purchaseWidget = !isDorso ? `
            <div class="flex flex-col gap-2 mt-4">
              <div id="card-single" class="purchase-card active" onclick="setPurchaseMode('single')">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="purchase-radio"><div class="purchase-radio-dot"></div></div>
                    <span class="font-body font-medium text-gray-800 text-sm">Еднократна поръчка</span>
                  </div>
                  <span id="price-single" class="font-body font-bold text-gray-900 text-sm whitespace-nowrap">—</span>
                </div>
              </div>
              <div id="card-sub" class="purchase-card" onclick="setPurchaseMode('subscribe')">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="purchase-radio"><div class="purchase-radio-dot"></div></div>
                    <span class="font-body font-medium text-gray-800 text-sm">Абонирай се и <strong style="color:${cfg.subColor};">спести 15%</strong></span>
                  </div>
                  <div class="text-right">
                    <div id="price-orig" class="font-body text-xs text-gray-400 line-through" style="min-height:14px;"></div>
                    <span id="price-sub" class="font-body font-bold text-sm" style="color:${cfg.subColor};">—</span>
                  </div>
                </div>
                <div id="sub-panel" style="display:none;margin-top:12px;" onclick="event.stopPropagation()">
                  <p class="font-body text-xs text-gray-500 mb-2">Избери честота на доставка</p>
                  <div class="relative">
                    <select id="sub-freq" onchange="subFreq=this.value" class="sub-freq-select">
                      <option value="2">Доставка на всеки 2 седмици</option>
                      <option value="3">Доставка на всеки 3 седмици</option>
                      <option value="4" selected>Доставка на всеки 4 седмици (популярно)</option>
                      <option value="5">Доставка на всеки 5 седмици</option>
                      <option value="6">Доставка на всеки 6 седмици</option>
                      <option value="7">Доставка на всеки 7 седмици</option>
                      <option value="8">Доставка на всеки 8 седмици</option>
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  <div class="flex flex-col gap-2 mt-3">
                    <div class="flex items-start gap-2">
                      <svg class="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                      <span class="font-body text-xs text-gray-500">Можеш да прекратиш абонамента си по всяко време.</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <svg class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:#5F7E5F;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      <span class="font-body text-xs text-gray-500">Можеш да променяш честотата на доставка, количеството и вкуса на продуктите през профила си.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>` : '';

  // CTA button
  const ctaButton = isDorso
    ? `<a href="../contact.html" class="btn mt-3 w-full flex items-center justify-center gap-2 text-white font-body font-semibold px-6 py-3.5 rounded-full focus-visible:outline-none focus-visible:ring-2" style="background:${cfg.btnBg};box-shadow:0 4px 20px rgba(${cfg.btnShadowRgb},0.40),0 1px 4px rgba(${cfg.btnShadowRgb},0.20);text-decoration:none;"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>Изпрати запитване</a>`
    : `<button id="add-btn" onclick="addToCart(this)" class="btn mt-3 w-full flex items-center justify-center gap-2 text-white font-body font-semibold px-6 py-3.5 rounded-full focus-visible:outline-none focus-visible:ring-2" style="background:${cfg.btnBg};box-shadow:0 4px 20px rgba(${cfg.btnShadowRgb},0.40),0 1px 4px rgba(${cfg.btnShadowRgb},0.20);"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Добави в количка</button>`;

  // D'ORSO professional badge
  const professionalBadge = isDorso
    ? `<span class="inline-flex w-fit items-center text-[11px] font-body font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" style="background:#F5E0EC;color:${cfg.accent};border:1px solid #C47B8E;">Само за проф. употреба</span>` : '';

  // JavaScript
  const js = isDorso ? `
<script>
const VARIANTS=[{id:'p',name:'${productName.replace(/'/g,"\\'")}',size:'${size}',img:'${imgSrc}'}];
let selectedId='p';
function render(){document.getElementById('variant-list').innerHTML=VARIANTS.map(v=>\`<div class="variant-row \${selectedId===v.id?'selected':''}" onclick="select('\${v.id}','\${v.img}')">${variantRowInner.replace(/`/g,'\\`').replace(/\${/g,'\\${')}</div>\`).join('');}
function select(id,img){selectedId=id;const el=document.getElementById('main-img');el.style.opacity='0';setTimeout(()=>{el.src=img;el.style.opacity='1';},200);render();}
function switchTab(btn,id){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));btn.classList.add('active');document.getElementById(id).classList.add('active');}
render();
</script>` : `
<script>
const VARIANTS=[{id:'p',name:'${productName.replace(/'/g,"\\'")}',size:'${size}',price:'${price}',img:'${imgSrc}',vol:''}];
let qty={p:0};let purchaseMode='single';let subFreq='4';let selectedId='p';
function calcTotal(){return qty['p']*parseFloat('${price}');}
function updatePurchaseWidget(){
  const total=calcTotal(),sub=total*0.85;
  document.getElementById('price-single').textContent=total>0?total.toFixed(2)+' лв.':'—';
  document.getElementById('price-orig').textContent=total>0?total.toFixed(2)+' лв.':'';
  document.getElementById('price-sub').textContent=total>0?sub.toFixed(2)+' лв.':'—';
  document.getElementById('card-single').classList.toggle('active',purchaseMode==='single');
  document.getElementById('card-sub').classList.toggle('active',purchaseMode==='subscribe');
  document.getElementById('sub-panel').style.display=purchaseMode==='subscribe'?'block':'none';
}
function setPurchaseMode(mode){purchaseMode=mode;updatePurchaseWidget();}
function render(){
  const q=qty['p'];
  document.getElementById('variant-list').innerHTML=\`<div class="variant-row selected" onclick="select('p','${imgSrc}')">${variantRowInner.replace(/`/g,'\\`').replace(/\${/g,'\\${').replace(/0<\/span>/,'<span class="qty-val" id="q-p">\${q}</span>').replace(/id="q-p">0/,'id="q-p">\${q}')}</div>\`;
}
function select(id,img){selectedId=id;const el=document.getElementById('main-img');el.style.opacity='0';setTimeout(()=>{el.src=img;el.style.opacity='1';},200);render();}
function chQty(id,d){qty[id]=Math.max(0,qty[id]+d);const el=document.getElementById('q-'+id);if(el)el.textContent=qty[id];updatePurchaseWidget();}
function switchTab(btn,id){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));btn.classList.add('active');document.getElementById(id).classList.add('active');}
function addToCart(btn){
  if(qty['p']>0&&typeof AgrosCart!=='undefined'){
    const isSub=purchaseMode==='subscribe';
    const pr=isSub?(parseFloat('${price}')*0.85).toFixed(2):'${price}';
    const nm=isSub?'${cfg.cartBrand} ${productName.replace(/'/g,"\\'")} (Абонамент)':'${cfg.cartBrand} ${productName.replace(/'/g,"\\'")}';
    for(let i=0;i<qty['p'];i++)AgrosCart.addItem(null,nm,'${size}',pr,'${imgSrc}','${cfg.cartBrand}');
    const orig=btn.innerHTML;btn.innerHTML='✓ Добавено';btn.style.background='${cfg.successBg}';btn.disabled=true;
    setTimeout(()=>{btn.innerHTML=orig;btn.style.background='${cfg.btnBg}';btn.disabled=false;},1400);
  }
}
render();updatePurchaseWidget();
</script>`;

  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: { extend: { colors: {
        forest: { 50:'#EEF2EB',100:'#D7E4D4',200:'#B0CAAD',300:'#82B27F',400:'#6C9C6A',500:'#5F7E5F',600:'#506E4E',700:'#416241',800:'#344B34',900:'#2F412E' },
        cream:  { 50:'#FEFCF8',100:'#F7F3EC',200:'#EDE5D5',300:'#DDD0BC' },
        honey:  { 300:'#F0C96A',400:'#E4A94A',500:'#C8922A',600:'#A97520',700:'#9B6C14' },
        terra:  { 100:'#D0F0EE',200:'#9ADAD6',500:'#18988B',700:'#0F6B62',800:'#083F3B' },
        dorso:  { 100:'#F5E0EC',400:'#C47B8E',600:'#7B3A60',700:'#5A2A4A',800:'#3B2030' },
      }, fontFamily: { display:['"Montserrat"','Georgia','serif'], body:['Inter','system-ui','sans-serif'] } } },
    };
  </script>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:'Inter',system-ui,sans-serif;background-color:#F7F3EC;color:#1A1A1A}
    h1,h2,h3,.font-display{font-family:'Montserrat',sans-serif}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#F7F3EC}::-webkit-scrollbar-thumb{background:${cfg.scrollThumb};border-radius:4px}
    .nav-link{position:relative}.nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:#C8922A;transition:width .25s ease}.nav-link:hover::after,.nav-link:focus-visible::after{width:100%}
    .btn{transition:transform .2s cubic-bezier(.34,1.56,.64,1),opacity .2s ease,background-color .2s ease}.btn:hover{transform:translateY(-1px)}.btn:active{transform:translateY(0);opacity:.9}
    html{scroll-behavior:smooth}${variantCSS}${qtyCSS}${purchaseCSS}
  </style>
</head>
<body>

  <!-- Announcement bar -->
  <div class="bg-forest-700 text-cream-100 text-center py-2.5 text-xs font-body tracking-wide" style="letter-spacing:0.04em;">
    🌿&nbsp; Безплатна доставка при поръчки над&nbsp;<strong>25.57&nbsp;€</strong> <span style="font-size:0.8em;opacity:0.75;">(50&nbsp;лв.)</span>&nbsp;&nbsp;·&nbsp;&nbsp;Произведено в България от Agros&nbsp;98
  </div>

  <!-- Nav -->
  <nav class="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-200"
       style="box-shadow: 0 1px 0 rgba(65,98,65,0.06), 0 4px 24px rgba(65,98,65,0.05);">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div class="flex items-center justify-between h-16">
        <a href="../index.html" class="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg">
          <img src="../images/agros-logo.png" alt="Agros" class="h-12 w-auto" />
        </a>
        <div class="hidden md:flex items-center gap-7">
          <a href="../brands.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Продукти</a>
          <a href="../about.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">За нас</a>
          <a href="../blog.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Блог</a>
          <a href="../contact.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Контакти</a>
        </div>
        <div class="flex items-center gap-1">
          <button class="p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Търсене">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button class="relative p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Количка">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-honey-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none" style="display:none;">0</span>
          </button>
          <button class="md:hidden p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Меню">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <div>
    <div>
      <!-- Brand header -->
      <div style="background:${cfg.gradient};padding:28px 0 32px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 75% 50%,${cfg.radial} 0%,transparent 65%);pointer-events:none;"></div>
        <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
          <span style="display:inline-block;background:rgba(0,0,0,0.30);color:rgba(255,255,255,0.88);font-size:10px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">${subtitle}</span>
          <div><img src="${cfg.logo}" alt="${cfg.logoAlt}" style="height:36px;width:auto;filter:brightness(0) invert(1);opacity:0.92;" /></div>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10" style="padding-top:16px;padding-bottom:8px;">
        <nav class="flex items-center gap-2 text-xs font-body text-gray-400">
          <a href="../index.html" class="hover:text-forest-700 transition-colors duration-200">Начало</a>
          <span>/</span>
          <a href="../brands.html" class="hover:text-forest-700 transition-colors duration-200">Продукти</a>
          <span>/</span>
          <a href="${parent.file}" class="hover:text-forest-700 transition-colors duration-200" style="color:${cfg.breadcrumbColor};font-weight:500;">${cfg.brand}</a>
          <span>/</span>
          <span class="text-gray-600">${productName}</span>
        </nav>
      </div>

      <!-- Product grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10" style="padding-top:16px;padding-bottom:48px;">

        <!-- Image -->
        <div class="rounded-2xl overflow-hidden flex items-center justify-center lg:sticky lg:top-20 lg:aspect-square"
             style="background:${cfg.imgBg};box-shadow:0 4px 30px rgba(${cfg.imgShadowRgb},0.10),0 1px 6px rgba(0,0,0,0.05);">
          <img id="main-img" src="${imgSrc}" alt="${imgAlt}"
               class="w-full h-full object-contain p-10" style="max-height:500px;transition:opacity 0.22s ease;" />
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-5">

          <!-- Badge(s) -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex w-fit items-center text-white text-[11px] font-body font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" style="background:${cfg.badgeBg};">${cfg.brand}</span>
            ${professionalBadge}
          </div>

          <!-- Title + desc -->
          <div>
            <h1 class="font-display font-bold leading-tight mb-3" style="font-size:clamp(1.5rem,2.5vw,2rem);letter-spacing:-0.025em;color:${cfg.headingColor};">${productName}</h1>
            ${descText ? `<p class="font-body text-gray-500 text-sm" style="line-height:1.7;">${descText}</p>` : ''}
          </div>

          <!-- Checkmarks -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            ${checkmarksHTML}
          </div>

          <!-- Tabs -->
          <div style="border-bottom:1px solid #EDE5D5;">
            <div class="flex gap-6">
              <button class="tab-btn active" onclick="switchTab(this,'${tab0Id}')">${tab0Label}</button>
              <button class="tab-btn" onclick="switchTab(this,'${tab1Id}')">${tab1Label}</button>
            </div>
          </div>
          <div>
            <div id="${tab0Id}" class="tab-content active">
              <p class="font-body text-gray-600 text-sm" style="line-height:1.75;">${tab0Content}</p>
            </div>
            <div id="${tab1Id}" class="tab-content">
              <p class="font-body text-gray-600 text-sm" style="line-height:1.75;">${tab1Content}</p>
            </div>
          </div>

          <!-- Variant + CTA -->
          <div>
            <h3 class="font-display font-semibold text-sm mb-3" style="color:${cfg.headingColor};">Продукт</h3>
            <div id="variant-list" class="flex flex-col gap-1.5"></div>
            ${purchaseWidget}
            ${ctaButton}
          </div>

        </div>
      </div>
    </div>
  </div>

${FOOTER}

${js}
<script src="/auth.js"></script>
<script src="/cart.js"></script>
<script src="../nav-dropdown.js"></script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.html') && !SKIP.has(f));
let converted = 0;
let skipped = 0;

for (const filename of files) {
  const filepath = path.join(PRODUCTS_DIR, filename);
  const html = fs.readFileSync(filepath, 'utf8');

  // Double-check it's actually old style (no gradient header in body)
  if (html.includes('background:linear-gradient') || html.includes('background: linear-gradient')) {
    console.log(`  SKIP (already new): ${filename}`);
    skipped++;
    continue;
  }

  const cfg = getBrandConfig(filename);
  const data = extractData(html);

  if (!data.productName) {
    console.log(`  WARN no h1 found: ${filename}`);
    skipped++;
    continue;
  }

  // For NOTEO individual pages that don't have a price, skip cart generation
  if (cfg.hasCart && !data.price) {
    console.log(`  WARN no price found for cart page: ${filename}, setting price to 0.00`);
    data.price = '0.00';
  }

  const newHtml = generatePage(filename, data, cfg);
  fs.writeFileSync(filepath, newHtml, 'utf8');
  console.log(`  ✓ converted: ${filename}`);
  converted++;
}

console.log(`\nDone. Converted: ${converted}, Skipped: ${skipped}`);

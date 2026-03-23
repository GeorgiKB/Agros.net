/**
 * update-product-layout.mjs
 * Copies the nav and footer layout from index.html to all product pages.
 * Run: node update-product-layout.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, 'products');

/* ── New announcement bar ── */
const NEW_ANNOUNCEMENT = `  <!-- Announcement bar -->
  <div class="bg-forest-700 text-cream-100 text-center py-2.5 text-xs font-body tracking-wide" style="letter-spacing:0.04em;">
    🌿&nbsp; Безплатна доставка при поръчки над&nbsp;<strong>25.57&nbsp;€</strong> <span style="font-size:0.8em;opacity:0.75;">(50&nbsp;лв.)</span>&nbsp;&nbsp;·&nbsp;&nbsp;Произведено в България от Agros&nbsp;98
  </div>`;

/* ── New nav (no leading comment — it's added by regex replacement) ── */
const NEW_NAV = `  <!-- Nav -->
  <nav class="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-200"
       style="box-shadow: 0 1px 0 rgba(65,98,65,0.06), 0 4px 24px rgba(65,98,65,0.05);">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <a href="../index.html" class="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg">
          <img src="../images/agros-logo.png" alt="Agros" class="h-12 w-auto" />
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-7">
          <a href="../brands.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Продукти</a>
          <a href="../about.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">За нас</a>
          <a href="../blog.html"  class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Блог</a>
          <a href="../contact.html" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Контакти</a>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-1">
          <button class="p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Търсене">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button class="relative p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Количка">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-honey-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none" style="display:none;">0</span>
          </button>
          <!-- Mobile hamburger -->
          <button class="md:hidden p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Меню">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  </nav>`;

/* ── New footer ── */
const NEW_FOOTER = `  <!-- Footer -->
  <footer class="mt-20 bg-forest-900">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        <!-- Brand -->
        <div class="lg:col-span-1">
          <a href="../index.html" class="mb-5 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 rounded-lg">
            <img src="../images/agros-logo.png" alt="Agros" class="h-10 w-auto" style="filter: brightness(0) invert(1);" />
          </a>
          <p class="text-forest-300 font-body text-sm mb-6" style="line-height:1.75;">
            Натурални продукти за здраве и красота. Произведено от Agros&nbsp;98, Варна, България.
          </p>
          <div class="flex items-center gap-2.5">
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
               style="background:rgba(255,255,255,0.07);" aria-label="Facebook">
              <svg class="w-4 h-4 text-forest-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
               style="background:rgba(255,255,255,0.07);" aria-label="YouTube">
              <svg class="w-4 h-4 text-forest-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </a>
            <a href="javascript:void(0)" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
               style="background:rgba(255,255,255,0.07);" aria-label="Instagram">
              <svg class="w-4 h-4 text-forest-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Products -->
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

        <!-- Info -->
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

        <!-- Contact -->
        <div>
          <h4 class="text-cream-100 font-body font-semibold text-sm tracking-wide mb-5">Контакти</h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="text-forest-300 font-body text-sm" style="line-height:1.6;">ул. Цар Иван Шишман 36,<br>Варна, България</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.58 4.5 2 2 0 0 1 3.55 2.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.88-.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.64z"/>
              </svg>
              <a href="tel:+359888858996" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">+359 888 858 996</a>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-honey-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:office@agros.net" class="text-forest-300 font-body text-sm hover:text-cream-100 transition-colors duration-200">office@agros.net</a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
           style="border-top:1px solid rgba(255,255,255,0.07);">
        <p class="text-forest-500 font-body text-xs">© 2026 Agros Grain Group. Всички права запазені.</p>
        <div class="flex items-center gap-5">
          <a href="../privacy.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Поверителност</a>
          <a href="../cookies.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Бисквитки</a>
          <a href="../terms.html" class="text-forest-500 hover:text-forest-300 font-body text-xs transition-colors duration-200">Условия</a>
        </div>
      </div>

    </div>
  </footer>`;

/* ── Process files ── */
const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.html'));
let updated = 0;
const errors = [];

for (const file of files) {
  const filePath = path.join(PRODUCTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Replace announcement bar
  // Match any div containing the 🌿 emoji (unique to announcement bar)
  content = content.replace(
    /[ \t]*(?:<!--[^>]*Announcement[^>]*-->\s*)?<div[^>]*>\s*🌿[\s\S]*?<\/div>/,
    NEW_ANNOUNCEMENT
  );

  // 2. Replace sticky nav (including any preceding <!-- Nav --> comment)
  content = content.replace(
    /[ \t]*(?:<!--\s*Nav\s*-->\s*)?<nav\s+class="sticky top-0 z-50[^"]*"[\s\S]*?<\/nav>/,
    '\n' + NEW_NAV
  );

  // 3. Replace footer — match last <footer ...> ... </footer> block
  const lastFooterStart = content.lastIndexOf('<footer');
  const lastFooterEnd = content.lastIndexOf('</footer>') + '</footer>'.length;
  if (lastFooterStart !== -1 && lastFooterEnd > lastFooterStart) {
    content = content.slice(0, lastFooterStart) + NEW_FOOTER + content.slice(lastFooterEnd);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updated++;
    console.log(`✓ ${file}`);
  } else {
    errors.push(file);
    console.log(`⚠ No changes: ${file}`);
  }
}

console.log(`\nDone! Updated ${updated}/${files.length} files.`);
if (errors.length) {
  console.log(`No changes made to: ${errors.join(', ')}`);
}

import { readFileSync, writeFileSync } from 'fs';

const products = [
  { name: 'Студено пресовано слънчогледово олио', size: '750 мл',   slug: 'natural-750ml' },
  { name: 'Слънчогледово олио с лимон',            size: '250 мл',   slug: 'lemon-250ml' },
  { name: 'Слънчогледово олио с чили',             size: '250 мл',   slug: 'chilli-250ml' },
  { name: 'Слънчогледово олио с чесън',            size: '250 мл',   slug: 'garlic-250ml' },
  { name: 'Кориандрово масло',                     size: '250 мл',   slug: 'coriander-250ml' },
  { name: 'Ленено масло студено пресовано',        size: '250 мл',   slug: 'flax-250ml' },
  { name: 'Слънчогледово олио с трюфел',           size: '250 мл',   slug: 'truffle-250ml' },
  { name: 'Олио с Extra Virgin зехтин (50/50)',    size: '250 мл',   slug: 'olive-blend-250ml' },
  { name: 'Омега микс студено пресовано',          size: '250 мл',   slug: 'omega-mix-250ml' },
  { name: 'Студено пресовано олио с лимон',        size: '8 мл',     slug: 'lemon-8ml' },
  { name: 'Студено пресовано олио с чили',         size: '8 мл',     slug: 'chilli-8ml' },
  { name: 'Студено пресовано олио с чесън',        size: '8 мл',     slug: 'garlic-8ml' },
  { name: 'Балсамов оцет',                         size: '8 мл',     slug: 'balsamic-8ml' },
  { name: 'Соев сос',                              size: '8 мл',     slug: 'soy-8ml' },
  { name: 'Студено пресовано слънчогледово олио',  size: '14 мл',    slug: 'natural-14ml' },
  { name: 'OLLEO пликчета с дози',                 size: '10 × 8 мл',slug: 'doses-10x8ml' },
];

let html = readFileSync('index.html', 'utf8');

for (const p of products) {
  const old = `<h3 class="font-display font-semibold text-forest-900 text-[15px] leading-snug mb-1">${p.name}</h3>`;
  const neu = `<h3 class="font-display font-semibold text-forest-900 text-[15px] leading-snug mb-1"><a href="products/${p.slug}.html" class="hover:text-forest-600 transition-colors duration-200">${p.name}</a></h3>`;
  if (html.includes(old)) {
    html = html.replace(old, neu);
    console.log(`✓ Linked: ${p.name} (${p.size})`);
  } else {
    console.warn(`✗ Not found: ${p.name}`);
  }
}

writeFileSync('index.html', html);
console.log('\nDone.');

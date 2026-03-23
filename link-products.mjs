import { readFileSync, writeFileSync } from 'fs';

const links = [
  { img: 'natural.png',       slug: 'natural-750ml' },
  { img: 'lemon.png',         slug: 'lemon-250ml' },
  { img: 'chilli.png',        slug: 'chilli-250ml' },
  { img: 'garlic.png',        slug: 'garlic-250ml' },
  { img: 'coriander-oil.png', slug: 'coriander-250ml' },
  { img: 'flax-oil.png',      slug: 'flax-250ml' },
  { img: 'trufel.png',        slug: 'truffle-250ml' },
  { img: 'olive-oil.png',     slug: 'olive-blend-250ml' },
  { img: 'omega-mix.png',     slug: 'omega-mix-250ml' },
  { img: 'lemon-8ml.png',     slug: 'lemon-8ml' },
  { img: 'chilli-8ml.png',    slug: 'chilli-8ml' },
  { img: 'garlic-8ml.png',    slug: 'garlic-8ml' },
  { img: 'balsamic-8ml.png',  slug: 'balsamic-8ml' },
  { img: 'soy-8ml.png',       slug: 'soy-8ml' },
  { img: 'natural-8ml.png',   slug: 'natural-14ml' },
  { img: 'doses.png',         slug: 'doses-10x8ml' },
];

let html = readFileSync('index.html', 'utf8');

for (const { img, slug } of links) {
  const url = `products/${slug}.html`;
  // Wrap the image area div (the one containing this img) with a link
  // Find: <div class="relative overflow-hidden" style="aspect-ratio:4/3; ...">
  //   <img src="images/olleo/IMG"
  // Replace with an <a> wrapping that div
  const imgPattern = new RegExp(
    `(<div class="relative overflow-hidden" style="aspect-ratio:4/3;[^"]*">\\s*<img src="images/olleo/${img.replace('.', '\\.')}"[^>]*>)`,
    's'
  );
  // Instead, let's add onclick and cursor to the image tag itself
  html = html.replace(
    `src="images/olleo/${img}"`,
    `src="images/olleo/${img}" onclick="location.href='${url}'" style="cursor:pointer"`
  );
}

writeFileSync('index.html', html);
console.log('Done — linked all OLLEO product images to their pages.');

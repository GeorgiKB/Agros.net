const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'products');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const catalog = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  // Look for the product title: <h1 ...>Title</h1>
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  // Look for the price in script or HTML, usually: const pr = 8.50; or <p class="text-3xl...">€8.50</p>
  const priceMatch = content.match(/€\s*([\d.]+)/) || content.match(/const\s+pr\s*=\s*([\d.]+)/);
  if (h1Match) {
    catalog[file] = {
      title: h1Match[1].trim(),
      price: priceMatch ? priceMatch[1] : 'Unknown'
    };
  }
}

fs.writeFileSync('current_prices.json', JSON.stringify(catalog, null, 2));

const fs = require('fs');
const path = require('path');

const fileMap = {
  "natural-750ml.html": 4.59,
  "lemon-250ml.html": 2.49,
  "garlic-250ml.html": 2.49,
  "chilli-250ml.html": 2.49,
  "truffle-250ml.html": 4.99,
  "olive-blend-250ml.html": 3.19,
  "omega-mix-250ml.html": 3.59,
  "natural-14ml.html": 9.99,
  "lemon-8ml.html": 7.99,
  "garlic-8ml.html": 7.99,
  "chilli-8ml.html": 7.99,
  "soy-8ml.html": 7.99,
  "balsamic-8ml.html": 7.99,
  "doses-10x8ml.html": 2.39,
  "noteo-flax-flour-300g.html": 2.89,
  "noteo-walnut-flour-300g.html": 3.79,
  "noteo-protein-chocolate-300g.html": 10.18,
  "noteo-protein-natural-300g.html": 8.12,
  "noteo-protein-raspberry-300g.html": 10.18,
  "noteo-choco-cream-cocoa-65g.html": 27.54,
  "noteo-choco-cream-mint-65g.html": 27.54,
  "noteo-choco-cream-orange-65g.html": 27.54
};

const BGN_RATE = 1.95583;

// 1. Update products/*.html
const productsDir = path.join(__dirname, 'products');
let priceReplacements = {}; // For updating brands.html
for (const [file, eurPrice] of Object.entries(fileMap)) {
  const filePath = path.join(productsDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/"price":\s*"([\d.]+)"/);
  
  if (match) {
    const oldPriceStr = match[1];
    const newPriceStr = (eurPrice * BGN_RATE).toFixed(2);
    
    // Safety check - ONLY replace if changed
    if (oldPriceStr !== newPriceStr) {
      priceReplacements[oldPriceStr] = newPriceStr;
      // Regex replace all known formats
      const regexes = [
        new RegExp(`"price":\\s*"${oldPriceStr}"`, 'g'),
        new RegExp(`price:'${oldPriceStr}'`, 'g'),
        new RegExp(`parseFloat\\('${oldPriceStr}'\\)`, 'g'),
        new RegExp(`fmtEUR\\(${oldPriceStr}\\)`, 'g'),
        new RegExp(`:'${oldPriceStr}'`, 'g')
      ];
      
      let newContent = content;
      newContent = newContent.replace(regexes[0], `"price": "${newPriceStr}"`);
      newContent = newContent.replace(regexes[1], `price:'${newPriceStr}'`);
      newContent = newContent.replace(regexes[2], `parseFloat('${newPriceStr}')`);
      newContent = newContent.replace(regexes[3], `fmtEUR(${newPriceStr})`);
      newContent = newContent.replace(regexes[4], `:'${newPriceStr}'`);
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${file}: ${oldPriceStr} BGN -> ${newPriceStr} BGN (${eurPrice} EUR)`);
    } else {
      console.log(`Skipped ${file}: price already ${newPriceStr}`);
    }
  }
}

// 2. Update brands.html and index.html if necessary
const roots = ['brands.html', 'index.html', 'cart.js'];
for (const file of roots) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  for (const [oldPrice, newPrice] of Object.entries(priceReplacements)) {
    // Only target context where fmtEUR is called
    const fmtRegex = new RegExp(`fmtEUR\\(${oldPrice}\\)`, 'g');
    if (fmtRegex.test(content)) {
      content = content.replace(fmtRegex, `fmtEUR(${newPrice})`);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated cross-references in ${file}`);
  }
}

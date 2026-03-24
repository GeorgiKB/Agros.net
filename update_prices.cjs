const fs = require('fs');
const path = require('path');

const pricesDir = path.join(__dirname, 'prices.json');
const productsDir = path.join(__dirname, 'products');

const rawPrices = JSON.parse(fs.readFileSync(pricesDir, 'utf-8'));

// Build a flat mapping of Product Name to New EUR Price
// The excel has "OLLEO Бутилки" as the item name, and "EUR" as the price.
// But wait, the categories are rows where EUR = "EUR".
const priceMap = {};
let currentCategory = '';
for (const row of rawPrices) {
  const name = row['OLLEO Бутилки']?.trim();
  const eurStr = row['EUR'];
  
  if (eurStr === 'EUR' || eurStr === undefined) {
    currentCategory = name; // e.g. "NOTEO Брашна"
    continue;
  }
  
  const eurVal = parseFloat(eurStr);
  if (!isNaN(eurVal)) {
    priceMap[`${currentCategory} - ${name}`] = eurVal;
  }
}

// Manual map from category+name to filename
const fileMap = {
  " - Натурално": "natural-750ml.html", // Assume early ones are bottles if no category
  " - С лимон": "lemon-250ml.html",
  " - С чесън": "garlic-250ml.html",
  " - С чили": "chilli-250ml.html",
  " - С трюфел": "truffle-250ml.html",
  " - Extra Virgin Mix": "olive-blend-250ml.html",
  " - Omega Mix": "omega-mix-250ml.html",
  "OLLEO Дози - Натурално": "natural-14ml.html",
  "OLLEO Дози - С лимон": "lemon-8ml.html",
  "OLLEO Дози - С чесън": "garlic-8ml.html",
  "OLLEO Дози - С чили": "chilli-8ml.html",
  "OLLEO Дози - Соево": "soy-8ml.html",
  "OLLEO Дози - Балсамово": "balsamic-8ml.html",
  "OLLEO Дози - Плик с Дози (микс вкусове)": "doses-10x8ml.html",
  "NOTEO Брашна - Ленено брашно": "noteo-flax-flour-300g.html",
  "NOTEO Брашна - Орехово брашно": "noteo-walnut-flour-300g.html",
  "NOTEO Протеини - Шоколадов": "noteo-protein-chocolate-300g.html",
  "NOTEO Протеини - Натурален": "noteo-protein-natural-300g.html",
  "NOTEO Протеини - Малинов": "noteo-protein-raspberry-300g.html",
  "NOTEO Протеинови кр. - Какао": "noteo-choco-cream-cocoa-65g.html",
  "NOTEO Протеинови кр. - Мента": "noteo-choco-cream-mint-65g.html",
  "NOTEO Протеинови кр. - Портокал": "noteo-choco-cream-orange-65g.html"
};

// Also we need the ones without category to be mapped properly if currentCategory was empty initially
fileMap["OLLEO Бутилки - Натурално"] = "natural-750ml.html";
fileMap["OLLEO Бутилки - С лимон"] = "lemon-250ml.html";
fileMap["OLLEO Бутилки - С чесън"] = "garlic-250ml.html";
fileMap["OLLEO Бутилки - С чили"] = "chilli-250ml.html";
fileMap["OLLEO Бутилки - С трюфел"] = "truffle-250ml.html";
fileMap["OLLEO Бутилки - Extra Virgin Mix"] = "olive-blend-250ml.html";
fileMap["OLLEO Бутилки - Omega Mix"] = "omega-mix-250ml.html";

console.log(JSON.stringify(priceMap, null, 2));


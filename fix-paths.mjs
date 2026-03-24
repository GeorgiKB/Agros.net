import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'products');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (content.includes('src="/auth.js"')) {
    content = content.replace(/src="\/auth\.js"/g, 'src="../auth.js"');
    changed = true;
  }
  if (content.includes('src="/cart.js"')) {
    content = content.replace(/src="\/cart\.js"/g, 'src="../cart.js"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    updatedCount++;
  }
}

console.log(`Updated paths in ${updatedCount} files.`);

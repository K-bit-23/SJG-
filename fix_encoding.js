const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'frontend/client/pages'),
  path.join(__dirname, 'frontend/admin/pages')
];

let files = [];
for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const dirFiles = fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => path.join(dir, f));
    files.push(...dirFiles);
  }
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/Ã¢â€šÂ¹/g, '₹');
  newContent = newContent.replace(/â‚¹/g, '₹');
  newContent = newContent.replace(/ðŸ"¦/g, '📦');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', path.basename(file));
  }
}
console.log('Done');

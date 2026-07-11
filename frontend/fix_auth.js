const fs = require('fs');
const path = require('path');

const dir = 'd:/project/frontend/app/(auth)';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const fullPath = path.join(dir, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace 'scroll: { ... }' with 'scroll: { ... , maxWidth: 450, width: '100%', alignSelf: 'center' }'
  if (content.includes('scroll: {') && !content.includes('maxWidth: 450')) {
    content = content.replace(/(scroll:\s*\{[^}]+)\}/g, "$1, maxWidth: 450, width: '100%', alignSelf: 'center' }");
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated', fullPath);
  }
}

const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Check if it uses Dimensions.get outside component
      if (content.includes('Dimensions.get(\'window\')') && !content.includes('useWindowDimensions')) {
        
        // Remove 'const { width } = Dimensions.get(\'window\');'
        content = content.replace(/const\s+\{\s*width\s*\}\s*=\s*Dimensions\.get\('window'\);\s*/, '');
        content = content.replace(/const\s+\{\s*width,\s*height\s*\}\s*=\s*Dimensions\.get\('window'\);\s*/, '');

        // Add useWindowDimensions to react-native import
        if (!content.includes('useWindowDimensions')) {
          content = content.replace(/import\s+\{([^}]*)\}\s+from\s+'react-native';/, (match, p1) => {
            return `import { ${p1.trim()}, useWindowDimensions } from 'react-native';`;
          });
        }

        // Add to main component
        content = content.replace(/export default function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/, (match) => {
          return match + '\n  const { width } = useWindowDimensions();';
        });

        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir('d:/project/frontend/app');

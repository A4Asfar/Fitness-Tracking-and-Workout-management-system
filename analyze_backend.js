const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const backendDir = path.join(__dirname, 'backend');
const files = walk(backendDir);

const bugs = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // 1. Missing return before res.status
    if (line.match(/[^{};]*res\.status\(\d+\)\.json\(/) && !line.includes('return') && !line.match(/=>/)) {
      // Check if the next line is a return or end of block. This is a heuristic.
      bugs.push(`Potential "headers already sent" (missing return) in ${file}:${index+1} -> ${line.trim()}`);
    }
    
    // 2. req.body directly used without validation (Heuristic)
    // 3. Catch block without returning error properly
    if (line.includes('catch (') || line.includes('catch(')) {
       // Look ahead a few lines for res.status
       const lookahead = lines.slice(index, index + 5).join(' ');
       if (!lookahead.includes('res.status')) {
         bugs.push(`Catch block might not return HTTP response in ${file}:${index+1}`);
       }
    }
  });
}

console.log(JSON.stringify(bugs, null, 2));

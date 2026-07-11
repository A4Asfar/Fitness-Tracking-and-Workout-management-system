const fs = require('fs');

const filesToFix = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/progress.tsx',
  'app/(tabs)/workouts.tsx',
  'app/(tabs)/diet.tsx',
  'app/(tabs)/trainers.tsx',
  'app/(tabs)/settings.tsx'
];

for (const file of filesToFix) {
  const fullPath = `d:/project/frontend/${file}`;
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // We find the FIRST occurrence of `contentContainerStyle={{ paddingBottom`
  // and replace it with `contentContainerStyle={{ paddingBottom: ..., maxWidth: 1000, width: '100%', alignSelf: 'center' }}`
  
  if (content.includes('contentContainerStyle={{ paddingBottom:')) {
    content = content.replace(/(contentContainerStyle=\{\{\s*paddingBottom:[^}]+)(\}\})/, "$1, maxWidth: 1000, width: '100%', alignSelf: 'center' $2");
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed ScrollView in', file);
  } else if (content.includes('contentContainerStyle={{ padding:')) {
    content = content.replace(/(contentContainerStyle=\{\{\s*padding:[^}]+)(\}\})/, "$1, maxWidth: 1000, width: '100%', alignSelf: 'center' $2");
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed ScrollView in', file);
  }
}

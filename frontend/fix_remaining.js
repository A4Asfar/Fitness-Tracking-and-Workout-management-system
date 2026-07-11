const fs = require('fs');

const filesToFix = [
  'app/admin-dashboard.tsx',
  'app/trainer-details.tsx',
  'app/workout-details.tsx',
  'app/create-workout.tsx'
];

for (const file of filesToFix) {
  const fullPath = `d:/project/frontend/${file}`;
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (content.includes('contentContainerStyle={{ paddingBottom:')) {
    content = content.replace(/(contentContainerStyle=\{\{\s*paddingBottom:[^}]+)(\}\})/, "$1, maxWidth: 1000, width: '100%', alignSelf: 'center' $2");
    changed = true;
  } else if (content.includes('contentContainerStyle={{ padding:')) {
    content = content.replace(/(contentContainerStyle=\{\{\s*padding:[^}]+)(\}\})/, "$1, maxWidth: 1000, width: '100%', alignSelf: 'center' $2");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed ScrollView in', file);
  }
}

const fs = require('fs');
const path = require('path');

const dir = 'd:/project/frontend/app/(tabs)';
const files = ['index.tsx', 'progress.tsx', 'workouts.tsx', 'diet.tsx', 'trainers.tsx', 'settings.tsx'];

for (const file of files) {
  const fullPath = path.join(dir, file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // To constraint the width on these, we usually have a ScrollView wrapper or root view.
  // We can inject `maxWidth: 1000, width: '100%', alignSelf: 'center'` into their main scroll container style.
  
  // Let's look for `contentContainerStyle` or `style` that might be holding the scroll.
  // The simplest way without breaking things is to wrap the return JSX's main child in a View if it's not a ScrollView, 
  // but they all use ScrollView. We can just add it to the styles.
  
  if (content.includes('root: {')) {
    // If it has a root style that is flex: 1, we don't want to constrain the root (background), 
    // we want to constrain the scroll content.
    
    // Instead of regex hacking JSX, let's just append an inline style to the ScrollView
    // <ScrollView ... >
    content = content.replace(/<ScrollView([^>]*)>/g, (match, p1) => {
      if (p1.includes('maxWidth')) return match; // already applied
      
      // We will append a contentContainerStyle if it doesn't exist, or modify it if it does
      if (p1.includes('contentContainerStyle={[')) {
        return `<ScrollView${p1.replace('contentContainerStyle={[', `contentContainerStyle={[{ maxWidth: 1000, width: '100%', alignSelf: 'center' }, `)}>`;
      } else if (p1.includes('contentContainerStyle={')) {
        return `<ScrollView${p1.replace('contentContainerStyle={', `contentContainerStyle={[{ maxWidth: 1000, width: '100%', alignSelf: 'center' }, `).replace(/}$/, ']}')}>`;
      } else {
        return `<ScrollView${p1} contentContainerStyle={{ maxWidth: 1000, width: '100%', alignSelf: 'center', flexGrow: 1 }}>`;
      }
    });

    // Also some have inner Views like `body: {` that shouldn't be constrained if the ScrollView is constrained, 
    // but the ScrollView is the safest place.
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated ScrollView in', fullPath);
  }
}

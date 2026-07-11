const fs = require('fs');

let content = fs.readFileSync('d:/project/frontend/app/admin-dashboard.tsx', 'utf8');

if (content.includes('contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}')) {
  content = content.replace('contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}', "contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40, maxWidth: 1000, width: '100%', alignSelf: 'center' }]}");
  fs.writeFileSync('d:/project/frontend/app/admin-dashboard.tsx', content, 'utf8');
  console.log('Fixed admin dashboard');
}

const fs = require('fs');

function addKeyboardAvoidingView(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<KeyboardAvoidingView')) return;
  
  if (!content.includes('KeyboardAvoidingView')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'react-native';/, (m, p1) => {
      return `import { ${p1.trim()}, KeyboardAvoidingView, Platform } from 'react-native';`;
    });
  }

  content = content.replace(/return\s*\(\s*<View\s+style=\{([^}]+)\}\s*>/, (m, p1) => {
    return `return (\n    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>\n      <View style={${p1}}>`;
  });

  content = content.replace(/<\/View>\s*\)\s*;\s*\}/, '</View>\n    </KeyboardAvoidingView>\n  );\n}');
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

addKeyboardAvoidingView('d:/project/frontend/app/payment-submission.tsx');
addKeyboardAvoidingView('d:/project/frontend/app/step-logger.tsx');
addKeyboardAvoidingView('d:/project/frontend/app/weight-logger.tsx');
addKeyboardAvoidingView('d:/project/frontend/components/trainers/WriteReviewModal.tsx');
addKeyboardAvoidingView('d:/project/frontend/app/admin/verify-payments.tsx');

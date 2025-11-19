// Script para arreglar todas las páginas que usan Layout viejo
const fs = require('fs');
const path = require('path');

const pagesToFix = [
  'SmartMatchingPage.tsx',
  'StudyPlannerPage.tsx', 
  'AcademicPredictorPage.tsx',
  'ReviewPage.tsx',
  'AcademicManagementPage.tsx',
  'ProfilePage.tsx',
  'ChatPage.tsx',
  'UniversityDocsPage.tsx',
  'RequestTutoringPage.tsx',
  'PaymentsPage.tsx',
  'SupportPage.tsx',
  'RequestsPage.tsx'
];

function fixLayoutInFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Comentar el import de Layout
    content = content.replace(
      /import { Layout } from '\.\.\/components\/Layout';/g,
      '// Layout se maneja desde App.tsx con ResponsiveContainer y MobileNavigation'
    );
    
    // Reemplazar Layout wrapper con div simple
    content = content.replace(
      /<Layout currentPage="[^"]*" onNavigate={onNavigate}>/g,
      '<div className="p-4">'
    );
    
    // Cerrar div en lugar de Layout
    content = content.replace(
      /<\/Layout>/g,
      '</div>'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
  }
}

// Ejecutar fix en todas las páginas
pagesToFix.forEach(page => {
  const filePath = path.join(__dirname, 'pages', page);
  if (fs.existsSync(filePath)) {
    fixLayoutInFile(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 Layout fixes completed!');
console.log('All pages now use div wrapper instead of Layout component.');
console.log('Navigation is handled by MobileNavigation from App.tsx');
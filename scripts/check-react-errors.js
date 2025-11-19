#!/usr/bin/env node

/**
 * Script para verificar errores específicos de React que causan pantalla en blanco
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ERRORES ESPECÍFICOS DE REACT');
console.log('==========================================\n');

// Función para leer archivo de forma segura
function readFileSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

// Función para buscar errores específicos
function findReactErrors(content, filePath) {
    const errors = [];
    
    // 1. Verificar si hay errores de sintaxis básicos
    if (content.includes('Cannot read properties of undefined')) {
        errors.push('❌ Error: Cannot read properties of undefined');
    }
    
    if (content.includes('Cannot read property')) {
        errors.push('❌ Error: Cannot read property');
    }
    
    if (content.includes('is not a function')) {
        errors.push('❌ Error: is not a function');
    }
    
    // 2. Verificar problemas comunes de React
    if (content.includes('.map(') && !content.includes('?.map(') && !content.includes('&&')) {
        // Buscar patrones problemáticos
        const mapPattern = /(\w+)\.map\(/g;
        let match;
        while ((match = mapPattern.exec(content)) !== null) {
            const variableName = match[1];
            // Verificar si la variable se inicializa como array
            if (!content.includes(`const [${variableName}`) && !content.includes(`let ${variableName}`)) {
                errors.push(`⚠️  ${variableName}.map() usado sin verificar si existe`);
            }
        }
    }
    
    // 3. Verificar hooks en lugares incorrectos
    if (content.includes('useState') && content.includes('if (')) {
        const lines = content.split('\n');
        let inConditional = false;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('if (') && !lines[i].includes('//')) {
                inConditional = true;
            }
            if (inConditional && lines[i].includes('useState')) {
                errors.push('❌ useState dentro de condicional (línea ' + (i + 1) + ')');
                break;
            }
            if (lines[i].includes('}') && inConditional) {
                inConditional = false;
            }
        }
    }
    
    return errors;
}

async function checkReactErrors() {
    try {
        console.log('🔍 Verificando errores específicos de React...\n');
        
        const filesToCheck = [
            'src/App.tsx',
            'src/contexts/AuthContext.tsx',
            'src/pages/HomePage.tsx',
            'src/pages/SearchPage.tsx',
            'src/pages/ChatPage.tsx',
            'src/pages/ProfilePage.tsx'
        ];
        
        let totalErrors = 0;
        
        filesToCheck.forEach(file => {
            console.log(`📄 Verificando ${file}...`);
            const content = readFileSafe(file);
            if (content) {
                const errors = findReactErrors(content, file);
                if (errors.length > 0) {
                    console.log(`   ❌ Errores encontrados:`);
                    errors.forEach(error => {
                        console.log(`      ${error}`);
                        totalErrors++;
                    });
                } else {
                    console.log(`   ✅ Sin errores obvios`);
                }
            } else {
                console.log(`   ❌ No se pudo leer el archivo`);
                totalErrors++;
            }
        });
        
        console.log('\n🎯 VERIFICACIÓN COMPLETADA');
        console.log('==========================');
        
        if (totalErrors === 0) {
            console.log('✅ No se encontraron errores obvios en el código');
            console.log('\n💡 PRÓXIMOS PASOS PARA DEBUGGING:');
            console.log('1. Abre http://localhost:5173 en tu navegador');
            console.log('2. Abre las herramientas de desarrollador (F12)');
            console.log('3. Ve a la pestaña "Consola"');
            console.log('4. Busca errores en rojo');
            console.log('5. Si no hay errores, verifica la pestaña "Network"');
            console.log('6. Revisa si hay errores de CORS o de red');
        } else {
            console.log(`❌ Se encontraron ${totalErrors} errores`);
            console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
            console.log('1. Revisa los errores marcados arriba');
            console.log('2. Asegúrate de que los arrays existan antes de usar .map()');
            console.log('3. Verifica que los hooks no estén en condicionales');
            console.log('4. Añade verificaciones de null/undefined');
        }
        
        console.log('\n📱 PARA DEBUGGING EN MÓVIL:');
        console.log('1. Abre Android Studio');
        console.log('2. Ve a Logcat');
        console.log('3. Filtra por "Capacitor/Console"');
        console.log('4. Ejecuta la app y busca errores en rojo');
        console.log('5. También busca "ERROR" o "Exception"');
        
        return totalErrors === 0;
        
    } catch (error) {
        console.error('❌ Error en verificación:', error.message);
        return false;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    checkReactErrors()
        .then((success) => {
            if (success) {
                console.log('\n✅ Verificación completada - Revisa la consola del navegador');
                process.exit(0);
            } else {
                console.log('\n❌ Se encontraron errores - Revisa los errores arriba');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('❌ Error inesperado:', error);
            process.exit(1);
        });
}

module.exports = { checkReactErrors };

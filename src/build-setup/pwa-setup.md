# 📲 Configuración PWA (Progressive Web App)

## Instalación

```bash
npm install vite-plugin-pwa workbox-window
```

## Configuración

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'TutorApp Colombia',
        short_name: 'TutorApp',
        description: 'Plataforma de tutorías on-demand para estudiantes colombianos',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'productivity'],
        lang: 'es-CO',
        shortcuts: [
          {
            name: 'Buscar Tutor',
            short_name: 'Buscar',
            description: 'Encontrar un tutor disponible',
            url: '/search',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Mis Clases',
            short_name: 'Clases',
            description: 'Ver mis tutorías programadas',
            url: '/requests',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?version=1`;
              }
            }
          }
        ]
      }
    })
  ]
});
```

### public/manifest.json (alternativo)
```json
{
  "name": "TutorApp Colombia",
  "short_name": "TutorApp",
  "description": "Plataforma de tutorías on-demand para estudiantes colombianos",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Assets necesarios

Crear en `public/`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png`
- `favicon.ico`

## Instalación en dispositivos

### Android:
1. Abrir en Chrome
2. Menú → "Agregar a pantalla de inicio"

### iOS:
1. Abrir en Safari
2. Botón compartir → "Agregar a pantalla de inicio"

### Desktop:
1. Chrome/Edge: Ícono de instalación en la barra de direcciones
2. Se instala como aplicación nativa

## Comandos

```bash
# Construir PWA
npm run build

# El PWA estará en dist/ listo para deploy
```

## Ventajas de PWA
- ✅ Funciona en todos los dispositivos
- ✅ Se instala como app nativa
- ✅ Funciona offline (con cache)
- ✅ Actualizaciones automáticas
- ✅ No requiere app stores
- ✅ Menor tamaño que apps nativas
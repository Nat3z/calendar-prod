import { defineConfig } from 'astro/config';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), AstroPWA({ 
    mode: 'production',
    base: '/',
    scope: '/',
    includeAssets: ['favicon.svg'],
    registerType: 'autoUpdate',
    manifest: {
      name: 'DynSchedule',
      short_name: 'DynSchedule',
      theme_color: '#050014',
      icons: [
        {
          src: 'grad_logo-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'grad_logo-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }
  }) ],
});
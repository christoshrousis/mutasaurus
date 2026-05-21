import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://christoshrousis.github.io',
  base: '/mutasaurus',
  output: 'static',
  integrations: [preact({ compat: false })],
  vite: {
    plugins: [tailwindcss()],
  },
});

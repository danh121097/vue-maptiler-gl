import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Vue 3 MapTiler SDK',
  description:
    'Interactive maps for Vue 3 — 10 components and 38 composables for MapTiler SDK, fully typed with TypeScript.',
  base: '/',
  ignoreDeadLinks: false,
  srcExclude: [
    'code-standards.md',
    'codebase-summary.md',
    'project-overview-pdr.md',
    'project-roadmap.md',
    'system-architecture.md',
  ],
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#10b981' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Vue 3 MapTiler SDK' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Interactive maps for Vue 3 — 10 components and 38 composables for MapTiler SDK, fully typed with TypeScript.',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  sitemap: {
    hostname: 'https://vue-maptiler-gl.pages.dev/',
  },

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/components' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v2.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          {
            text: 'Migration from v1 (MapTiler)',
            link: '/guide/migration-v1-to-v2',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Configuration', link: '/guide/configuration' },
            {
              text: 'Composables Overview',
              link: '/guide/composables-overview',
            },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'SSR / Nuxt', link: '/guide/ssr-nuxt' },
            {
              text: 'Migration from v1 (MapTiler)',
              link: '/guide/migration-v1-to-v2',
            },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Components', link: '/api/components' },
            { text: 'Composables', link: '/api/composables' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Map', link: '/examples/basic-map' },
            { text: 'Markers', link: '/examples/markers' },
            { text: 'Layers', link: '/examples/layers' },
            { text: 'Controls', link: '/examples/controls' },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/danh121097/vue-maptiler-gl',
      },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue3-maptiler-gl' },
    ],

    editLink: {
      pattern:
        'https://github.com/danh121097/vue-maptiler-gl/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message:
        'Released under the <a href="https://github.com/danh121097/vue-maptiler-gl/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>.',
      copyright: `Copyright © ${new Date().getFullYear()} - <a href="https://harrynguyen.work" target="_blank" rel="noopener noreferrer">Harry Nguyen</a>`,
    },
  },
});

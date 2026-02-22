import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'TradeFlow',
  tagline: 'Your personal trading journal with AI-powered insights',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://archreactor04.github.io',
  baseUrl: '/TradeFlow/',

  organizationName: 'archReactor04',
  projectName: 'TradeFlow',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        docsRouteBasePath: '/docs',
        indexBlog: false,
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/archReactor04/TradeFlow/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'TradeFlow',
        logo: {
          alt: 'TradeFlow Logo',
          src: 'img/favicon.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/archReactor04/TradeFlow',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Getting Started', to: '/docs/intro' },
              { label: 'Features', to: '/docs/features/dashboard' },
              { label: 'Guides', to: '/docs/guides/csv-import' },
            ],
          },
          {
            title: 'Technical',
            items: [
              { label: 'Architecture', to: '/docs/technical/architecture' },
              { label: 'Data Storage', to: '/docs/technical/data-storage' },
              { label: 'Desktop App', to: '/docs/technical/electron' },
            ],
          },
          {
            title: 'Links',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/archReactor04/TradeFlow',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} TradeFlow. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

export default config;

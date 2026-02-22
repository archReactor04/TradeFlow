/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/desktop-app',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/dashboard',
        'features/trade-log',
        'features/accounts',
        'features/strategies',
        'features/bulk-import',
        'features/mentor-mode',
        'features/jesse-ai',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/csv-import',
        'guides/export-backup',
        'guides/mentor-setup',
      ],
    },
    {
      type: 'category',
      label: 'Technical Reference',
      items: [
        'technical/architecture',
        'technical/data-storage',
        'technical/electron',
      ],
    },
  ],
};

export default sidebars;

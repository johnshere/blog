module.exports = {
  title: 'johnshere的博客',
  description: 'johnshere的博客',
  head: [
    // ['link', { rel: 'icon', href: '/img/logo.ico' }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' }
    ],
    sidebar: ['/', '/test', '/test/'],
    sidebarDepth: 2,
    lastUpdated: 'Last Updated'
  }
}

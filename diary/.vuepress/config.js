module.exports = {
  title: 'johnshere的学习笔记',
  description: 'johnshere的学习笔记',
  head: [
    // ['link', { rel: 'icon', href: '/img/logo.ico' }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  base: 'diary',
  dest: './_dist/diary',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '导读', link: '/essay/' },
      { text: 'External', link: 'https://google.com' }
    ],
    sidebar: [
      {
        title: 'Flutter', // 侧边栏名称
        // collapsable: true, // 可折叠
        children: ['/flutter/first-day']
      },
      {
        title: 'CSS', // 侧边栏名称
        // collapsable: true, // 可折叠
        children: ['/CSS/first-day']
      },
      '/'
    ],
    sidebarDepth: 2,
    lastUpdated: 'Last Updated'
  }
}

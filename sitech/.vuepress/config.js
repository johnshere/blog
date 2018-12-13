module.exports = {
  title: 'johnshere的学习笔记',
  description: 'johnshere的学习笔记',
  head: [
    // ['link', { rel: 'icon', href: '/img/logo.ico' }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  base: '/blog/sitech/',
  dest: '_dist/sitech',
  themeConfig: {
    // nav: [
    //   { text: '主页', link: '/' },
    //   { text: '导读', link: '/essay/' },
    //   { text: 'External', link: 'https://google.com' }
    // ],
    sidebar: [
      {
        title: '消息推送使用说明',
        // collapsable: true,
        children: ['/instant-msg-server/demo']
      }
      //   {
      //     title: 'Flutter', // 侧边栏名称
      //     // collapsable: true, // 可折叠
      //     children: ['/flutter/first-day']
      //   },
      //   {
      //     title: 'CSS', // 侧边栏名称
      //     collapsable: false, // 可折叠
      //     children: ['/CSS/first-day']
      //   },
      //   {
      //     title: 'VuePress', // 侧边栏名称
      //     collapsable: false, // 可折叠
      //     children: ['/vuepress/1-config']
      //   },
      //   '/'
    ],
    sidebarDepth: 2,
    lastUpdated: 'Last Updated'
  },
  markdown: {
    // 显示代码行号
    lineNumbers: true
  },
  plugins: [
    '@vuepress/back-to-top',
    [
      '@vuepress/register-components',
      {
        componentsDir: './components'
      }
    ]
  ]
}

<template>
  <section style="border-top: 2px solid #eaecef;padding-top:1rem;margin-top:2rem;">
    <div>
      <!-- id 将作为查询条件 -->
      <span class="leancloud-visitors"
            data-flag-title="Your Article Title">
        <em class="post-meta-item-text">阅读量： </em>
        <i class="leancloud-visitors-count"></i>
      </span>
    </div>
    <h3>
      <a href="javascript:;"></a>
      评 论：
    </h3>
    <div id="vcomments"></div>
  </section>
</template>

<script>
export default {
  name: 'Valine',
  mounted: function () {
    // require window 
    const Valine = require('valine');
    if (typeof window !== 'undefined') {
      // vuepress打包后变成的HTML不知为什么吞掉此处的绑定`:id="countId"`
      document.getElementsByClassName('leancloud-visitors')[0].id = window.location.pathname
      this.window = window
      window.AV = require('leancloud-storage')
    }

    new Valine({
      el: '#vcomments',
      appId: 'TobXrD94cYKkxDKEcg3hVFt2-gzGzoHsz',// your appId
      appKey: 'mBpcp9MOdM5gHDvoIA6WLxMC', // your appKey
      notify: false,
      verify: false,
      path: window.location.pathname,
      visitor: true,
      avatar: 'mm',
      placeholder: 'write here'
    });
  },
}
</script>
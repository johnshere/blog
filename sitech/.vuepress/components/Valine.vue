<template>
  <section>
    <h3 id="commonts"
        style="border-top: 1px solid #eaecef;padding-top:2rem;margin-top:2rem;">
      <a href="#commonts"></a>
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
      this.window = window
      window.AV = require('leancloud-storage')

    }

    new Valine({
      el: '#vcomments',
      appId: 'TobXrD94cYKkxDKEcg3hVFt2-gzGzoHsz',// your appId
      appKey: 'mBpcp9MOdM5gHDvoIA6WLxMC', // your appKey
      notify: false,
      verify: false,
      avatar: 'mm',
      placeholder: 'write here'
    });
  },
}
</script>
// Shared site script: footer year + AdSense push helper.
// Each tool page also inlines its own calculation logic.
(function () {
  'use strict';
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Push any ad slots present on the page.
  function pushAds() {
    if (!window.adsbygoogle) window.adsbygoogle = [];
    var slots = document.querySelectorAll('ins.adsbygoogle');
    for (var i = 0; i < slots.length; i++) {
      if (!slots[i].dataset.pushed) {
        window.adsbygoogle.push({});
        slots[i].dataset.pushed = '1';
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pushAds);
  } else {
    pushAds();
  }
})();

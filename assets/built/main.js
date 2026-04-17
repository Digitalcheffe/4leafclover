(function () {
  const key = "freshstart_theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  const saved = localStorage.getItem(key);
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  if (!btn) return;

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem(key, next);
  });
})();


// ---- Bridge text splitter (Left:Right) for page + footer bridges ----
(function () {
  try {
    var nodes = document.querySelectorAll('[data-bridge-split]');
    if (!nodes || !nodes.length) return;

    nodes.forEach(function (el) {
      var raw = el.getAttribute('data-bridge-split') || '';
      // If the theme setting isn't set, keep the template defaults
      if (!raw || !raw.trim()) return;

      // Decode common HTML entities (Ghost may escape quotes etc.)
      raw = raw.replace(/&quot;/g, '"');

      var idx = raw.indexOf(':');
      if (idx === -1) return;

      var left = raw.slice(0, idx).trim();
      var right = raw.slice(idx + 1).trim();

      var leftEl = el.querySelector('.js-bridge-left');
      var rightEl = el.querySelector('.js-bridge-right');
      var dotEl = el.querySelector('.fs-bridge-dot');

      if (leftEl) {
        if (left) {
          leftEl.textContent = left;
          leftEl.style.display = '';
        } else {
          leftEl.textContent = '';
          leftEl.style.display = 'none';
        }
      }

      if (rightEl) {
        if (right) {
          rightEl.textContent = right;
          rightEl.style.display = '';
        } else {
          rightEl.textContent = '';
          rightEl.style.display = 'none';
        }
      }

      // If either side is missing, hide the dot so the bridge doesn't look broken
      if (dotEl) {
        dotEl.style.display = (left && right) ? '' : 'none';
      }
    });
  } catch (e) {
    // no-op
  }
})();



// ---- Extra social links (from @custom.social_links_extra) ----
(function () {
  try {
    var containers = document.querySelectorAll('.sidebar-social[data-extra-social]');
    if (!containers || !containers.length) return;

    var ICONS = {
      "x": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.4L1 2h6.4l4.5 5.8L18.9 2zm-1.1 18h1.7L7.2 3.9H5.4L17.8 20z"/></svg>',
      "twitter": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.4L1 2h6.4l4.5 5.8L18.9 2zm-1.1 18h1.7L7.2 3.9H5.4L17.8 20z"/></svg>',
      "facebook": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
      "instagram": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>',
      "youtube": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.6A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12a31.6 31.6 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.6 7.5.6 7.5.6s5.7 0 7.5-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 22 12a31.6 31.6 0 0 0-.4-4.8zM10 15.5v-7l6 3.5z"/></svg>',
      "tiktok": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 2h2.1c.1 2.1 1.6 4 3.4 4.7v2.3c-1.6 0-3-.5-4.1-1.4v8.1c0 3.5-2.8 6.3-6.3 6.3S5.3 19.2 5.3 15.7 8.1 9.4 11.6 9.4c.5 0 1 .1 1.5.2v2.4c-.5-.2-1-.3-1.5-.3-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V2z"/></svg>',
      "linkedin": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5A1.5 1.5 0 1 1 5 5a1.5 1.5 0 0 1 1.5 1.5zM4 9h3v11H4zM10 9h2.9v1.5h.1A3.2 3.2 0 0 1 16 8.8c3.2 0 3.8 2.1 3.8 4.8V20h-3v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20h-3z"/></svg>',
      "reddit": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a4 4 0 0 0-7-2.6c-1-.4-2.1-.6-3-.7l.7-3.2 2.2.5a2 2 0 1 0 .2-1.1l-2.9-.6-1 4.4c-1 .1-2 .3-3 .7A4 4 0 0 0 2 12a2 2 0 0 0 1 1.7c0 .2-.1.5-.1.8 0 3 4 5.5 9 5.5s9-2.5 9-5.5c0-.3 0-.6-.1-.8A2 2 0 0 0 22 12zM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-8.2 3.6a1 1 0 0 1 1.4-.2c.9.6 1.9.9 2.8.9s1.9-.3 2.8-.9a1 1 0 1 1 1.2 1.6c-1.2.9-2.7 1.3-4 1.3s-2.8-.4-4-1.3a1 1 0 0 1-.2-1.4z"/></svg>',
      "github": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4a3.2 3.2 0 0 0-1.3-1.8c-1.1-.7.1-.7.1-.7a2.6 2.6 0 0 1 1.9 1.3 2.6 2.6 0 0 0 3.6 1 2.6 2.6 0 0 1 .8-1.7c-2.7-.3-5.5-1.4-5.5-6.1A4.7 4.7 0 0 1 6 7.6a4.4 4.4 0 0 1 .1-3.2s1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.1 18.3 4.4 18.3 4.4a4.4 4.4 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.2 3.3c0 4.7-2.8 5.8-5.5 6.1a3 3 0 0 1 .9 2.3v3.4c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
      "pinterest": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.8l1.6-6.7s-.4-.8-.4-2c0-1.9 1.1-3.3 2.4-3.3 1.1 0 1.7.8 1.7 1.9 0 1.1-.7 2.7-1 4.2-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.7-2.2 3.7-5.4 0-2.8-2-4.8-4.9-4.8-3.3 0-5.3 2.5-5.3 5.1 0 1 .4 2.1.9 2.7a.4.4 0 0 1 .1.4l-.3 1.2c-.1.4-.3.5-.7.3-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 7-6.3 3.7 0 6.5 2.6 6.5 6.1 0 3.6-2.3 6.6-5.5 6.6-1.1 0-2.1-.6-2.4-1.2l-.7 2.7c-.3 1-1 2.2-1.5 2.9A10 10 0 0 0 12 2z"/></svg>',
      "email": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>',
      "tumblr": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21c-3 0-5-1.7-5-5V9H7V7.3c2.3-.8 3.4-2.1 3.8-4.3H13v4h3v2H13v6.6c0 1.6.7 2.2 1.9 2.2.6 0 1.2-.2 1.6-.4l.5 2a6.3 6.3 0 0 1-3 .6z"/></svg>',
      "google": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11v2.8h4.7c-.2 1.2-1.4 3.5-4.7 3.5a5.4 5.4 0 1 1 0-10.8c1.5 0 2.6.6 3.2 1.2l2.2-2.1C16.2 3.4 14.3 2.6 12 2.6A9.4 9.4 0 1 0 12 21.4c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12z"/></svg>'
    };

    function norm(s){return String(s||'').toLowerCase().trim();}
    function iconFor(name){return ICONS[norm(name)] || ICONS[norm(name).replace(/\s+/g,'')] || null;}

    function makeLink(name, url){
      var a = document.createElement('a');
      a.className = 'social-icon';
      a.setAttribute('aria-label', name);

      var key = norm(name);
      if (key === 'email' && url.indexOf('mailto:') !== 0) {
        url = 'mailto:' + url;
      }
      a.href = url;

      var svg = iconFor(name);
      a.innerHTML = svg ? svg : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 0 1 4.2 4.2l-1.6 1.6a1 1 0 1 1-1.4-1.4l1.6-1.6a1 1 0 0 0-1.4-1.4l-3.5 3.5a1 1 0 0 1-1.4 0zM13.4 10.6a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 0 1-4.2-4.2l1.6-1.6A1 1 0 1 1 8.7 11L7.1 12.6a1 1 0 0 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0z"/></svg>';
      return a;
    }

    containers.forEach(function(container){
      // remove any previously injected extra icons (keep first RSS icon if present)
      Array.from(container.querySelectorAll('a.social-icon')).slice(1).forEach(function(a){ a.remove(); });

      var raw = container.getAttribute('data-extra-social') || '';
      if(!raw || !raw.trim()) return;

      raw = raw.replace(/&quot;/g,'"');
      // split comma-separated pairs
      raw.split(',').forEach(function(pair){
        var p = pair.trim();
        if(!p) return;
        var idx = p.indexOf(':');
        if(idx === -1) return;
        var name = p.slice(0,idx).trim();
        var url = p.slice(idx+1).trim();
        if(!name || !url) return;
        container.appendChild(makeLink(name, url));
      });
    });
  } catch(e){}
})();


/* Featured rail navigation: arrows + smart show/hide */
(function(){
  try{
    document.querySelectorAll('[data-rail-shell]').forEach(function(wrapper){
      var track = wrapper.querySelector('[data-featured-rail]');
      var prev = wrapper.querySelector('[data-rail-prev]');
      var next = wrapper.querySelector('[data-rail-next]');
      if(!track || !prev || !next) return;

      function cardStep(){
        var card = track.querySelector('.fs-rail-card');
        if(!card) return 260;
        var rect = card.getBoundingClientRect();
        var gap = 14;
        try {
          var cs = window.getComputedStyle(track);
          var g = parseFloat(cs.columnGap || cs.gap || '14');
          if (!isNaN(g)) gap = g;
        } catch(e){}
        return Math.max(220, Math.round(rect.width + gap)); // +gap
      }

      function update(){
        var overflow = track.scrollWidth > track.clientWidth + 4;
        prev.style.display = overflow ? 'inline-flex' : 'none';
        next.style.display = overflow ? 'inline-flex' : 'none';
        if(!overflow) return;

        prev.disabled = track.scrollLeft <= 2;
        var maxScroll = track.scrollWidth - track.clientWidth - 2;
        next.disabled = track.scrollLeft >= maxScroll;
        prev.style.opacity = prev.disabled ? '0.35' : '1';
        next.style.opacity = next.disabled ? '0.35' : '1';
        prev.style.pointerEvents = prev.disabled ? 'none' : 'auto';
        next.style.pointerEvents = next.disabled ? 'none' : 'auto';
      }

      prev.addEventListener('click', function(){
        track.scrollBy({left: -cardStep(), behavior: 'smooth'});
      });
      next.addEventListener('click', function(){
        track.scrollBy({left: cardStep(), behavior: 'smooth'});
      });

      track.addEventListener('scroll', function(){ window.requestAnimationFrame(update); });
      window.addEventListener('resize', function(){ window.requestAnimationFrame(update); });

      // Initial
      update();
      // Small delay for images/layout
      setTimeout(update, 300);
      setTimeout(update, 900);
    });
  }catch(e){}
})();



/* Featured rail arrows: show only when > 4 cards / overflow */
(function(){
  try{
    function init(){
      document.querySelectorAll('[data-rail-controls]').forEach(function(wrapper){
        var track = wrapper.querySelector('[data-featured-rail]');
        var prev = wrapper.querySelector('[data-rail-prev]');
        var next = wrapper.querySelector('[data-rail-next]');
        if(!track || !prev || !next) return;

        function step(){
          var card = track.querySelector('.fs-rail-card');
          if(!card) return 260;
          var rect = card.getBoundingClientRect();
          return Math.max(220, Math.round(rect.width + 14));
        }

        function update(){
          var overflow = track.scrollWidth > track.clientWidth + 4;
          prev.style.display = overflow ? 'inline-flex' : 'none';
          next.style.display = overflow ? 'inline-flex' : 'none';
          if(!overflow) return;

          prev.disabled = track.scrollLeft <= 2;
          var maxScroll = track.scrollWidth - track.clientWidth - 2;
          next.disabled = track.scrollLeft >= maxScroll;

          prev.style.opacity = prev.disabled ? '0.35' : '1';
          next.style.opacity = next.disabled ? '0.35' : '1';
          prev.style.pointerEvents = prev.disabled ? 'none' : 'auto';
          next.style.pointerEvents = next.disabled ? 'none' : 'auto';
        }

        prev.addEventListener('click', function(){ track.scrollBy({left: -step(), behavior:'smooth'}); });
        next.addEventListener('click', function(){ track.scrollBy({left: step(), behavior:'smooth'}); });

        track.addEventListener('scroll', function(){ window.requestAnimationFrame(update); });
        window.addEventListener('resize', function(){ window.requestAnimationFrame(update); });

        update();
        setTimeout(update, 250);
        setTimeout(update, 900);
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }catch(e){}
})();


/* Featured rail arrows: show only when rail overflows */
(function(){
  try{
    function init(){
      document.querySelectorAll('[data-rail-controls], .fs-rail-controls').forEach(function(wrapper){
        var track = wrapper.querySelector('[data-featured-rail]');
        var prev = wrapper.querySelector('[data-rail-prev]');
        var next = wrapper.querySelector('[data-rail-next]');
        if(!track || !prev || !next) return;

        function step(){
          var card = track.querySelector('.fs-rail-card');
          if(!card) return 260;
          var rect = card.getBoundingClientRect();
          return Math.max(220, Math.round(rect.width + 14));
        }

        function update(){
          var overflow = track.scrollWidth > track.clientWidth + 4;
          prev.style.display = overflow ? 'inline-flex' : 'none';
          next.style.display = overflow ? 'inline-flex' : 'none';
          if(!overflow) return;

          prev.disabled = track.scrollLeft <= 2;
          var maxScroll = track.scrollWidth - track.clientWidth - 2;
          next.disabled = track.scrollLeft >= maxScroll;

          prev.style.opacity = prev.disabled ? '0.35' : '1';
          next.style.opacity = next.disabled ? '0.35' : '1';
          prev.style.pointerEvents = prev.disabled ? 'none' : 'auto';
          next.style.pointerEvents = next.disabled ? 'none' : 'auto';
        }

        prev.addEventListener('click', function(){ track.scrollBy({left: -step(), behavior:'smooth'}); });
        next.addEventListener('click', function(){ track.scrollBy({left: step(), behavior:'smooth'}); });

        track.addEventListener('scroll', function(){ window.requestAnimationFrame(update); });
        window.addEventListener('resize', function(){ window.requestAnimationFrame(update); });

        update();
        setTimeout(update, 250);
        setTimeout(update, 900);
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }catch(e){}
})();


/* Featured rail arrows: require >4 featured posts (not just overflow) */
(function(){
  try{
    function init(){
      document.querySelectorAll('[data-rail-controls], .fs-rail-controls').forEach(function(wrapper){
        var track = wrapper.querySelector('[data-featured-rail]');
        var prev = wrapper.querySelector('[data-rail-prev]');
        var next = wrapper.querySelector('[data-rail-next]');
        if(!track || !prev || !next) return;

        function featuredCount(){
          return track.querySelectorAll('.fs-rail-card:not(.fs-rail-card--filler)').length;
        }

        function updateStrict(){
          var fc = featuredCount();
          var overflow = track.scrollWidth > track.clientWidth + 4;
          var show = (fc > 4) && overflow;
          prev.style.display = show ? 'inline-flex' : 'none';
          next.style.display = show ? 'inline-flex' : 'none';
        }

        track.addEventListener('scroll', function(){ window.requestAnimationFrame(updateStrict); });
        window.addEventListener('resize', function(){ window.requestAnimationFrame(updateStrict); });

        updateStrict();
        setTimeout(updateStrict, 300);
        setTimeout(updateStrict, 900);
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }catch(e){}
})();

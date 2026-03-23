/* ============================================================
   Agros — Products mega-dropdown
   Drop this script into any page; it auto-enhances the
   "Продукти" nav link with a brand/product flyout panel.
   ============================================================ */
(function () {
  'use strict';

  /* ── path prefix (root vs /products/ subdir) ── */
  function prefix() {
    return window.location.pathname.includes('/products/') ? '../' : '';
  }

  /* ── brand data ── */
  var BRANDS = [
    {
      id: 'OLLEO',
      name: 'OLLEO',
      tagline: 'Студено пресовани масла',
      color: '#C8922A',
      colorLight: '#FDF3E0',
      logo: 'images/olleo/olleo-logo.png',
      products: [
        { name: 'Бутилки',   img: 'images/olleo/lemon.png',        href: 'products/olleo-bottles.html' },
        { name: 'Дози',      img: 'images/olleo/doses.png',        href: 'products/olleo-doses.html' },
      ]
    },
    {
      id: 'NOTEO',
      name: 'NOTEO',
      tagline: 'Растителен протеин и суперхрани',
      color: '#18988B',
      colorLight: '#D0F0EE',
      logo: 'images/noteo/NOTEO-logo.png',
      /* white logo → tint to brand teal so it shows on cream background */
      logoStyle: 'filter:invert(47%) sepia(78%) saturate(501%) hue-rotate(140deg) brightness(87%);',
      products: [
        { name: 'Протеини',    img: 'images/noteo/vegan-protein-chocolate.png',     href: 'products/noteo-proteins.html' },
        { name: 'Брашна',      img: 'images/noteo/flax-flour.png',                  href: 'products/noteo-flours.html' },
        { name: 'Шоко кремове',img: 'images/noteo/vegan-choco-cream-noteo-65g.png', href: 'products/noteo-choco-creams.html' },
      ]
    },
    {
      id: "D'ORSO",
      name: "D'ORSO",
      tagline: 'Натурална грижа за тялото',
      color: '#7B3A60',
      colorLight: '#C47B8E',
      imgScale: '1.4',
      logo: 'images/dorso/dorso-logo.png',
      products: [
        { name: 'Масла за тяло',    img: 'images/dorso/oil-natural.png',   href: 'products/dorso-body-oils.html' },
        { name: 'Маски и скрабове', img: 'images/dorso/mask-rose.png',    href: 'products/dorso-masks.html' },
        { name: 'Грижа за тяло',    img: 'images/dorso/body-lotion.png',  href: 'products/dorso-body-care.html' },
      ]
    }
  ];

  /* ── inject CSS ── */
  function injectStyles() {
    if (document.getElementById('agros-dd-styles')) return;
    var style = document.createElement('style');
    style.id = 'agros-dd-styles';
    style.textContent = [
      /* trigger wrapper */
      '.agros-dd-wrap{position:relative;display:inline-flex;align-items:center;}',

      /* trigger button */
      '.agros-dd-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:none;padding:0;',
      'cursor:pointer;font-family:inherit;font-size:.875rem;font-weight:500;color:#4B5563;',
      'position:relative;white-space:nowrap;}',
      '.agros-dd-btn::after{content:"";position:absolute;bottom:-3px;left:0;',
      'width:0;height:1.5px;background:#C8922A;transition:width .25s ease;}',
      '.agros-dd-btn:hover{color:#344B34;}',
      '.agros-dd-btn:hover::after,.agros-dd-btn.dd-open::after,.agros-dd-btn.dd-active::after{width:100%;}',
      '.agros-dd-btn:focus-visible{outline:2px solid #6C9C6A;outline-offset:3px;border-radius:3px;}',

      /* chevron */
      '.agros-dd-chevron{flex-shrink:0;transition:transform .25s ease;}',
      '.agros-dd-btn.dd-open .agros-dd-chevron{transform:rotate(180deg);}',

      /* panel */
      '.agros-dd-panel{position:fixed;left:0;right:0;',
      'background:#FEFCF8;',
      'border-bottom:1px solid rgba(65,98,65,.12);',
      'box-shadow:0 24px 64px rgba(0,0,0,.10),0 6px 24px rgba(65,98,65,.07);',
      'opacity:0;transform:translateY(-10px);pointer-events:none;',
      'transition:opacity .22s ease,transform .22s cubic-bezier(.25,.46,.45,.94);',
      'z-index:49;}',
      '.agros-dd-panel.dd-visible{opacity:1;transform:translateY(0);pointer-events:auto;}',

      /* inner layout */
      '.agros-dd-inner{max-width:72rem;margin:0 auto;padding:2rem 2.5rem;',
      'display:flex;align-items:stretch;gap:0;}',

      /* column */
      '.agros-dd-col{flex:1;padding:0 2.25rem;display:flex;flex-direction:column;gap:1.1rem;}',
      '.agros-dd-col:first-child{padding-left:0;}',
      '.agros-dd-col:last-child{padding-right:0;}',

      /* divider */
      '.agros-dd-divider{width:1px;background:rgba(65,98,65,.12);margin:.5rem 0;flex-shrink:0;}',

      /* brand header */
      '.agros-dd-head{padding-top:1rem;}',
      '.agros-dd-logo{height:26px;width:auto;object-fit:contain;object-position:left;}',
      '.agros-dd-tagline{font-size:.72rem;color:#6B7280;margin-top:.35rem;line-height:1.5;}',

      /* product grid */
      '.agros-dd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;}',

      /* product item */
      '.agros-dd-item{display:flex;flex-direction:column;align-items:center;gap:.3rem;',
      'text-decoration:none;padding:.3rem;border-radius:10px;',
      'transition:background .2s ease;}',
      '.agros-dd-item:hover{background:rgba(65,98,65,.06);}',
      '.agros-dd-item:focus-visible{outline:2px solid #6C9C6A;outline-offset:2px;border-radius:10px;}',

      /* product image box */
      '.agros-dd-imgbox{width:100%;aspect-ratio:3/4;border-radius:8px;overflow:hidden;',
      'display:flex;align-items:center;justify-content:center;}',
      '.agros-dd-img{width:100%;height:100%;object-fit:contain;transform:scale(1.1);',
      'transition:transform .3s ease;}',
      '.agros-dd-item:hover .agros-dd-img{transform:scale(1.22);}',

      /* product name */
      '.agros-dd-iname{font-size:.68rem;font-weight:500;color:#374151;text-align:center;line-height:1.3;}',

      /* view-all link */
      '.agros-dd-all{display:inline-flex;align-items:center;gap:4px;',
      'font-size:.78rem;font-weight:600;text-decoration:none;',
      'margin-top:auto;transition:opacity .2s ease;}',
      '.agros-dd-all:hover{opacity:.72;}',

      /* backdrop */
      '.agros-dd-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.16);',
      'opacity:0;pointer-events:none;transition:opacity .22s ease;z-index:48;}',
      '.agros-dd-backdrop.dd-visible{opacity:1;pointer-events:auto;}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ── build panel HTML ── */
  function buildPanel(p) {
    var cols = BRANDS.map(function (b) {
      var items = b.products.map(function (prod) {
        return '<a href="' + p + prod.href + '" class="agros-dd-item">' +
          '<div class="agros-dd-imgbox" style="background:' + b.colorLight + ';">' +
          '<img src="' + p + prod.img + '" alt="' + prod.name + '" class="agros-dd-img" loading="lazy"' + (b.imgScale ? ' style="transform:scale(' + b.imgScale + ');"' : '') + '/>' +
          '</div>' +
          '<span class="agros-dd-iname">' + prod.name + '</span>' +
          '</a>';
      }).join('');

      return '<div class="agros-dd-col">' +
        '<div class="agros-dd-head" style="border-top:3px solid ' + b.color + ';padding-top:.875rem;">' +
        '<img src="' + p + b.logo + '" alt="' + b.name + '" class="agros-dd-logo"' + (b.logoStyle ? ' style="' + b.logoStyle + '"' : '') + '/>' +
        '<p class="agros-dd-tagline">' + b.tagline + '</p>' +
        '</div>' +
        '<div class="agros-dd-grid">' + items + '</div>' +
        '<a href="' + p + 'brands.html?brand=' + encodeURIComponent(b.id) + '" class="agros-dd-all" style="color:' + b.color + ';">' +
        'Виж всички' +
        '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2.5 6.5h8M7 2.5l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</a>' +
        '</div>';
    });

    var divider = '<div class="agros-dd-divider"></div>';
    var div = document.createElement('div');
    div.className = 'agros-dd-panel';
    div.setAttribute('role', 'region');
    div.setAttribute('aria-label', 'Продуктови марки');
    div.innerHTML = '<div class="agros-dd-inner">' + cols.join(divider) + '</div>';
    return div;
  }

  /* ── init ── */
  function init() {
    /* find "Продукти" anchor inside the sticky top nav only */
    var productsAnchor = null;
    var stickyNav = document.querySelector('nav.sticky, nav[class*="sticky"]');
    if (stickyNav) {
      stickyNav.querySelectorAll('a').forEach(function (a) {
        if (a.textContent.trim() === 'Продукти') productsAnchor = a;
      });
    }
    if (!productsAnchor) return;

    var p = prefix();

    injectStyles();

    /* build DOM */
    var panel    = buildPanel(p);
    var backdrop = document.createElement('div');
    backdrop.className = 'agros-dd-backdrop';
    document.body.appendChild(panel);
    document.body.appendChild(backdrop);

    /* trigger button */
    var btn = document.createElement('button');
    btn.className = 'agros-dd-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      'Продукти' +
      '<svg class="agros-dd-chevron" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">' +
      '<path d="M1.5 3.5l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    /* preserve active state */
    var loc = window.location.pathname;
    if (productsAnchor.classList.contains('active') || loc.includes('brands') || loc.includes('/products/')) {
      btn.classList.add('dd-active');
    }

    /* wrap */
    var wrap = document.createElement('div');
    wrap.className = 'agros-dd-wrap';
    wrap.appendChild(btn);
    productsAnchor.parentNode.insertBefore(wrap, productsAnchor);
    productsAnchor.remove();

    /* position panel below sticky nav */
    function positionPanel() {
      var nav = document.querySelector('nav.sticky, nav[class*="sticky"]');
      if (nav) panel.style.top = nav.getBoundingClientRect().bottom + 'px';
    }

    /* open / close */
    var isOpen = false;
    var openTimer = null, closeTimer = null;

    function open() {
      clearTimeout(closeTimer);
      if (isOpen) return;
      isOpen = true;
      positionPanel();
      panel.classList.add('dd-visible');
      backdrop.classList.add('dd-visible');
      btn.classList.add('dd-open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      clearTimeout(openTimer);
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('dd-visible');
      backdrop.classList.remove('dd-visible');
      btn.classList.remove('dd-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    function scheduleClose(delay) {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(close, delay || 180);
    }

    /* events */
    btn.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
      openTimer = setTimeout(open, 70);
    });
    btn.addEventListener('mouseleave', function () {
      clearTimeout(openTimer);
      scheduleClose(200);
    });
    btn.addEventListener('click', function () { isOpen ? close() : open(); });

    panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
    panel.addEventListener('mouseleave', function () { scheduleClose(160); });

    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });

    window.addEventListener('scroll', function () { if (isOpen) positionPanel(); }, { passive: true });
    window.addEventListener('resize', function () { if (isOpen) positionPanel(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   Agros — Mobile hamburger drawer
   ============================================================ */
(function () {
  'use strict';

  function prefix() {
    return window.location.pathname.includes('/products/') ? '../' : '';
  }

  var BRANDS = [
    { name: 'OLLEO', color: '#C8922A', colorLight: '#FDF3E0', href: 'products/olleo-bottles.html',
      links: [
        { name: 'Бутилки', href: 'products/olleo-bottles.html' },
        { name: 'Дози',    href: 'products/olleo-doses.html' },
      ]
    },
    { name: 'NOTEO', color: '#18988B', colorLight: '#D0F0EE', href: 'products/noteo-proteins.html',
      links: [
        { name: 'Протеини',         href: 'products/noteo-proteins.html' },
        { name: 'Брашна',           href: 'products/noteo-flours.html' },
        { name: 'Шоко кремове',     href: 'products/noteo-choco-creams.html' },
      ]
    },
    { name: "D'ORSO", color: '#7B3A60', colorLight: '#F5E0EC', href: 'products/dorso-body-care.html',
      links: [
        { name: 'Масла за тяло',    href: 'products/dorso-body-oils.html' },
        { name: 'Маски и скрабове', href: 'products/dorso-masks.html' },
        { name: 'Грижа за тяло',    href: 'products/dorso-body-care.html' },
      ]
    },
  ];

  var NAV_LINKS = [
    { name: 'За нас',    href: 'about.html' },
    { name: 'Блог',      href: 'blog.html' },
    { name: 'Контакти',  href: 'contact.html' },
  ];

  function initMobileMenu() {
    var hamburger = document.querySelector('button[aria-label="Меню"]');
    if (!hamburger) return;

    var p = prefix();

    /* ── styles ── */
    var style = document.createElement('style');
    style.textContent = [
      '.mob-drawer{position:fixed;top:0;right:0;bottom:0;width:min(320px,90vw);',
      'background:#FEFCF8;z-index:200;overflow-y:auto;',
      'transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);',
      'box-shadow:-8px 0 40px rgba(0,0,0,.14);}',
      '.mob-drawer.open{transform:translateX(0);}',
      '.mob-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);',
      'z-index:199;opacity:0;pointer-events:none;transition:opacity .3s ease;}',
      '.mob-backdrop.open{opacity:1;pointer-events:auto;}',
      '.mob-brand-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;',
      'background:none;border:none;padding:12px 20px;cursor:pointer;font-family:inherit;}',
      '.mob-brand-toggle .chevron{transition:transform .25s ease;flex-shrink:0;}',
      '.mob-brand-toggle.expanded .chevron{transform:rotate(180deg);}',
      '.mob-subnav{display:none;padding:0 20px 8px 20px;}',
      '.mob-subnav.open{display:block;}',
    ].join('');
    document.head.appendChild(style);

    /* ── drawer HTML ── */
    var drawer = document.createElement('div');
    drawer.className = 'mob-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Навигация');

    var brandsHtml = BRANDS.map(function (b, i) {
      var subLinks = b.links.map(function (l) {
        return '<a href="' + p + l.href + '" style="display:block;padding:9px 0 9px 12px;' +
          'font-family:Inter,sans-serif;font-size:.85rem;color:#4B5563;text-decoration:none;' +
          'border-left:2px solid ' + b.color + ';margin-bottom:4px;' +
          'transition:color .15s,background .15s;" ' +
          'onmouseover="this.style.color=\'' + b.color + '\'" ' +
          'onmouseout="this.style.color=\'#4B5563\'">' + l.name + '</a>';
      }).join('');

      return '<div>' +
        '<button class="mob-brand-toggle" id="mob-brand-' + i + '" onclick="(function(btn){' +
          'btn.classList.toggle(\'expanded\');' +
          'var sub=document.getElementById(\'mob-sub-' + i + '\');' +
          'sub.classList.toggle(\'open\');' +
        '})(this)">' +
        '<span style="font-family:Montserrat,sans-serif;font-size:.9rem;font-weight:700;color:' + b.color + ';">' + b.name + '</span>' +
        '<svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4.5l5 5 5-5" stroke="#9CA3AF" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="mob-subnav" id="mob-sub-' + i + '">' + subLinks + '</div>' +
        '</div>';
    }).join('');

    var navLinksHtml = NAV_LINKS.map(function (l) {
      return '<a href="' + p + l.href + '" style="display:block;padding:13px 20px;' +
        'font-family:Inter,sans-serif;font-size:.9rem;font-weight:500;color:#374151;' +
        'text-decoration:none;border-bottom:1px solid #F0EBE0;' +
        'transition:color .15s;" ' +
        'onmouseover="this.style.color=\'#186060\'" ' +
        'onmouseout="this.style.color=\'#374151\'">' + l.name + '</a>';
    }).join('');

    drawer.innerHTML =
      /* header */
      '<div style="display:flex;align-items:center;justify-content:space-between;' +
      'padding:16px 20px;border-bottom:1px solid #EDE5D5;">' +
      '<a href="' + p + 'index.html"><img src="' + p + 'images/agros-logo.png" alt="Agros" style="height:36px;width:auto;"></a>' +
      '<button id="mob-close" aria-label="Затвори" style="width:36px;height:36px;border-radius:50%;border:none;' +
      'background:#F0EBE0;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">' +
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#6B7280" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button></div>' +

      /* products section */
      '<div style="padding:8px 0;border-bottom:1px solid #EDE5D5;">' +
      '<p style="padding:10px 20px 6px;font-family:Inter,sans-serif;font-size:.7rem;font-weight:700;' +
      'color:#9CA3AF;letter-spacing:.1em;text-transform:uppercase;">Продукти</p>' +
      brandsHtml +
      '</div>' +

      /* nav links */
      navLinksHtml;

    /* ── backdrop ── */
    var backdrop = document.createElement('div');
    backdrop.className = 'mob-backdrop';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    /* ── open / close ── */
    function openMenu() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', openMenu);
    backdrop.addEventListener('click', closeMenu);
    document.getElementById('mob-close').addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();

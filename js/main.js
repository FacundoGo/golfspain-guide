// ── Nav component ─────────────────────────────────────────────────────────────
// Single source of truth for navigation links.
// Injected into every page via JS so adding a new region updates everywhere.
(function () {
  var lang = location.pathname.startsWith('/es/') ? 'es' : 'en';
  var path = location.pathname;

  // Regions for the dropdown
  var REGIONS = {
    en: [
      { href: '/en/valencia/',       label: 'Valencia',         live: true },
      { href: '/en/barcelona/',      label: 'Barcelona',        live: true },
      { href: '/en/alicante/',       label: 'Alicante',         live: true },
      { href: '/en/toledo/',         label: 'Toledo',           live: true },
      { href: null,                  label: 'Madrid',           live: false },
      { href: null,                  label: 'Andalucía',        live: false },
      { href: null,                  label: 'Castellón',        live: false }
    ],
    es: [
      { href: '/es/valencia/',       label: 'Valencia',         live: true },
      { href: '/es/barcelona/',      label: 'Barcelona',        live: true },
      { href: '/es/alicante/',       label: 'Alicante',         live: true },
      { href: '/es/toledo/',         label: 'Toledo',           live: true },
      { href: null,                  label: 'Madrid',           live: false },
      { href: null,                  label: 'Andalucía',        live: false },
      { href: null,                  label: 'Castellón',        live: false }
    ]
  };

  // Flat nav items (after the dropdown)
  var FLAT = {
    en: [
      { href: '/en/about/',               label: 'About' },
      { href: '/en/handicap-calculator/', label: 'Handicap' },
      { href: '/en/blog/',                label: 'Blog' },
      { href: '/en/newsletter/',          label: 'Newsletter' },
      { href: '/en/courses/',             label: 'All Courses', cta: true }
    ],
    es: [
      { href: '/es/about/',               label: 'Sobre nosotros' },
      { href: '/es/handicap-calculator/', label: 'Hándicap' },
      { href: '/es/blog/',                label: 'Blog' },
      { href: '/es/newsletter/',          label: 'Boletín' },
      { href: '/es/courses/',             label: 'Todos los campos', cta: true }
    ]
  };

  var dropdownLabel = lang === 'es' ? 'Campos por zona' : 'Courses by region';
  var soonLabel     = lang === 'es' ? 'Próximamente'    : 'Coming soon';

  // Build dropdown menu items
  var menuItems = REGIONS[lang].map(function (r) {
    if (r.live) {
      var active = path.startsWith(r.href) ? ' aria-current="page"' : '';
      return '<li><a href="' + r.href + '" class="nav-region nav-region--live"' + active + '>'
           + '<span class="nav-region-dot nav-region-dot--live">●</span>'
           + r.label
           + '</a></li>';
    } else {
      return '<li><span class="nav-region nav-region--soon">'
           + '<span class="nav-region-dot nav-region-dot--soon">●</span>'
           + r.label
           + '<span class="nav-coming-soon">' + soonLabel + '</span>'
           + '</span></li>';
    }
  }).join('');

  // Is current page inside any live region?
  var dropdownActive = REGIONS[lang].some(function (r) {
    return r.live && path.startsWith(r.href);
  });
  var triggerActive = dropdownActive ? ' aria-current="page"' : '';

  var dropdown = '<li class="nav-dropdown">'
    + '<button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true"' + triggerActive + '>'
    + dropdownLabel + ' <span class="nav-caret" aria-hidden="true">▾</span>'
    + '</button>'
    + '<ul class="nav-dropdown-menu" role="menu">' + menuItems + '</ul>'
    + '</li>';

  // Build flat items
  var flatItems = FLAT[lang].map(function (l) {
    var active = path.startsWith(l.href) ? ' aria-current="page"' : '';
    var cls    = l.cta ? ' class="nav__cta"' : '';
    return '<li><a href="' + l.href + '"' + cls + active + '>' + l.label + '</a></li>';
  }).join('');

  var navLinks = document.querySelector('.nav__links');
  if (navLinks) {
    navLinks.innerHTML = dropdown + flatItems;
  }

  // ── Dropdown toggle ──────────────────────────────────────────────────────────
  var trigger = document.querySelector('.nav-dropdown-trigger');
  var menu    = document.querySelector('.nav-dropdown-menu');

  if (trigger && menu) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  }
})();

// ── Mobile nav toggle ──────────────────────────────────────────────────────────
var burger = document.querySelector('.nav__burger');
var links  = document.querySelector('.nav__links');
if (burger && links) {
  burger.addEventListener('click', function () {
    links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', links.classList.contains('is-open'));
  });
}

// ── Cookie consent banner ─────────────────────────────────────────────────
(function () {
  var CONSENT_KEY = 'gsg_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(CONSENT_KEY, val); } catch (e) {}
  }

  // Signal to GA4 based on stored choice (Consent Mode v2)
  function applyGtag(accepted) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      analytics_storage:      accepted ? 'granted' : 'denied',
      ad_storage:             'denied',
      ad_user_data:           'denied',
      ad_personalization:     'denied'
    });
  }

  // If already answered, apply immediately and bail
  var stored = getConsent();
  if (stored) { applyGtag(stored === 'accepted'); return; }

  var lang = location.pathname.startsWith('/es/') ? 'es' : 'en';
  var isEs = lang === 'es';

  // ── Strings ──
  var COPY = {
    text: isEs
      ? 'Usamos cookies analíticas (Google Analytics) para entender cómo se usa el sitio. No hay publicidad ni seguimiento de terceros.'
      : 'We use analytics cookies (Google Analytics) to understand how the site is used. No advertising or third-party tracking.',
    accept: isEs ? 'Aceptar' : 'Accept',
    decline: isEs ? 'Solo esenciales' : 'Essential only',
    policy: isEs ? 'Política de privacidad' : 'Privacy policy',
    policyHref: isEs ? '/es/about/#privacidad' : '/en/about/#privacy'
  };

  // ── Build banner ──
  var banner = document.createElement('div');
  banner.id = 'gsg-privacy-bar';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', isEs ? 'Aviso de cookies' : 'Cookie notice');
  banner.innerHTML = [
    '<div class="cb-inner">',
      '<p class="cb-text">',
        '<span class="cb-icon">🍪</span>',
        COPY.text,
        ' <a href="', COPY.policyHref, '" class="cb-link">', COPY.policy, '</a>',
      '</p>',
      '<div class="cb-actions">',
        '<button id="cb-decline" class="cb-btn cb-btn--ghost">', COPY.decline, '</button>',
        '<button id="cb-accept"  class="cb-btn cb-btn--primary">', COPY.accept, '</button>',
      '</div>',
    '</div>'
  ].join('');

  // ── Styles ──
  var style = document.createElement('style');
  style.textContent = [
    '#gsg-privacy-bar{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'background:#1a3326;color:#e8f0eb;',
      'padding:14px 20px;',
      'box-shadow:0 -2px 20px rgba(0,0,0,.25);',
      'transform:translateY(100%);',
      'transition:transform .35s cubic-bezier(.4,0,.2,1);',
    '}',
    '#gsg-privacy-bar.cb-visible{transform:translateY(0);}',
    '.cb-inner{',
      'max-width:960px;margin:0 auto;',
      'display:flex;align-items:center;gap:20px;flex-wrap:wrap;',
    '}',
    '.cb-text{',
      'flex:1;min-width:220px;',
      'font-size:13px;line-height:1.55;',
      'font-family:inherit;margin:0;',
    '}',
    '.cb-icon{margin-right:6px;font-size:15px;}',
    '.cb-link{color:#a3c4b0;text-underline-offset:2px;}',
    '.cb-link:hover{color:#c8a84b;}',
    '.cb-actions{display:flex;gap:10px;flex-shrink:0;}',
    '.cb-btn{',
      'font-family:inherit;font-size:13px;font-weight:700;',
      'padding:8px 18px;border-radius:6px;cursor:pointer;',
      'border:none;white-space:nowrap;transition:opacity .15s,background .15s;',
    '}',
    '.cb-btn--primary{background:#c8a84b;color:#1a3326;}',
    '.cb-btn--primary:hover{background:#d4b55e;}',
    '.cb-btn--ghost{background:transparent;color:#a3c4b0;border:1px solid #3a5c4a;}',
    '.cb-btn--ghost:hover{background:#243d2e;}',
    '@media(max-width:540px){',
      '.cb-inner{flex-direction:column;align-items:stretch;gap:12px;}',
      '.cb-actions{justify-content:flex-end;}',
    '}'
  ].join('');

  document.head.appendChild(style);
  document.body.appendChild(banner);

  // Slide in after short delay (avoids layout-shift flash)
  setTimeout(function () { banner.classList.add('cb-visible'); }, 300);

  function dismiss(accepted) {
    setConsent(accepted ? 'accepted' : 'declined');
    applyGtag(accepted);
    banner.style.transition = 'transform .25s cubic-bezier(.4,0,.2,1)';
    banner.style.transform = 'translateY(100%)';
    setTimeout(function () { banner.parentNode && banner.parentNode.removeChild(banner); }, 280);
  }

  document.getElementById('cb-accept').addEventListener('click', function () { dismiss(true); });
  document.getElementById('cb-decline').addEventListener('click', function () { dismiss(false); });
})();

// ── Beehiiv attribution ────────────────────────────────────────────────────
(function () {
  var s = document.createElement('script');
  s.src   = 'https://subscribe-forms.beehiiv.com/attribution.js';
  s.async = true;
  document.head.appendChild(s);
})();

// ── Newsletter exit-intent popup ───────────────────────────────────────────
// Shows once per 7 days. Desktop: cursor leaves viewport top. Mobile: back-button trap.
// Replace <script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="5f86e360-0313-4edd-8574-ab07644f3912"></script> in the popup HTML below when the Beehiiv
// account is ready.
(function () {
  var STORAGE_KEY = 'gsg_nl_popup';
  var TTL_MS      = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Don't show on the newsletter page itself
  if (location.pathname.indexOf('/newsletter/') !== -1) return;

  function shouldShow() {
    try {
      var ts = localStorage.getItem(STORAGE_KEY);
      return !ts || (Date.now() - parseInt(ts, 10)) > TTL_MS;
    } catch (e) { return false; }
  }

  function markShown() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  function buildPopup(lang) {
    var isEs    = lang === 'es';
    var headline = isEs
      ? 'Antes de irte — Consigue la Guía Rápida del Golf en Valencia gratis.'
      : 'Before you go — Get the Valencia Golf Cheat Sheet free.';
    var sub      = isEs
      ? 'Precios verificados de 2026 para todos los campos, en una página.'
      : 'Verified 2026 prices for every course, one page.';
    var btn      = isEs ? 'Envíame el PDF →' : 'Send me the PDF →';
    var close    = isEs ? 'No, gracias' : 'No thanks';

    var overlay = document.createElement('div');
    overlay.id = 'nl-popup-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;',
      'display:flex;align-items:center;justify-content:center;padding:16px;',
      'animation:nlFadeIn .2s ease;'
    ].join('');

    var box = document.createElement('div');
    box.id = 'nl-popup-box';
    box.style.cssText = [
      'background:#fff;border-radius:12px;max-width:480px;width:100%;',
      'padding:32px 28px 24px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,.25);',
      'animation:nlSlideUp .25s ease;'
    ].join('');

    box.innerHTML = [
      '<button id="nl-popup-close" aria-label="Close" style="position:absolute;top:12px;right:14px;',
        'background:none;border:none;font-size:20px;cursor:pointer;color:#888;line-height:1;">✕</button>',
      '<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2e6349;">',
        isEs ? 'OFERTA EXCLUSIVA' : 'FREE DOWNLOAD', '</p>',
      '<h2 style="margin:0 0 8px;font-size:1.2rem;font-weight:800;color:#1a3326;line-height:1.3;">', headline, '</h2>',
      '<p style="margin:0 0 20px;font-size:.9rem;color:#555;line-height:1.55;">', sub, '</p>',
      '<script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="5f86e360-0313-4edd-8574-ab07644f3912"></script>',
      '<p style="margin:12px 0 0;font-size:.72rem;color:#999;text-align:center;">',
        isEs ? 'Un correo al mes. Date de baja cuando quieras.' : 'One email per month. Unsubscribe anytime.',
      '</p>',
      '<p style="margin:10px 0 0;text-align:center;">',
        '<button id="nl-popup-dismiss" style="background:none;border:none;font-size:.8rem;color:#aaa;cursor:pointer;text-decoration:underline;">', close, '</button>',
      '</p>'
    ].join('');

    overlay.appendChild(box);

    // Inject keyframe styles once
    if (!document.getElementById('nl-popup-styles')) {
      var s = document.createElement('style');
      s.id  = 'nl-popup-styles';
      s.textContent = '@keyframes nlFadeIn{from{opacity:0}to{opacity:1}}' +
        '@keyframes nlSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
      document.head.appendChild(s);
    }

    return overlay;
  }

  function showPopup() {
    if (document.getElementById('nl-popup-overlay')) return;
    markShown();

    var lang    = location.pathname.startsWith('/es/') ? 'es' : 'en';
    var overlay = buildPopup(lang);
    document.body.appendChild(overlay);

    function dismiss() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .15s';
      setTimeout(function () { overlay.parentNode && overlay.parentNode.removeChild(overlay); }, 160);
    }

    document.getElementById('nl-popup-close').addEventListener('click', dismiss);
    document.getElementById('nl-popup-dismiss').addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
    document.addEventListener('keydown', function kh(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', kh); }
    });
  }

  function init() {
    if (!shouldShow()) return;

    // Desktop — cursor exits viewport from the top
    var desktopFired = false;
    document.addEventListener('mouseleave', function handler(e) {
      if (desktopFired || e.clientY > 0) return;
      desktopFired = true;
      document.removeEventListener('mouseleave', handler);
      showPopup();
    });

    // Mobile — push a state, catch the back-button popstate
    if ('history' in window && window.innerWidth < 1024) {
      history.pushState({ nlTrap: true }, '');
      window.addEventListener('popstate', function handler(e) {
        window.removeEventListener('popstate', handler);
        if (e.state && e.state.nlTrap) showPopup();
      });
    }
  }

  // Wait until page is interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

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
      { href: '/en/courses/',             label: 'All Courses', cta: true }
    ],
    es: [
      { href: '/es/about/',               label: 'Sobre nosotros' },
      { href: '/es/handicap-calculator/', label: 'Hándicap' },
      { href: '/es/blog/',                label: 'Blog' },
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

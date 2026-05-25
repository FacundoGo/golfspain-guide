// ── Nav component ─────────────────────────────────────────────────────────────
// Single source of truth for navigation links.
// Injected into every page via JS so adding a new region updates everywhere.
(function () {
  var lang = location.pathname.startsWith('/es/') ? 'es' : 'en';
  var path = location.pathname;

  var NAV = {
    en: [
      { href: '/en/valencia/',            label: 'Valencia' },
      { href: '/en/barcelona/',           label: 'Barcelona' },
      { href: '/en/about/',               label: 'About' },
      { href: '/en/handicap-calculator/', label: 'Handicap' },
      { href: '/en/blog/',                label: 'Blog' },
      { href: '/en/courses/',             label: 'All Courses', cta: true }
    ],
    es: [
      { href: '/es/valencia/',            label: 'Valencia' },
      { href: '/es/barcelona/',           label: 'Barcelona' },
      { href: '/es/about/',               label: 'Sobre nosotros' },
      { href: '/es/handicap-calculator/', label: 'Hándicap' },
      { href: '/es/blog/',                label: 'Blog' },
      { href: '/es/courses/',             label: 'Todos los campos', cta: true }
    ]
  };

  var navLinks = document.querySelector('.nav__links');
  if (navLinks) {
    navLinks.innerHTML = NAV[lang].map(function (l) {
      var active = path.startsWith(l.href) ? ' aria-current="page"' : '';
      var cls    = l.cta ? ' class="nav__cta"' : '';
      return '<li><a href="' + l.href + '"' + cls + active + '>' + l.label + '</a></li>';
    }).join('');
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

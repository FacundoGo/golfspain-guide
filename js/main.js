// Mobile nav toggle
const burger = document.querySelector('.nav__burger');
const links  = document.querySelector('.nav__links');
if (burger && links) {
  burger.addEventListener('click', () => {
    links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', links.classList.contains('is-open'));
  });
}

/* ===========================
   HOTFIX JS: Header, Mobile Nav, Search Suggestions
   =========================== */

console.log("✅ script.hotfix.js loaded");

/* --- 1. Sticky Header Shadow on Scroll --- */
(function() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
})();

/* --- 2. Mobile Navigation Toggle --- */
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    document.body.classList.toggle('no-scroll'); // optional: lock scroll
  });
})();

/* --- 3. Search Suggestions Keyboard Navigation --- */
(function() {
  const searchInput = document.querySelector('.search-bar input');
  const suggestions = document.querySelector('.search-suggestions');

  if (!searchInput || !suggestions) return;

  let index = -1;

  searchInput.addEventListener('keydown', e => {
    const items = suggestions.querySelectorAll('.item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index = (index + 1) % items.length;
      updateSelection(items);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      index = (index - 1 + items.length) % items.length;
      updateSelection(items);
    }
    if (e.key === 'Enter') {
      if (index >= 0) {
        e.preventDefault();
        items[index].click(); // trigger selection
      }
    }
  });

  function updateSelection(items) {
    items.forEach((el, i) => {
      el.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }
})();

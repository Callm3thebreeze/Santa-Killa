import { initRevealOnScroll } from './reveal-on-scroll';

function initMobileNavigation() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');

  if (!button || !menu) {
    return;
  }

  const focusableSelector = 'a[href], button:not([disabled])';

  const setMenuState = (isOpen: boolean) => {
    button.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.toggleAttribute('data-menu-open', isOpen);
  };

  const closeMenu = () => setMenuState(false);

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  menu.addEventListener('click', (event) => {
    const target = event.target;

    if (target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (button.getAttribute('aria-expanded') !== 'true') {
      return;
    }

    if (event.key === 'Escape') {
      closeMenu();
      button.focus();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableItems = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector));

    if (!focusableItems.length) {
      return;
    }

    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    }

    if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 760px)').matches) {
      closeMenu();
    }
  });

  const updateHeaderState = () => {
    header?.classList.toggle('site-header--scrolled', window.scrollY > 24);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initSite() {
  initMobileNavigation();
  initRevealOnScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
} else {
  initSite();
}

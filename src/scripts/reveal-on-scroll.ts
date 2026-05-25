const revealSelector = '[data-reveal]';
const visibleClass = 'is-visible';

export function initRevealOnScroll() {
  const items = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));

  if (!items.length) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add(visibleClass));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(visibleClass);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
  );

  items.forEach((item) => observer.observe(item));
}

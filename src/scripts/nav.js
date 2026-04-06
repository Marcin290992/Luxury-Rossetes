import { navigate } from 'astro:transitions/client';
import { getLenis } from './lenis';

let isInitialized = false;

const MENU_CLOSE_NAV_DELAY = 420;
const MOBILE_LINK_HOVER_DELAY = 360;

function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function isDesktopMode() {
  return window.matchMedia('(min-width: 1024px)').matches && !isTouchDevice();
}

function shouldBypassMenuNavigation(event, href) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !href ||
    href === '#'
  );
}

function isCurrentPageTarget(href) {
  const targetUrl = new URL(href, window.location.href);

  return (
    targetUrl.origin === window.location.origin &&
    targetUrl.pathname === window.location.pathname &&
    targetUrl.search === window.location.search &&
    !targetUrl.hash
  );
}

export function initLuxuryNav() {
  // Reset on page transitions
  if (isInitialized) {
    return;
  }

  const floatingNav = document.getElementById('floatingNav');
  const menuBtn = document.getElementById('menuBtn');
  const fullscreenMenu = document.getElementById('fullscreenMenu');

  if (!floatingNav || !menuBtn || !fullscreenMenu) {
    return;
  }

  isInitialized = true;

  const body = document.body;
  let menuOpen = false;
  let isAnimating = false;
  let pendingNavigationTimeout = 0;
  let linksCleanup = () => {};
  let hoverCleanup = () => {};

  const closeMenu = () => {
    if (isAnimating) {
      return;
    }

    isAnimating = true;
    menuOpen = false;

    fullscreenMenu.classList.remove('active');
    menuBtn.classList.remove('active');
    floatingNav.classList.remove('menu-open');

    document.querySelectorAll('.menu-link.mobile-hover').forEach((link) => {
      link.classList.remove('mobile-hover');
    });

    window.setTimeout(() => {
      body.style.paddingRight = '';
      floatingNav.style.paddingRight = '';
      body.classList.remove('no-scroll');

      const lenis = getLenis();
      if (lenis) lenis.start();

      isAnimating = false;
    }, 120);
  };

  const openMenu = () => {
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    const lenis = getLenis();
    if (lenis) lenis.stop();

    // Measure scrollbar width BEFORE hiding it
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Compensate for scrollbar on body and fixed navbar
    body.style.paddingRight = `${scrollbarWidth}px`;
    floatingNav.style.paddingRight = `${scrollbarWidth}px`;

    body.classList.add('no-scroll');

    menuOpen = true;
    fullscreenMenu.classList.add('active');
    menuBtn.classList.add('active');
    floatingNav.classList.add('menu-open');

    window.setTimeout(() => {
      isAnimating = false;
    }, 120);
  };

  const setupMenuLinks = () => {
    linksCleanup();

    const controller = new AbortController();
    const signal = controller.signal;
    const menuLinks = document.querySelectorAll('.menu-link');

    menuLinks.forEach((menuLink) => {
      const link = menuLink.querySelector('a');
      if (!link) {
        return;
      }

      link.addEventListener(
        'click',
        (event) => {
          const href = link.getAttribute('href');
          if (shouldBypassMenuNavigation(event, href)) {
            event.preventDefault();
            return;
          }

          if (isCurrentPageTarget(href)) {
            event.preventDefault();
            closeMenu();
            return;
          }

          event.preventDefault();

          window.clearTimeout(pendingNavigationTimeout);

          const runNavigation = () => {
            pendingNavigationTimeout = window.setTimeout(() => {
              navigate(href);
            }, MENU_CLOSE_NAV_DELAY);
          };

          if (isDesktopMode()) {
            closeMenu();
            runNavigation();
            return;
          }

          menuLink.classList.add('mobile-hover');

          window.setTimeout(() => {
            closeMenu();
            runNavigation();
          }, MOBILE_LINK_HOVER_DELAY);
        },
        { signal }
      );
    });

    linksCleanup = () => controller.abort();
  };

  const setupImageHover = () => {
    hoverCleanup();

    if (!isDesktopMode()) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;
    const menuItems = document.querySelectorAll('.menu-link');
    const bgImages = document.querySelectorAll('.menu-bg-image');

    menuItems.forEach((item) => {
      item.addEventListener(
        'mouseenter',
        () => {
          const imageIndex = Number(item.getAttribute('data-image'));
          bgImages.forEach((img) => img.classList.remove('active'));

          if (Number.isInteger(imageIndex) && bgImages[imageIndex]) {
            bgImages[imageIndex].classList.add('active');
          }
        },
        { signal }
      );
    });

    hoverCleanup = () => controller.abort();
  };

  menuBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  });

  fullscreenMenu.addEventListener(
    'wheel',
    (event) => {
      if (isDesktopMode()) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  fullscreenMenu.addEventListener(
    'touchmove',
    (event) => {
      if (isDesktopMode()) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  let resizeTimeout = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      setupMenuLinks();
      setupImageHover();
    }, 180);
  });

  setupMenuLinks();
  setupImageHover();
}

// Handle page transitions - reset initialization flag
document.addEventListener('astro:page-load', () => {
  isInitialized = false;
  initLuxuryNav();
});

// Export globally for inline scripts
if (typeof window !== 'undefined') {
  window.initLuxuryNav = initLuxuryNav;
}

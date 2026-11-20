const menu = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
const mobile = matchMedia('(max-width: 720px)');

function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
}

menu.hidden = !mobile.matches;
mobile.addEventListener('change', () => {
  menu.hidden = !mobile.matches;
  closeMenu();
});
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
});
nav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !mobile.matches) return;

  closeMenu();
  const section = document.querySelector(link.hash);
  section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const gallery = document.querySelector('.gallery');
const controls = document.querySelector('.gallery-controls');
const [previous, next] = controls.querySelectorAll('button');

function updateGalleryControls() {
  previous.setAttribute('aria-disabled', String(gallery.scrollLeft <= 1));
  next.setAttribute('aria-disabled', String(gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1));
}

controls.hidden = false;
controls.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || button.getAttribute('aria-disabled') === 'true') return;

  const [first, second] = gallery.children;
  const step = second.offsetLeft - first.offsetLeft;
  gallery.scrollBy({ left: step * Number(button.dataset.direction), behavior: motion.matches ? 'instant' : 'smooth' });
});
gallery.addEventListener('scroll', updateGalleryControls, { passive: true });
window.addEventListener('resize', updateGalleryControls);
updateGalleryControls();

const videos = document.querySelectorAll('video[data-src]');
const toggle = document.querySelector('.preview-toggle');
const visibleVideos = new Set();
let previewsPaused = false;

function updatePreviews() {
  toggle.hidden = motion.matches;
  toggle.textContent = previewsPaused ? 'Play previews' : 'Pause previews';

  for (const video of videos) {
    if (motion.matches) {
      video.pause();
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
    } else if (previewsPaused || document.hidden || !visibleVideos.has(video)) {
      video.pause();
    } else {
      if (!video.hasAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => {});
    }
  }
}

const observer = new IntersectionObserver((entries) => {
  for (const { target, isIntersecting } of entries) {
    if (isIntersecting) visibleVideos.add(target);
    else visibleVideos.delete(target);
  }
  updatePreviews();
}, { threshold: 0.2 });

videos.forEach((video) => observer.observe(video));
toggle.addEventListener('click', () => {
  previewsPaused = !previewsPaused;
  updatePreviews();
});
motion.addEventListener('change', updatePreviews);
document.addEventListener('visibilitychange', updatePreviews);
updatePreviews();

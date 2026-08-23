// Navbar scroll state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll reveal
// threshold must be near 0: tall blocks (e.g. the biography text) can never
// reach a 15% visible ratio on small viewports, leaving them permanently hidden
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.01, rootMargin: '0px 0px -30px 0px' });

revealEls.forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
  observer.observe(el);
});

// Safety net: reveal anything in view or already scrolled past that the
// observer missed (fast scrolling can skip elements between frames)
function revealMissed() {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('in');
      observer.unobserve(el);
    }
  });
}
window.addEventListener('scroll', revealMissed, { passive: true });
window.addEventListener('load', revealMissed);

// Click-to-play YouTube embeds
document.querySelectorAll('.video-card').forEach(card => {
  card.addEventListener('click', () => {
    const id = card.dataset.id;
    const thumb = card.querySelector('.video-thumb');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    iframe.title = card.querySelector('h3').textContent;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    thumb.innerHTML = '';
    thumb.appendChild(iframe);
    card.style.cursor = 'default';
  }, { once: true });
});

(() => {
  const theme = { background: 0x161616, accent: 0xb8f34a, secondary: 0x8c8c8c };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  let effect;
  const animations = new Set();

  function animate(target, options) {
    if (reduced.matches || paused || !window.anime?.animate) return;
    const animation = anime.animate(target, options);
    animations.add(animation);
    animation.then(() => animations.delete(animation));
    return animation;
  }

  try {
    effect = createSceneHero();
  } catch (error) {
    console.error(error);
    document.body.classList.add('no-webgl');
  }

  animate('.title-line', { y: [45, 0], opacity: [0, 1], duration: 1300, delay: anime.stagger(160), ease: 'outExpo' });
  animate('.reveal', { y: [18, 0], opacity: [0, 1], duration: 1000, delay: anime.stagger(110, { start: 480 }), ease: 'outQuart' });

  new IntersectionObserver(entries => { effect?.setVisible(entries[0].isIntersecting); }, { threshold: 0 }).observe(document.querySelector('.hero'));

  function updateMotion() {
    document.body.classList.toggle('paused', paused);
    effect?.setPaused(paused);

    if (paused) animations.forEach(animation => { animation.complete(); });
  }
  reduced.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  updateMotion();
  window.addEventListener('pagehide', () => effect?.destroy(), { once: true });
  // Exposed solely for this visual study's browser verification.
  window.motionStudy = { get effect() { return effect; }, get theme() { return 'lime'; }, get paused() { return paused; }, get sceneHero() { return effect; } };
})();

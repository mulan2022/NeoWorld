(() => {
  const video = document.querySelector('#scene-video');
  const source = video.querySelector('source');
  const error = document.querySelector('.scene-video-error');
  let inView = false;
  let loaded = false;
  let resumeOnVisibility = false;
  video.muted = true;
  const showError = () => { error.hidden = false; };
  video.addEventListener('error', showError);
  source.addEventListener('error', showError);
  function loadVideo() {
    if (loaded) return;
    loaded = true;
    video.poster = video.dataset.poster;
    source.src = source.dataset.src;
    video.load();
  }
  function playVisibleVideo() {
    if (!inView || document.hidden) return;
    loadVideo();
    // Native controls remain available if the browser declines autoplay.
    video.play().then(() => {
      if (!inView || document.hidden) video.pause();
    }).catch(() => {});
  }
  new IntersectionObserver(entries => {
    const entry = entries[0];
    inView = entry.isIntersecting && entry.intersectionRatio >= .08;
    if (inView) playVisibleVideo();
    else { resumeOnVisibility = false; video.pause(); }
  }, { threshold: .08 }).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnVisibility = !video.paused;
      video.pause();
    } else if (resumeOnVisibility) {
      resumeOnVisibility = false;
      playVisibleVideo();
    }
  });
})();

(() => {
  const video = document.querySelector('#scene-video');
  const error = document.querySelector('.scene-video-error');
  let inView = false;
  let resumeOnVisibility = false;
  video.muted = true;
  const showError = () => { error.hidden = false; };
  video.addEventListener('error', showError);
  video.querySelector('source').addEventListener('error', showError);
  function playVisibleVideo() {
    if (!inView || document.hidden) return;
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

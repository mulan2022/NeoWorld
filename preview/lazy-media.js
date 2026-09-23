(() => {
  const section = document.querySelector('#interactive');
  const scripts = new Map();
  let viewerPromise;

  function script(source) {
    if (!scripts.has(source)) {
      scripts.set(source, new Promise((resolve, reject) => {
        const element = document.createElement('script');
        element.src = source;
        element.onload = resolve;
        element.onerror = () => reject(new Error(`Could not load ${source}`));
        document.head.append(element);
      }));
    }
    return scripts.get(source);
  }

  function loadViewer() {
    if (!viewerPromise) {
      viewerPromise = script('vendor/OBJLoader.js')
        .then(() => script('vendor/OrbitControls.js'))
        .then(() => script('articulation.js?v=geometry-26'))
        .catch(error => {
          console.error('Object viewer:', error);
          const message = document.querySelector('#object-loading p');
          if (message) message.textContent = 'Could not start the object viewer.';
          throw error;
        });
    }
    return viewerPromise;
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    loadViewer();
  }, { rootMargin: '800px 0px' });
  observer.observe(section);
  window.loadArticulationViewer = loadViewer;
})();

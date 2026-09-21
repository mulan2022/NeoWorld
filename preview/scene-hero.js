// Prebaked feature edges from Scene 01 keep the cover light while preserving its geometry.
window.createSceneHero = function createSceneHero() {
  const T = window.THREE;
  const host = document.querySelector('#world');
  const hero = document.querySelector('.hero');
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const rootStyle = getComputedStyle(document.documentElement);
  const background = rootStyle.getPropertyValue('--bg').trim() || '#161616';
  const accent = rootStyle.getPropertyValue('--accent').trim() || '#b8f34a';
  const secondary = rootStyle.getPropertyValue('--hero-wire').trim() || '#8b9875';
  renderer.setClearColor(background);
  host.append(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-6, 6, 5, -5, .1, 80);
  const root = new T.Group();
  root.name = 'NeoWorld_Studio_Scene01';
  scene.add(root);
  const pointer = new T.Vector2();
  const eased = new T.Vector2();
  const target = new T.Vector3();
  let bounds, focusBounds, ready = false, disposed = false, paused = false, visible = true, dirty = true;
  let width = 1, height = 1, baseHeight = 10;
  const edgeMaterial = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: .8 });
  const structureMaterial = new T.LineBasicMaterial({ color: secondary, transparent: true, opacity: .42 });
  function pose() {
    // Stay on the open side of the reconstruction, above the furniture.
    const azimuth = T.MathUtils.degToRad(4 + eased.x * 12);
    const elevation = T.MathUtils.degToRad(15 - eased.y * 6);
    camera.position.set(20 * Math.cos(elevation) * Math.sin(azimuth), 20 * Math.sin(elevation), 20 * Math.cos(elevation) * Math.cos(azimuth));
    camera.position.add(target);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
  }
  function fit() {
    if (!focusBounds) return;
    // Fit all allowed mouse angles, so the furniture stays framed at every extreme.
    let halfWidth = 0, halfHeight = 0;
    const saved = eased.clone();
    for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) {
      eased.set(x, y); pose();
      for (const bx of [focusBounds.min.x, focusBounds.max.x]) for (const by of [focusBounds.min.y, focusBounds.max.y]) for (const bz of [focusBounds.min.z, focusBounds.max.z]) {
        const point = new T.Vector3(bx, by, bz).applyMatrix4(camera.matrixWorldInverse);
        halfWidth = Math.max(halfWidth, Math.abs(point.x));
        halfHeight = Math.max(halfHeight, Math.abs(point.y));
      }
    }
    eased.copy(saved); pose();
    baseHeight = Math.max(halfHeight * 2, halfWidth * 2 / (width / height)) / .95;
    const offsetY = baseHeight * -0.3;
    camera.top = baseHeight / 2; camera.bottom = -baseHeight / 2 + offsetY;
    camera.right = baseHeight * width / height / 2; camera.left = -camera.right;
    camera.updateProjectionMatrix(); dirty = true;
  }
  const resize = new ResizeObserver(() => {
    width = Math.max(host.clientWidth, 1); height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height, false); fit(); dirty = true;
  });
  resize.observe(host);
  function move(event) {
    if (paused || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    pointer.set(T.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1), T.MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1));
  }
  function leave() { pointer.set(0, 0); }
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', leave);
  (async () => {
    try {
      const response = await fetch('./assets/studio/scenes/scene-01/scene-wireframe.bin');
      if (!response.ok) throw new Error(`Could not load wireframe (${response.status})`);
      const buffer = await response.arrayBuffer();
      const view = new DataView(buffer);
      if (view.getUint32(0, false) !== 0x4e574631) throw new Error('Invalid wireframe header');
      const accentCount = view.getUint32(4, true);
      const structureCount = view.getUint32(8, true);
      const accentPositions = new Float32Array(buffer, 12, accentCount * 3);
      const structurePositions = new Float32Array(buffer, 12 + accentPositions.byteLength, structureCount * 3);
      const geometry = positions => {
        const result = new T.BufferGeometry();
        result.setAttribute('position', new T.BufferAttribute(positions, 3));
        result.computeBoundingBox();
        return result;
      };
      const accentGeometry = geometry(accentPositions);
      const structureGeometry = geometry(structurePositions);
      root.add(new T.LineSegments(accentGeometry, edgeMaterial), new T.LineSegments(structureGeometry, structureMaterial));
      bounds = accentGeometry.boundingBox.clone().union(structureGeometry.boundingBox);
      focusBounds = accentGeometry.boundingBox.clone();
      if (focusBounds.isEmpty()) focusBounds.copy(bounds);
      focusBounds.getCenter(target);
      const grid = new T.GridHelper(11, 22, 0x42483c, 0x292c27);
      grid.position.y = bounds.min.y - .025;
      grid.material.transparent = true; grid.material.opacity = .5;
      scene.add(grid);
      if (disposed) return;
      ready = true; host.dataset.scene = 'scene-01'; fit();
    } catch (error) {
      host.dataset.scene = 'error';
      console.error('Scene 01 cover:', error);
    }
  })();
  let request;
  function frame() {
    if (disposed) return;
    request = requestAnimationFrame(frame);
    if (!visible || document.hidden || !ready) return;
    if (!paused && eased.distanceToSquared(pointer) > .000001) {
      eased.lerp(pointer, .045); pose(); dirty = true;
    }
    if (dirty) { renderer.render(scene, camera); dirty = false; }
  }
  pose(); frame();
  return {
    scene, root, camera, renderer,
    get ready() { return ready; }, get bounds() { return bounds; }, get focusBounds() { return focusBounds; },
    setVisible(value) { visible = value; dirty = true; },
    setPaused(value) { paused = value; if (paused) { pointer.set(0, 0); eased.set(0, 0); pose(); dirty = true; } },
    destroy() {
      disposed = true; cancelAnimationFrame(request); resize.disconnect();
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave);
      const geometries = new Set(); scene.traverse(child => { if (child.geometry) geometries.add(child.geometry); });
      geometries.forEach(g => g.dispose());
      scene.traverse(child => { if (child.isGridHelper) child.material.dispose(); });
      edgeMaterial.dispose(); structureMaterial.dispose();
      renderer.dispose(); renderer.domElement.remove();
    },
  };
};

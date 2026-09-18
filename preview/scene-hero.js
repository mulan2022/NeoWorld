// Scene 01 from the supplied Studio glTF; feature edges preserve the original geometry.
window.createSceneHero = function createSceneHero() {
  const T = window.THREE;
  const host = document.querySelector('#world');
  const hero = document.querySelector('.hero');
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x161616);
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
  const draco = new T.DRACOLoader().setDecoderPath('vendor/draco/').setWorkerLimit(2);
  const loader = new T.GLTFLoader().setDRACOLoader(draco);
  const architecture = /wall|floor|glass|threshold|ceiling/i;
  const edgeMaterial = new T.LineBasicMaterial({ color: 0xb8f34a, transparent: true, opacity: .8 });
  const structureMaterial = new T.LineBasicMaterial({ color: 0x8b9875, transparent: true, opacity: .42 });
  const surfaceMaterial = new T.MeshBasicMaterial({ color: 0x161616, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
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
    camera.top = baseHeight / 2; camera.bottom = -baseHeight / 2+ offsetY;
    camera.bottom = -baseHeight / 2 + offsetY;
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
  loader.load('./assets/studio/scenes/scene-01/scene.glb', gltf => {
    if (disposed) return;
    const model = gltf.scene;
    model.updateMatrixWorld(true);
    const originalBounds = new T.Box3().setFromObject(model);
    const center = originalBounds.getCenter(new T.Vector3());
    const size = originalBounds.getSize(new T.Vector3());
    const scale = 7.5 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(scale); root.position.copy(center).multiplyScalar(-scale);
    // Dispose source materials and textures once; the cover uses only ink and dark surfaces.
    const materials = new Set(), textures = new Set(), meshes = [];
    model.traverse(child => { if (child.isMesh) meshes.push(child); });
    for (const mesh of meshes) {
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
      mesh.material = surfaceMaterial;
      const edges = new T.LineSegments(new T.EdgesGeometry(mesh.geometry, 24), architecture.test(mesh.name) ? structureMaterial : edgeMaterial);
      edges.name = mesh.name + '_feature_edges';
      mesh.add(edges);
    }
    materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    root.add(model); root.updateMatrixWorld(true);
    bounds = new T.Box3().setFromObject(root);
    // Empty floor and partial glass panels should not shrink the coffee-area subject.
    focusBounds = new T.Box3();
    for (const mesh of meshes) if (!architecture.test(mesh.name)) focusBounds.expandByObject(mesh);
    if (focusBounds.isEmpty()) focusBounds.copy(bounds);
    focusBounds.getCenter(target);
    const grid = new T.GridHelper(11, 22, 0x42483c, 0x292c27);
    grid.position.y = bounds.min.y - .025;
    grid.material.transparent = true; grid.material.opacity = .5;
    scene.add(grid);
    ready = true; host.dataset.scene = 'scene-01'; fit();
    draco.dispose();
  }, undefined, error => {
    host.dataset.scene = 'error';
    console.error('Scene 01 cover:', error);
    draco.dispose();
  });
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
      disposed = true; cancelAnimationFrame(request); resize.disconnect(); draco.dispose();
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave);
      const geometries = new Set(); scene.traverse(child => { if (child.geometry) geometries.add(child.geometry); });
      geometries.forEach(g => g.dispose());
      scene.traverse(child => { if (child.isGridHelper) child.material.dispose(); });
      edgeMaterial.dispose(); structureMaterial.dispose(); surfaceMaterial.dispose();
      renderer.dispose(); renderer.domElement.remove();
    },
  };
};

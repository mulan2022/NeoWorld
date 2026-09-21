# NeoWorld

Official NeoWorld-3 research blog: **Building Interactive Worlds for Embodied Intelligence**.

Live site: https://mulan2022.github.io/NeoWorld/

Light article palette for review: https://mulan2022.github.io/NeoWorld/?theme=light

## Publish

Push changes to `main`. `.github/workflows/pages.yml` packages the source and publishes it using GitHub Pages. Repository Settings → Pages → Source is **GitHub Actions**.

## Source

- `preview/`: HTML, styles, and JavaScript. Homepage camera and framing are in `preview/scene-hero.js`.
- `assets/`: Scene 01 source model, optimized hero wireframe, video, subset pixel font, and ten articulated URDF objects.
- `scripts/build-pages.py`: dependency-free packaging script. Run `python scripts/build-pages.py` to build `site/` locally.

The generated site uses relative URLs so it works under `/NeoWorld/`. Serve `site/` through an HTTP server to preview; opening `index.html` as a local file cannot load the 3D assets.

The homepage loads a prebaked line-only scene. The video and articulation viewer start loading near their sections; each published URDF object is delivered as one compressed runtime bundle, and large PNG materials use WebP runtime copies.

## Attribution

The research article is maintained in `Neoworld-3_blog.md` and presented in `preview/index.html`. The Scene 01 coffee-area GLB, comparison video, and poster originate from [NeoWorld Studio](https://neoworldproject.github.io/Studio/). The URDF viewer demonstrates kinematics, without a physics solver. Three.js and Anime.js licenses are retained under `preview/vendor/` and copied into the published bundle.

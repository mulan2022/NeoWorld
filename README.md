# NeoWorld

Official NeoWorld-3 research blog: **Building Interactive Worlds for Embodied Intelligence**.

Live site: https://mulan2022.github.io/NeoWorld/

## Publish

Push changes to `main`. `.github/workflows/pages.yml` packages the source and publishes it using GitHub Pages. Repository Settings → Pages → Source is **GitHub Actions**.

## Source

- `preview/`: HTML, styles, and JavaScript. Homepage camera and framing are in `preview/scene-hero.js`.
- `assets/`: Scene 01 model and video, pixel font, and ten articulated URDF objects.
- `scripts/build-pages.py`: dependency-free packaging script. Run `python scripts/build-pages.py` to build `site/` locally.

The generated site uses relative URLs so it works under `/NeoWorld/`. Serve `site/` through an HTTP server to preview; opening `index.html` as a local file cannot load the 3D assets.

## Attribution

The research article is maintained in `Neoworld-3_blog.md` and presented in `preview/index.html`. The Scene 01 coffee-area GLB, comparison video, and poster originate from [NeoWorld Studio](https://neoworldproject.github.io/Studio/). The URDF viewer demonstrates kinematics, without a physics solver. Three.js and Anime.js licenses are retained under `preview/vendor/` and copied into the published bundle.

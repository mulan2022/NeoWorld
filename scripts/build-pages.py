"""Package the current website and its referenced assets for GitHub Pages."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site"
PAGE_FILES = ["index.html", "style.css", "viewer.css", "app.js", "scene-hero.js", "articulation.js", "scene-video.js"]
VENDOR_FILES = ["three.min.js", "three.LICENSE", "anime.umd.min.js", "anime.LICENSE.md", "GLTFLoader.js", "DRACOLoader.js", "OBJLoader.js", "OrbitControls.js"]
ASSET_FILES = ["fusion-pixel-12px-proportional-latin.ttf.woff2", "studio/scenes/scene-01/scene.glb", "studio/videos/scene-01.mp4", "studio/posters/scene-01.jpg"]
def copy(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
def build():
    OUTPUT.mkdir(exist_ok=True)
    for name in PAGE_FILES:
        copy(ROOT / "preview" / name, OUTPUT / name)
    for name in VENDOR_FILES:
        copy(ROOT / "preview/vendor" / name, OUTPUT / "vendor" / name)
    for name in ["draco_wasm_wrapper.js", "draco_decoder.wasm", "draco_decoder.js"]:
        copy(ROOT / "preview/vendor/draco" / name, OUTPUT / "vendor/draco" / name)
    for name in ["neoworld-nw-small.svg", "neoworld-favicon.svg"]:
        copy(ROOT / "preview/brand" / name, OUTPUT / "brand" / name)
    for name in ASSET_FILES:
        copy(ROOT / "assets" / name, OUTPUT / "assets" / name)
    source = ROOT / "assets/batch5_collision_urdf_textured"
    for path in source.rglob("*"):
        if path.is_file():
            copy(path, OUTPUT / "assets/batch5_collision_urdf_textured" / path.relative_to(source))
    (OUTPUT / ".nojekyll").touch()
    files = [p for p in OUTPUT.rglob("*") if p.is_file()]
    print(f"GitHub Pages bundle: {len(files)} files, {sum(p.stat().st_size for p in files) / 1024 / 1024:.2f} MiB -> {OUTPUT}")
if __name__ == "__main__":
    build()

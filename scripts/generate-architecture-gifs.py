from __future__ import annotations

import argparse
import asyncio
import math
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'architecture'
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
SIZE = (320, 220)
BG = (22, 22, 22)


def cover(image: Image.Image, size=SIZE, scale=1.0, offset=(0, 0)) -> Image.Image:
    image = image.convert('RGB')
    ratio = max(size[0] / image.width, size[1] / image.height) * scale
    resized = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2 - offset[0]
    top = (resized.height - size[1]) // 2 - offset[1]
    return resized.crop((left, top, left + size[0], top + size[1]))


def save_gif(name: str, frames: Iterable[Image.Image], duration=95) -> None:
    frames = [frame.convert('RGB').resize(SIZE, Image.Resampling.LANCZOS) for frame in frames]
    palette = frames[0].quantize(colors=96, method=Image.Quantize.MEDIANCUT)
    quantized = [frame.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG) for frame in frames]
    OUT.mkdir(parents=True, exist_ok=True)
    quantized[0].save(OUT / name, save_all=True, append_images=quantized[1:], duration=duration, loop=0, optimize=True, disposal=2)
    print(name, len(frames), (OUT / name).stat().st_size)


def observation_gif() -> None:
    paths = [
        ROOT / 'assets/reference_image_3_5ids/reference_image_3/100520.png',
        ROOT / 'assets/reference_image_3_5ids/reference_image_3/100842.png',
        ROOT / 'assets/batch5_collision_references_image3/101917_image_3.png',
        ROOT / 'assets/batch5_collision_references_image3/101463_image_3.png',
    ]
    frames = []
    for path in paths:
        source = Image.open(path)
        for step in range(4):
            frames.append(cover(source, scale=1.06 + step * .012, offset=(step - 1, 0)))
    blended = []
    for i, frame in enumerate(frames):
        blended.append(frame)
        if i % 4 == 3:
            nxt = frames[(i + 1) % len(frames)]
            blended.append(Image.blend(frame, nxt, .5))
    save_gif('observation.gif', blended, 145)


def mask_and_depth(frames: list[Image.Image]) -> None:
    def largest_component(mask: Image.Image) -> Image.Image:
        pixels = mask.load(); width, height = mask.size
        seen = set(); largest = []
        for y in range(height):
            for x in range(width):
                if not pixels[x, y] or (x, y) in seen: continue
                stack = [(x, y)]; seen.add((x, y)); component = []
                while stack:
                    cx, cy = stack.pop(); component.append((cx, cy))
                    for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                        if 0 <= nx < width and 0 <= ny < height and pixels[nx, ny] and (nx, ny) not in seen:
                            seen.add((nx, ny)); stack.append((nx, ny))
                if len(component) > len(largest): largest = component
        cleaned = Image.new('L', mask.size)
        out = cleaned.load()
        for x, y in largest: out[x, y] = 255
        return cleaned.filter(ImageFilter.MaxFilter(3))

    outputs=[]
    for index, frame in enumerate(frames):
        image=frame.convert('RGB')
        bg=Image.new('RGB', image.size, BG)
        diff=ImageChops.difference(image,bg).convert('L').filter(ImageFilter.GaussianBlur(1.2))
        mask=largest_component(diff.point(lambda x: 255 if x>24 else 0).filter(ImageFilter.MaxFilter(5)))
        if (index // 4) % 2 == 0:
            pane=Image.new('RGB',image.size,(7,17,27))
            pane.paste((238,245,242),mask=mask)
        else:
            grad=Image.new('RGB',image.size)
            px=grad.load()
            for y in range(image.height):
                t=y/max(image.height-1,1)
                color=(round(39+25*t),round(225-90*t),round(245-25*t))
                for x in range(image.width): px[x,y]=color
            pane=Image.new('RGB',image.size,(6,17,29)); pane.paste(grad,mask=mask)
        draw=ImageDraw.Draw(pane)
        label='MASK' if (index//4)%2==0 else 'DEPTH'
        draw.rounded_rectangle((10,10,76,34),6,fill=(7,17,27),outline=(89,216,230),width=2)
        draw.text((19,17),label,fill=(220,247,250))
        outputs.append(pane)
    save_gif('target.gif',outputs,105)


def fitted(frames: list[Image.Image]) -> None:
    output=[]
    for i,frame in enumerate(frames):
        pane=frame.copy(); draw=ImageDraw.Draw(pane)
        pulse=round(3*math.sin(i/len(frames)*math.tau))
        box=(62-pulse,28-pulse,260+pulse,202+pulse)
        draw.rectangle(box,outline=(89,216,230),width=2)
        for x,y in [(box[0],box[1]),(box[2],box[1]),(box[0],box[3]),(box[2],box[3])]:
            draw.ellipse((x-4,y-4,x+4,y+4),fill=(7,17,27),outline=(89,216,230),width=2)
        output.append(pane)
    save_gif('fit.gif',output,90)


def admitted(solid: list[Image.Image], wire: list[Image.Image]) -> None:
    output=[]
    count=min(len(solid),len(wire))
    for i in range(count):
        pane=Image.new('RGB',SIZE,(12,20,27))
        left=solid[i].resize((158,220),Image.Resampling.LANCZOS)
        right=wire[i].resize((158,220),Image.Resampling.LANCZOS)
        pane.paste(left,(0,0)); pane.paste(right,(162,0))
        draw=ImageDraw.Draw(pane)
        draw.line((160,0,160,220),fill=(85,105,112),width=2)
        draw.rounded_rectangle((14,174,58,208),7,fill=(28,167,130)); draw.text((29,184),'OK',fill='white')
        draw.rounded_rectangle((262,174,306,208),7,fill=(213,91,75)); draw.text((276,184),'X',fill='white')
        output.append(pane)
    save_gif('admit.gif',output,95)


def retained(frames_by_object: list[list[Image.Image]]) -> None:
    output=[]
    for group in frames_by_object:
        take=max(1,len(group)//6)
        output.extend(group[::take][:6])
    save_gif('retained.gif',output,125)


async def capture(base_url: str) -> None:
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path=EDGE,headless=True,args=['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page=await browser.new_page(viewport={'width':1180,'height':760})
        await page.goto(base_url.rstrip('/')+'/#interactive',wait_until='networkidle')
        await page.locator('#interactive').scroll_into_view_if_needed()

        async def load(object_id: str):
            await page.locator(f'[data-object="{object_id}"]').click()
            await page.wait_for_function("id => articulationStudy.current?.id === id && document.querySelector('#object-loading').hidden",arg=object_id,timeout=120000)
            if await page.locator('#object-play').get_attribute('aria-pressed') == 'true': await page.locator('#object-play').click()
            await page.evaluate("""() => { articulationStudy.orbit.enableDamping=false; articulationStudy.orbit.update(); }""")

        async def frame(angle: float, joint_phase: float|None=None) -> Image.Image:
            await page.evaluate("""({angle,phase}) => {
              const s=articulationStudy, e=s.current.extent, t=s.orbit.target;
              const radius=e*2.55;
              s.camera.position.set(t.x+Math.sin(angle)*radius,t.y+e*.72,t.z+Math.cos(angle)*radius);
              s.camera.lookAt(t); s.orbit.update();
              if(phase!==null){
                document.querySelectorAll('#joint-controls input[type=range]').forEach((input,index)=>{
                  const lo=Number(input.min),hi=Number(input.max);
                  input.value=lo+(hi-lo)*((Math.sin(phase+index*.42)+1)/2);
                  input.dispatchEvent(new Event('input',{bubbles:true}));
                });
              }
            }""",{'angle':angle,'phase':joint_phase})
            await page.wait_for_timeout(70)
            data=await page.locator('#object-canvas canvas').screenshot()
            import io
            return cover(Image.open(io.BytesIO(data)),SIZE,1.0)

        async def orbit_frames(object_id: str, wire=False, count=18):
            await load(object_id)
            pressed=await page.locator('#object-wire').get_attribute('aria-pressed')
            if (pressed=='true') != wire: await page.locator('#object-wire').click()
            return [await frame(i/count*math.tau) for i in range(count)]

        solid=await orbit_frames('100520',False)
        wire=await orbit_frames('100520',True)
        await page.locator('#object-wire').click()
        await load('8994')
        physics=[await frame(-.45,i/18*math.tau) for i in range(18)]
        suitcase=await orbit_frames('100842',False,12)
        oven=await orbit_frames('101917',False,12)
        spray=await orbit_frames('101463',False,12)
        await browser.close()

    save_gif('place-render.gif',solid,90)
    save_gif('audit.gif',wire,90)
    save_gif('physics.gif',physics,90)
    mask_and_depth(solid)
    fitted(solid)
    admitted(solid,wire)
    retained([suitcase,oven,spray])


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8765')
    args=parser.parse_args()
    observation_gif()
    asyncio.run(capture(args.base_url))

if __name__=='__main__': main()

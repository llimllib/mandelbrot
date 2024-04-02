---
toc: false
---

<style>
.canvases {
  position:relative;
  width: 800px;
  height: 800px;
}
canvas {
  image-rendering: pixelated;
}
.canvases canvas {
  position:absolute;
  top:0px;
  left:0px;
  width:800px;
  height:800px;
}
</style>

# Zoomable Mandelbrot

I used [this article](https://miriam-english.org/files/Dewdney_Mandelbrot/Dewdney_Mandelbrot.html) as a starting point

<div class="canvases">
  <canvas id="mcanv" width=800 height=800></canvas>
  <canvas id="overlay" width=800 height=800></canvas>
</div>

```js echo
import { fmandelbrot } from "./components/mandelbrot.js";

const MAX_ITER = 512;

const W = 800;
const H = 800;

let xscale = d3.scaleLinear([0, W], [-2, 0.6]);
let yscale = d3.scaleLinear([0, H], [1.25, -1.25]);

const colors = new Map();
const colorscale = d3
  .scaleSequentialLog(d3.interpolateInferno)
  .domain([1, MAX_ITER]);
for (let i = 1; i < MAX_ITER; i++) {
  colors.set(i, colorscale(i));
}
colors.set(MAX_ITER, `rgb(0, 0, 0)`);

const ctx = document.querySelector("canvas#mcanv").getContext("2d");
const drawRow = (ctx, xscale, yscale, y = 0, rows = 20) => {
  for (let i = 0; i < rows; i++) {
    for (let x = 0; x <= W; x++) {
      const l = fmandelbrot([xscale(x), yscale(y + i)], MAX_ITER);
      ctx.fillStyle = colors.get(l);
      ctx.fillRect(x, y + i, 1, 1);
    }
  }
  if (y < H) {
    requestAnimationFrame(() => drawRow(ctx, xscale, yscale, y + rows, rows));
  }
};
requestAnimationFrame(() => drawRow(ctx, xscale, yscale));

const overlay = document.querySelector("canvas#overlay").getContext("2d");
const bbox = document.querySelector("canvas#overlay").getBoundingClientRect();
let coords = [0, 0];
let mousedown = false;
document.querySelector("#overlay").addEventListener("mousedown", (e) => {
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  coords = [mx, my];
  mousedown = true;
});
document.querySelector("#overlay").addEventListener("mousemove", (e) => {
  if (mousedown) {
    const mx = e.clientX - bbox.left;
    const my = e.clientY - bbox.top;
    overlay.clearRect(0, 0, W, H);
    overlay.strokeStyle = "white";
    overlay.strokeRect(coords[0], coords[1], mx - coords[0], my - coords[1]);
  }
});
document.querySelector("#overlay").addEventListener("mouseup", (e) => {
  if (!mousedown) {
    return;
  }
  mousedown = false;
  overlay.clearRect(0, 0, W, H);
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  const minx = Math.min(coords[0], mx);
  const maxx = Math.max(coords[0], mx);
  const miny = Math.min(coords[1], my);
  const maxy = Math.max(coords[1], my);
  const maxDiff = Math.max(maxx - minx, maxy - miny);
  xscale = d3.scaleLinear([0, W], [xscale(minx), xscale(minx + maxDiff)]);
  yscale = d3.scaleLinear([0, H], [yscale(miny), yscale(miny + maxDiff)]);
  requestAnimationFrame(() => drawRow(ctx, xscale, yscale));
});
```

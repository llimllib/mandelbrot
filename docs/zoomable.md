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

- click and drag to zoom in on an area
- click the `reset zoom` button to get back to the start
- press the `i` key to view info about the zoomed area
- I used [this article](https://miriam-english.org/files/Dewdney_Mandelbrot/Dewdney_Mandelbrot.html) as a starting point. Source code [available here](https://github.com/llimllib/mandelbrot)

```js
const reset = view(Inputs.button("reset zoom"));
```

```js
reset;
state.xscale = d3.scaleLinear([0, W], [-2, 0.6]);
state.yscale = d3.scaleLinear([0, H], [1.25, -1.25]);
if (state.infoEnabled) {
  clearOverlay();
  drawDebug();
}
requestAnimationFrame(() =>
  drawRow(
    document.querySelector("canvas#mcanv").getContext("2d"),
    state.xscale,
    state.yscale,
  ),
);
```

<div class="canvases">
  <canvas id="mcanv" width=800 height=800></canvas>
  <canvas id="overlay" width=800 height=800></canvas>
</div>

```js echo
import { fmandelbrot } from "./components/mandelbrot.js";

const MAX_ITER = 512;

const W = 800;
const H = 800;

const state = {
  xscale: d3.scaleLinear([0, W], [-2, 0.6]),
  yscale: d3.scaleLinear([0, H], [1.25, -1.25]),
  infoEnabled: false,
};

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
requestAnimationFrame(() => drawRow(ctx, state.xscale, state.yscale));

const ocanvas = document.querySelector("canvas#overlay");
const overlay = ocanvas.getContext("2d");
const bbox = ocanvas.getBoundingClientRect();

overlay.font = "24px Arial";
let coords = [0, 0];
let mousedown = false;

const drawDebug = () => {
  overlay.fillStyle = "white";
  overlay.strokeStyle = "black";
  overlay.lineWidth = 2;
  overlay.strokeText(`x scale: ${state.xscale.range()}`, 10, 30);
  overlay.fillText(`x scale: ${state.xscale.range()}`, 10, 30);
  overlay.strokeText(`y scale: ${state.yscale.range()}`, 10, 60);
  overlay.fillText(`y scale: ${state.yscale.range()}`, 10, 60);
};

const clearOverlay = () => {
  overlay.clearRect(0, 0, W, H);
};

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
    clearOverlay();
    overlay.strokeStyle = "white";
    overlay.strokeRect(coords[0], coords[1], mx - coords[0], my - coords[1]);
    console.log(state.infoEnabled);
    if (state.infoEnabled) drawDebug();
  }
});

document.querySelector("#overlay").addEventListener("mouseup", (e) => {
  if (!mousedown) {
    return;
  }
  mousedown = false;
  clearOverlay();
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  const minx = Math.min(coords[0], mx);
  const maxx = Math.max(coords[0], mx);
  const miny = Math.min(coords[1], my);
  const maxy = Math.max(coords[1], my);
  const maxDiff = Math.max(maxx - minx, maxy - miny);
  state.xscale = d3.scaleLinear(
    [0, W],
    [state.xscale(minx), state.xscale(minx + maxDiff)],
  );
  state.yscale = d3.scaleLinear(
    [0, H],
    [state.yscale(miny), state.yscale(miny + maxDiff)],
  );
  if (state.infoEnabled) drawDebug();
  requestAnimationFrame(() => drawRow(ctx, state.xscale, state.yscale));
});

document.addEventListener("keydown", (event) => {
  // Check if the "i" key was pressed
  if (event.key === "i") {
    if (!state.infoEnabled) {
      state.infoEnabled = true;
      drawDebug();
    } else {
      state.infoEnabled = false;
      clearOverlay();
    }
  }
});
```

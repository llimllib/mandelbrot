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

```js
// TODO:
// - input to select a color scheme
// - share a link to an area
// - implement panning
//   - for bonus points, don't redraw what's not invalidated
```

# Julia Set

```js
const mode = view(
  Inputs.radio(["zoom", "select"], { label: "mode", value: "select" }),
);
```

## Mandelbrot

<div class="canvases">
  <canvas id="mcanv" width=800 height=800></canvas>
  <canvas id="overlay" width=800 height=800></canvas>
</div>

## Julia set

<div class="canvases">
  <canvas id="jcanv" width=800 height=800></canvas>
  <canvas id="joverlay" width=800 height=800></canvas>
</div>

```js
const MAX_ITER = 512;
const W = 800;
const H = 800;
const state = {
  xscale: d3.scaleLinear([0, W], [-2, 0.6]),
  yscale: d3.scaleLinear([0, H], [1.25, -1.25]),
  jxscale: d3.scaleLinear([0, W], [-1.5, 1.5]),
  jyscale: d3.scaleLinear([0, H], [1.25, -1.25]),
  coords: [0, 0],
  mousedown: false,
};
```

```js echo
import { fmandelbrot, julia } from "./components/mandelbrot.js";

const colors = new Map();
const colorscale = d3
  .scaleSequentialLog(d3.interpolateInferno)
  .domain([1, MAX_ITER]);
for (let i = 1; i < MAX_ITER; i++) {
  colors.set(i, colorscale(i));
}
colors.set(MAX_ITER, `rgb(0, 0, 0)`);

const brotCtx = document.querySelector("canvas#mcanv").getContext("2d");
const drawRow = (ctx, xscale, yscale, y = 0, rows = 80) => {
  for (let i = 0; i < rows && y + i <= H; i++) {
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
requestAnimationFrame(() => drawRow(brotCtx, state.xscale, state.yscale));
```

```js
const juliaContext = document.querySelector("canvas#jcanv").getContext("2d");
const drawJuliaRow = (ctx, xscale, yscale, c, y = 0, rows = 80) => {
  for (let i = 0; i < rows; i++) {
    for (let x = 0; x <= W; x++) {
      const l = julia(c, [xscale(x), yscale(y + i)], MAX_ITER);
      ctx.fillStyle = colors.get(l);
      ctx.fillRect(x, y + i, 1, 1);
    }
  }
  if (y < H) {
    requestAnimationFrame(() =>
      drawJuliaRow(ctx, xscale, yscale, c, y + rows, rows),
    );
  }
};
requestAnimationFrame(() =>
  drawJuliaRow(juliaContext, state.jxscale, state.jyscale, [-0.74543, 0.11301]),
);
```

```js
const ocanvas = document.querySelector("canvas#overlay");
const overlay = ocanvas.getContext("2d");
const bbox = ocanvas.getBoundingClientRect();
const mcanvCtx = document.querySelector("canvas#mcanv").getContext("2d");
const jcanvCtx = document.querySelector("canvas#jcanv").getContext("2d");

const clearOverlay = () => {
  overlay.clearRect(0, 0, W, H);
};

const handleMouseDown = (e) => {
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  state.coords = [mx, my];
  console.log("click received. mode:", mode);
  // left button click
  if (mode == "zoom") {
    state.mousedown = true;
    // right or middle, draw the julia set at that point
  } else {
    requestAnimationFrame(() =>
      drawJuliaRow(jcanvCtx, state.jxscale, state.jyscale, [
        state.xscale(mx),
        state.yscale(my),
      ]),
    );
  }
};
ocanvas.addEventListener("mousedown", handleMouseDown);
invalidation.then(() =>
  ocanvas.removeEventListener("mousedown", handleMouseDown),
);

const handleMouseMove = (e) => {
  if (!state.mousedown) {
    return;
  }
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  clearOverlay();
  overlay.strokeStyle = "white";
  overlay.strokeRect(
    state.coords[0],
    state.coords[1],
    mx - state.coords[0],
    my - state.coords[1],
  );
};
ocanvas.addEventListener("mousemove", handleMouseMove);
invalidation.then(() =>
  ocanvas.removeEventListener("mousemove", handleMouseMove),
);

const handleMouseUp = (e) => {
  if (!state.mousedown) {
    return;
  }
  state.mousedown = false;
  clearOverlay();
  const mx = e.clientX - bbox.left;
  const my = e.clientY - bbox.top;
  const minx = Math.min(state.coords[0], mx);
  const maxx = Math.max(state.coords[0], mx);
  const miny = Math.min(state.coords[1], my);
  const maxy = Math.max(state.coords[1], my);
  const maxDiff = Math.max(maxx - minx, maxy - miny);
  state.xscale = d3.scaleLinear(
    [0, W],
    [state.xscale(minx), state.xscale(minx + maxDiff)],
  );
  state.yscale = d3.scaleLinear(
    [0, H],
    [state.yscale(miny), state.yscale(miny + maxDiff)],
  );
  console.log("drawing mouseup brot");
  requestAnimationFrame(() => drawRow(mcanvCtx, state.xscale, state.yscale));
};
ocanvas.addEventListener("mouseup", handleMouseUp);
invalidation.then(() => ocanvas.removeEventListener("mouseup", handleMouseUp));
```

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
  <canvas id="moverlay" width=800 height=800></canvas>
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
  mcoords: [0, 0],
  jcoords: [0, 0],
  mousedown: false,
  juliaC: [-0.74543, 0.11301],
};
```

```js
import { fmandelbrot, julia } from "./components/mandelbrot.js";

const colors = new Map();
// const colorscale = d3
//   .scaleSequentialLog(d3.interpolateInferno)
//   .domain([1, MAX_ITER]);
const colorscale = d3
  .scaleSequentialLog(d3.interpolateCividis)
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
const drawJuliaRow = (ctx, xscale, yscale, y = 0, rows = 80) => {
  for (let i = 0; i < rows; i++) {
    for (let x = 0; x <= W; x++) {
      const l = julia(state.juliaC, [xscale(x), yscale(y + i)], MAX_ITER);
      ctx.fillStyle = colors.get(l);
      ctx.fillRect(x, y + i, 1, 1);
    }
  }
  if (y < H) {
    requestAnimationFrame(() =>
      drawJuliaRow(ctx, xscale, yscale, y + rows, rows),
    );
  }
};
requestAnimationFrame(() =>
  drawJuliaRow(juliaContext, state.jxscale, state.jyscale),
);
```

```js
const mocanvas = document.querySelector("canvas#moverlay");
const mandelbrotCtx = document.querySelector("canvas#mcanv").getContext("2d");
const jocanvas = document.querySelector("canvas#joverlay");
const juliaCtx = document.querySelector("canvas#jcanv").getContext("2d");

const clearOverlay = (ctx) => {
  ctx.clearRect(0, 0, W, H);
};

const handleMouseDown = (cnvs, coords) => {
  const ctx = cnvs.getContext("2d");
  const bbox = cnvs.getBoundingClientRect();
  return (e) => {
    const mx = e.clientX - bbox.left;
    const my = e.clientY - bbox.top;
    coords[0] = mx;
    coords[1] = my;
    console.log(
      "click received. mode:",
      mode,
      state.mcoords,
      state.jcoords,
      mx,
      my,
    );
    if (mode == "zoom") {
      state.mousedown = true;
    } else {
      state.juliaC = [state.xscale(mx), state.yscale(my)];
      state.jxscale = d3.scaleLinear([0, W], [-1.5, 1.5]);
      state.jyscale = d3.scaleLinear([0, H], [1.25, -1.25]);
      requestAnimationFrame(() =>
        drawJuliaRow(juliaCtx, state.jxscale, state.jyscale),
      );
    }
  };
};
const moHandleDown = handleMouseDown(mocanvas, state.mcoords);
mocanvas.addEventListener("mousedown", moHandleDown);
invalidation.then(() =>
  mocanvas.removeEventListener("mousedown", moHandleDown),
);

const joHandleDown = handleMouseDown(jocanvas, state.jcoords);
jocanvas.addEventListener("mousedown", joHandleDown);
invalidation.then(() =>
  jocanvas.removeEventListener("mousedown", joHandleDown),
);

const handleMouseMove = (cnvs, coords) => {
  const ctx = cnvs.getContext("2d");
  const bbox = cnvs.getBoundingClientRect();
  return (e) => {
    if (!state.mousedown) {
      return;
    }
    const mx = e.clientX - bbox.left;
    const my = e.clientY - bbox.top;
    clearOverlay(ctx);
    ctx.strokeStyle = "white";
    ctx.strokeRect(coords[0], coords[1], mx - coords[0], my - coords[1]);
  };
};
const moHandleMove = handleMouseMove(mocanvas, state.mcoords);
mocanvas.addEventListener("mousemove", moHandleMove);
invalidation.then(() =>
  mocanvas.removeEventListener("mousemove", moHandleMove),
);

const joHandleMove = handleMouseMove(jocanvas, state.jcoords);
jocanvas.addEventListener("mousemove", joHandleMove);
invalidation.then(() =>
  jocanvas.removeEventListener("mousemove", joHandleMove),
);

const handleMouseUp = (cnvs, drawctx, coords, xscale, yscale, draw) => {
  const ctx = cnvs.getContext("2d");
  const bbox = cnvs.getBoundingClientRect();
  return (e) => {
    console.log("up");
    if (!state.mousedown) {
      return;
    }
    state.mousedown = false;
    clearOverlay(ctx);
    const mx = e.clientX - bbox.left;
    const my = e.clientY - bbox.top;
    const minx = Math.min(coords[0], mx);
    const maxx = Math.max(coords[0], mx);
    const miny = Math.min(coords[1], my);
    const maxy = Math.max(coords[1], my);
    console.log(e.clientX, bbox.left);
    console.log(e.clientY, bbox.top);
    console.log("zooming: ", minx, maxx, miny, maxy);
    console.log(
      "zooming: ",
      state[xscale](minx),
      state[xscale](maxx),
      state[yscale](miny),
      state[yscale](maxy),
    );
    const maxDiff = Math.max(maxx - minx, maxy - miny);
    state[xscale] = d3.scaleLinear(
      [0, W],
      [state[xscale](minx), state[xscale](minx + maxDiff)],
    );
    state[yscale] = d3.scaleLinear(
      [0, H],
      [state[yscale](miny), state[yscale](miny + maxDiff)],
    );
    requestAnimationFrame(() => draw(drawctx, state[xscale], state[yscale]));
  };
};

const moHandleUp = handleMouseUp(
  mocanvas,
  mandelbrotCtx,
  state.mcoords,
  "xscale",
  "yscale",
  drawRow,
);
mocanvas.addEventListener("mouseup", moHandleUp);
invalidation.then(() => mocanvas.removeEventListener("mouseup", moHandleUp));

const joHandleUp = handleMouseUp(
  jocanvas,
  juliaCtx,
  state.mcoords,
  "jxscale",
  "jyscale",
  drawJuliaRow,
);
jocanvas.addEventListener("mouseup", joHandleUp);
invalidation.then(() => jocanvas.removeEventListener("mouseup", joHandleUp));
```

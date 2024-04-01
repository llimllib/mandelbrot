---
toc: false
---

<style>
canvas {
  image-rendering: pixelated;
}
</style>

# Mandelbrot

https://miriam-english.org/files/Dewdney_Mandelbrot/Dewdney_Mandelbrot.html

<canvas id="mandelbrot" width=800 height=800></canvas>

```js echo
import { lim } from "./components/mandelbrot.js";

const MAX_ITER = 100;
const W = 800;
const H = 800;

const xscale = d3.scaleLinear([0, W], [-2, 0.6]);
const yscale = d3.scaleLinear([0, H], [1.25, -1.25]);

// const colorscale = d3.scaleSequentialLog(d3.interpolateTurbo).domain([1, MAX_ITER]);
// const colorscale = d3
//   .scaleSequentialLog(d3.interpolateCubehelixDefault)
//   .domain([1, MAX_ITER]);
const colorscale = d3
  .scaleSequentialLog(d3.interpolateInferno)
  .domain([1, MAX_ITER]);
const colors = new Map();
for (let i = 1; i < MAX_ITER; i++) {
  colors.set(i, colorscale(i));
}
colors.set(MAX_ITER, `rgb(0, 0, 0)`);

const ctx = document.querySelector("canvas#mandelbrot").getContext("2d");
const drawRow = (ctx, y = 0, rows = 20) => {
  for (let i = 0; i < rows; i++) {
    for (let x = 0; x <= W; x++) {
      const l = lim([xscale(x), yscale(y + i)], MAX_ITER);
      ctx.fillStyle = colors.get(l);
      ctx.fillRect(x, y + i, 1, 1);
    }
  }
  if (y < H) {
    requestAnimationFrame(() => drawRow(ctx, y + rows));
  }
};
requestAnimationFrame(() => drawRow(ctx));
```

```js
// to inspect values with the mouse, uncomment:
// const bbox = document.querySelector("canvas").getBoundingClientRect();
// document
//   .querySelector("canvas#mandelbrot")
//   .addEventListener("mousemove", (e) => {
//     const mx = e.clientX - bbox.left;
//     const my = e.clientY - bbox.top;
//     console.log(
//       mx,
//       my,
//       [xscale(mx), yscale(my)],
//       lim([xscale(mx), yscale(my)]),
//     );
//   });
```

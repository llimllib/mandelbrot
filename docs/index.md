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
const MAX_ITER = 100;
const cmul = (c1, c2) => {
  let [a, b] = c1;
  let [c, d] = c2;
  return [a * c - b * d, a * d + b * c];
};
const cadd = (c1, c2) => {
  return [c1[0] + c2[0], c1[1] + c2[1]];
};
const dist = (c) => Math.sqrt(c[0] * c[0] + c[1] * c[1]);
const lim = (c) => {
  let z = c;
  let count = 1;
  while (dist(z) < 2 && count < MAX_ITER) {
    z = cadd(cmul(z, z), c);
    count += 1;
  }
  return count;
};

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
console.log(colors[80]);

const ctx = document.querySelector("canvas#mandelbrot").getContext("2d");
for (let y = 0; y <= H; y++) {
  for (let x = 0; x <= W; x++) {
    const l = lim([xscale(x), yscale(y)]);
    ctx.fillStyle = colors.get(l);
    ctx.fillRect(x, y, 1, 1);
  }
}
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

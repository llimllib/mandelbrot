# color test

```js echo
const colorscale = d3.scaleSequentialLog(d3.interpolateTurbo).domain([1, 1000]);
display(colorscale(4));
display(colorscale(100));
display(colorscale(500));
display(colorscale(1000));
```

```js echo
const magnitude = d3
  .scaleSequentialLog(d3.interpolatePuBuGn)
  .domain([1e-8, 1e8]);
display(magnitude(4));
display(magnitude(100));
display(magnitude(500));
display(magnitude(1000));
```

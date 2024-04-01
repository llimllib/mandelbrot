const cmul = (c1, c2) => {
  let [a, b] = c1;
  let [c, d] = c2;
  return [a * c - b * d, a * d + b * c];
};

const cadd = (c1, c2) => {
  return [c1[0] + c2[0], c1[1] + c2[1]];
};

const dist = (c) => Math.sqrt(c[0] * c[0] + c[1] * c[1]);

export const mandelbrot = (c, max_iter) => {
  let z = c;
  let count = 1;
  while (dist(z) < 2 && count < max_iter) {
    z = cadd(cmul(z, z), c);
    count += 1;
  }
  return count;
};

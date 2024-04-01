const cmul = (c1, c2) => {
  let [a, b] = c1;
  let [c, d] = c2;
  return [a * c - b * d, a * d + b * c];
};

const cadd = (c1, c2) => {
  return [c1[0] + c2[0], c1[1] + c2[1]];
};

export const mandelbrot = (c, max_iter) => {
  let z = c;
  let count = 1;
  // - we don't need to take the square root if we square both sides, changing
  //   2 -> 4
  while (z[0] * z[0] + z[1] * z[1] < 4 && count < max_iter) {
    z = cadd(cmul(z, z), c);
    count += 1;
  }
  return count;
};

// attempting to optimize
// https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/
export const fmandelbrot = (c, max_iter) => {
  let [cr, ci] = c;
  let [zr, zi] = [0, 0];
  let [zrsqr, zisqr] = [0, 0];
  let count = 1;
  while (zrsqr + zisqr <= 4 && count < max_iter) {
    zi = zr * zi;
    zi += zi;
    zi += ci;
    zr = zrsqr - zisqr + cr;
    zrsqr = Math.pow(zr, 2);
    zisqr = Math.pow(zi, 2);
    count += 1;
  }
  return count;
};

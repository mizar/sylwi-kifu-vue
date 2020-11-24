import mtrand from "mtrand";

/**
 * Perlin noise generator
 *
 * original:
 * https://mrl.nyu.edu/~perlin/noise/
 * https://mrl.nyu.edu/~perlin/paper445.pdf
 */
export class PerlinNoise {
  private permutation: number[];
  public constructor(seed = 0) {
    const mtRand = mtrand(seed);
    const p: number[] = [];
    const numRest = Array.from({ length: 256 }, (v, k) => k);
    while (numRest.length > 0) {
      const i = mtRand.next().value % numRest.length;
      p.push(numRest[i]);
      numRest.splice(i, 1);
    }
    this.permutation = Array.from({ length: 512 }, (v, k) => p[k & 255]);
  }
  public noise(x = 0, y = 0, z = 0): number {
    const fade = PerlinNoise.fade;
    const lerp = PerlinNoise.lerp;
    const grad = PerlinNoise.grad;
    const p = this.permutation;
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const xil = xi & 255;
    const yil = yi & 255;
    const zil = zi & 255;
    const xf0 = x - xi;
    const yf0 = y - yi;
    const zf0 = z - zi;
    const xf1 = xf0 - 1;
    const yf1 = yf0 - 1;
    const zf1 = zf0 - 1;
    const u = fade(xf0);
    const v = fade(yf0);
    const w = fade(zf0);
    const a = p[xil] + yil;
    const aa0 = p[a] + zil;
    const ab0 = p[a + 1] + zil;
    const b = p[xil + 1] + yil;
    const ba0 = p[b] + zil;
    const bb0 = p[b + 1] + zil;
    const aa1 = aa0 + 1;
    const ab1 = ab0 + 1;
    const ba1 = ba0 + 1;
    const bb1 = bb0 + 1;
    return lerp(
      w,
      lerp(
        v,
        lerp(u, grad(p[aa0], xf0, yf0, zf0), grad(p[ba0], xf1, yf1, zf0)),
        lerp(u, grad(p[ab0], xf0, yf0, zf0), grad(p[bb0], xf1, yf1, zf0))
      ),
      lerp(
        v,
        lerp(u, grad(p[aa1], xf0, yf0, zf1), grad(p[ba1], xf1, yf1, zf1)),
        lerp(u, grad(p[ab1], xf0, yf0, zf1), grad(p[bb1], xf1, yf1, zf1))
      )
    );
  }
  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  private static lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }
  private static grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}

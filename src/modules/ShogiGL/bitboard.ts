// countingZeros 参照用表
const bitMod37Table = [
  32,
  0,
  1,
  26,
  2,
  23,
  27,
  0,
  3,
  16,
  24,
  30,
  28,
  11,
  0,
  13,
  4,
  7,
  17,
  0,
  25,
  22,
  31,
  15,
  29,
  10,
  12,
  6,
  0,
  21,
  14,
  9,
  5,
  20,
  8,
  19,
  18,
];
export default class BitBoard {
  constructor(public b0: number, public b1: number, public b2: number) {}
  set(b0: number, b1: number, b2: number): void {
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
  }
  clone(): BitBoard {
    return new BitBoard(this.b0, this.b1, this.b2);
  }
  bitSet(i: number): void {
    // 指定位置のbitを1に
    const b = 1 << (i & 31);
    if (i < 0) {
      //
    } else if (i < 32) {
      this.b0 = this.b0 | b;
    } else if (i < 64) {
      this.b1 = this.b1 | b;
    } else if (i < 96) {
      this.b2 = this.b2 | b;
    }
  }
  bitClear(i: number): void {
    // 指定位置のbitを0に
    const b = 0xffffffff ^ (1 << (i & 31));
    if (i < 0) {
      //
    } else if (i < 32) {
      this.b0 = this.b0 & b;
    } else if (i < 64) {
      this.b1 = this.b1 & b;
    } else if (i < 96) {
      this.b2 = this.b2 & b;
    }
  }
  // 指定位置のbitを反転
  bitFlip(i: number): void {
    const b = 1 << (i & 31);
    if (i < 0) {
      //
    } else if (i < 32) {
      this.b0 = this.b0 ^ b;
    } else if (i < 64) {
      this.b1 = this.b1 ^ b;
    } else if (i < 96) {
      this.b2 = this.b2 ^ b;
    }
  }
  // 全てのbitがゼロか
  isZero(): boolean {
    return (this.b2 | this.b1 | this.b0) === 0;
  }
  // bitが1つだけ立っているか
  isOne(): boolean {
    if (this.b0 !== 0)
      return this.b1 === 0 && this.b2 === 0 && this.b0 === (this.b0 & -this.b0);
    if (this.b1 !== 0) return this.b2 === 0 && this.b1 === (this.b1 & -this.b1);
    if (this.b2 !== 0) return this.b2 === (this.b2 & -this.b2);
    return false;
  }
  // indexのbitが立っているかどうか
  bitCheck(i: number): boolean {
    const b = 1 << (i & 31);
    if (i < 0) return false;
    if (i < 32) return (this.b0 & b) !== 0;
    if (i < 64) return (this.b1 & b) !== 0;
    if (i < 96) return (this.b2 & b) !== 0;
    return false;
  }
  // 1が立っているbitの数
  bitCount(): number {
    // 分割統治法によるbitcount
    const a1 = this.b0 - ((this.b0 >>> 1) & 0x55555555);
    const b1 = this.b1 - ((this.b1 >>> 1) & 0x55555555);
    const c1 = this.b2 - ((this.b2 >>> 1) & 0x55555555);
    const a2 =
      ((a1 >>> 2) & 0x33333333) +
      (a1 & 0x33333333) +
      ((b1 >>> 2) & 0x33333333) +
      (b1 & 0x33333333) +
      ((c1 >>> 2) & 0x33333333) +
      (c1 & 0x33333333);
    const a3 = ((a2 >>> 4) & 0x0f0f0f0f) + (a2 & 0x0f0f0f0f);
    const a4 = (a3 >>> 8) + a3;
    return ((a4 >>> 16) + a4) & 0x000000ff;
  }
  // and
  and(b: BitBoard): BitBoard {
    return new BitBoard(this.b0 & b.b0, this.b1 & b.b1, this.b2 & b.b2);
  }
  // not implication
  nimp(b: BitBoard): BitBoard {
    return new BitBoard(this.b0 & ~b.b0, this.b1 & ~b.b1, this.b2 & ~b.b2);
  }
  // or
  or(b: BitBoard): BitBoard {
    return new BitBoard(this.b0 | b.b0, this.b1 | b.b1, this.b2 | b.b2);
  }
  // xor
  xor(b: BitBoard): BitBoard {
    return new BitBoard(this.b0 ^ b.b0, this.b1 ^ b.b1, this.b2 ^ b.b2);
  }
  // 反転
  not(): BitBoard {
    return new BitBoard(~this.b0, ~this.b1, ~this.b2);
  }
  // and代入
  andDest(b: BitBoard): void {
    this.b0 = this.b0 & b.b0;
    this.b1 = this.b1 & b.b1;
    this.b2 = this.b2 & b.b2;
  }
  // nimp代入
  nimpDest(b: BitBoard): void {
    this.b0 = this.b0 & ~b.b0;
    this.b1 = this.b1 & ~b.b1;
    this.b2 = this.b2 & ~b.b2;
  }
  // or代入
  orDest(b: BitBoard): void {
    this.b0 = this.b0 | b.b0;
    this.b1 = this.b1 | b.b1;
    this.b2 = this.b2 | b.b2;
  }
  // xor代入
  xorDest(b: BitBoard): void {
    this.b0 = this.b0 ^ b.b0;
    this.b1 = this.b1 ^ b.b1;
    this.b2 = this.b2 ^ b.b2;
  }
  // 自己bit反転
  notDest(): void {
    this.b0 = ~this.b0;
    this.b1 = ~this.b1;
    this.b2 = ~this.b2;
  }
  // 右シフト&マスク
  rShift(i: number, mask: BitBoard): BitBoard {
    if (i < 0) {
      return this.lShift(-i, mask);
    }
    if (i < 32) {
      const xi0 = 32 - i;
      const xi1 = i;
      return new BitBoard(
        ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b0,
        ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b1,
        (this.b2 >>> xi1) & mask.b2
      );
    }
    if (i < 64) {
      const xi0 = 64 - i;
      const xi1 = i - 32;
      return new BitBoard(
        ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b0,
        (this.b2 >>> xi1) & mask.b1,
        0
      );
    }
    if (i < 96) {
      const xi1 = i - 64;
      return new BitBoard((this.b2 >>> xi1) & mask.b0, 0, 0);
    }
    return new BitBoard(0, 0, 0);
  }
  // 左シフト&マスク
  lShift(i: number, mask: BitBoard): BitBoard {
    if (i < 0) {
      return this.rShift(-i, mask);
    }
    if (i < 32) {
      const xi0 = i;
      const xi1 = 32 - i;
      return new BitBoard(
        (this.b0 << xi0) & mask.b0,
        ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b1,
        ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b2
      );
    }
    if (i < 64) {
      const xi0 = i - 32;
      const xi1 = 64 - i;
      return new BitBoard(
        0,
        (this.b0 << xi0) & mask.b1,
        ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b2
      );
    }
    if (i < 96) {
      const xi0 = i - 64;
      return new BitBoard(0, 0, (this.b0 << xi0) & mask.b2);
    }
    return new BitBoard(0, 0, 0);
  }
  // 右シフト&マスク代入
  rShiftDest(i: number, mask: BitBoard): void {
    if (i < 0) {
      this.lShiftDest(-i, mask);
    } else if (i < 32) {
      const xi0 = 32 - i;
      const xi1 = i;
      this.b0 = ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b0;
      this.b1 = ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b1;
      this.b2 = (this.b2 >>> xi1) & mask.b2;
    } else if (i < 64) {
      const xi0 = 64 - i;
      const xi1 = i - 32;
      this.b0 = ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b0;
      this.b1 = (this.b2 >>> xi1) & mask.b1;
      this.b2 = 0;
    } else if (i < 96) {
      const xi1 = i - 64;
      this.b0 = (this.b2 >>> xi1) & mask.b0;
      this.b1 = 0;
      this.b2 = 0;
    } else {
      this.b0 = 0;
      this.b1 = 0;
      this.b2 = 0;
    }
  }
  // 左シフト&マスク代入
  lShiftDest(i: number, mask: BitBoard): void {
    if (i < 0) {
      this.rShiftDest(-i, mask);
    } else if (i < 32) {
      const xi0 = i;
      const xi1 = 32 - i;
      this.b0 = (this.b0 << xi0) & mask.b0;
      this.b1 = ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b1;
      this.b2 = ((this.b2 << xi0) | (this.b1 >>> xi1)) & mask.b2;
    } else if (i < 64) {
      const xi0 = i - 32;
      const xi1 = 64 - i;
      this.b0 = 0;
      this.b1 = (this.b0 << xi0) & mask.b1;
      this.b2 = ((this.b1 << xi0) | (this.b0 >>> xi1)) & mask.b2;
    } else if (i < 96) {
      const xi0 = i - 64;
      this.b0 = 0;
      this.b1 = 0;
      this.b2 = (this.b0 << xi0) & mask.b2;
    } else {
      this.b0 = 0;
      this.b1 = 0;
      this.b2 = 0;
    }
  }
  // 最初から0が続く長さ
  countingZeros(): number {
    return this.b0 !== 0
      ? bitMod37Table[((-this.b0 & this.b0) >>> 0) % 37]
      : this.b1 !== 0
      ? bitMod37Table[((-this.b1 & this.b1) >>> 0) % 37] + 32
      : bitMod37Table[((-this.b2 & this.b2) >>> 0) % 37] + 64;
  }
  // 1が立っているindexの羅列
  indexArray(): number[] {
    const res: number[] = [];
    let b0 = this.b0;
    while (b0 !== 0) {
      const b = (-b0 & b0) >>> 0;
      res.push(bitMod37Table[b % 37]);
      b0 = b0 ^ b;
    }
    let b1 = this.b1;
    while (b1 !== 0) {
      const b = (-b1 & b1) >>> 0;
      res.push(bitMod37Table[b % 37] + 32);
      b1 = b1 ^ b;
    }
    let b2 = this.b2;
    while (b2 !== 0) {
      const b = (-b2 & b2) >>> 0;
      res.push(bitMod37Table[b % 37] + 64);
      b2 = b2 ^ b;
    }
    return res;
  }
}

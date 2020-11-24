import bitboard from "./bitboard";
import mtrand from "mtrand";

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export type Nullable<T> = T | null;

const mtRand = mtrand(20190101);

export enum Color {
  GRAY,
  BLACK,
  WHITE,
  ERROR,
  NB,
}

export type unpromotedWhitePiece =
  | "p"
  | "l"
  | "n"
  | "s"
  | "g"
  | "b"
  | "r"
  | "k";
export type promotedWhitePiece =
  | "+p"
  | "+l"
  | "+n"
  | "+s"
  | "+g"
  | "+b"
  | "+r"
  | "+k";
export type unpromotedBlackPiece =
  | "P"
  | "L"
  | "N"
  | "S"
  | "G"
  | "B"
  | "R"
  | "K";
export type promotedBlackPiece =
  | "+P"
  | "+L"
  | "+N"
  | "+S"
  | "+G"
  | "+B"
  | "+R"
  | "+K";

export enum PieceType0 {
  P = 0,
  L,
  N,
  S,
  G,
  B,
  R,
  K,
  "+P" = 0,
  "+L",
  "+N",
  "+S",
  "+G",
  "+B",
  "+R",
  "+K",
  p = 0,
  l,
  n,
  s,
  g,
  b,
  r,
  k,
  "+p" = 0,
  "+l",
  "+n",
  "+s",
  "+g",
  "+b",
  "+r",
  "+k",
  NB,
}
export enum PieceType1 {
  P = 0,
  L,
  N,
  S,
  G,
  B,
  R,
  K,
  "+P",
  "+L",
  "+N",
  "+S",
  "+G",
  "+B",
  "+R",
  "+K",
  p = 0,
  l,
  n,
  s,
  g,
  b,
  r,
  k,
  "+p",
  "+l",
  "+n",
  "+s",
  "+g",
  "+b",
  "+r",
  "+k",
  NB,
}
export enum PieceType2 {
  // Color.GRAY
  XP,
  XL,
  XN,
  XS,
  XG,
  XB,
  XR,
  XK,
  "+XP",
  "+XL",
  "+XN",
  "+XS",
  "+XG",
  "+XB",
  "+XR",
  "+XK",
  // Color.BLACK
  P,
  L,
  N,
  S,
  G,
  B,
  R,
  K,
  "+P",
  "+L",
  "+N",
  "+S",
  "+G",
  "+B",
  "+R",
  "+K",
  // Color.WHITE
  p,
  l,
  n,
  s,
  g,
  b,
  r,
  k,
  "+p",
  "+l",
  "+n",
  "+s",
  "+g",
  "+b",
  "+r",
  "+k",
  // Color.ERROR
  xp,
  xl,
  xn,
  xs,
  xg,
  xb,
  xr,
  xk,
  "+xp",
  "+xl",
  "+xn",
  "+xs",
  "+xg",
  "+xb",
  "+xr",
  "+xk",
  // Color.NB (Sentinel)
  NB,
}

export enum Square {
  SQ91,
  SQ81,
  SQ71,
  SQ61,
  SQ51,
  SQ41,
  SQ31,
  SQ21,
  SQ11,
  SQ92,
  SQ82,
  SQ72,
  SQ62,
  SQ52,
  SQ42,
  SQ32,
  SQ22,
  SQ12,
  SQ93,
  SQ83,
  SQ73,
  SQ63,
  SQ53,
  SQ43,
  SQ33,
  SQ23,
  SQ13,
  SQ94,
  SQ84,
  SQ74,
  SQ64,
  SQ54,
  SQ44,
  SQ34,
  SQ24,
  SQ14,
  SQ95,
  SQ85,
  SQ75,
  SQ65,
  SQ55,
  SQ45,
  SQ35,
  SQ25,
  SQ15,
  SQ96,
  SQ86,
  SQ76,
  SQ66,
  SQ56,
  SQ46,
  SQ36,
  SQ26,
  SQ16,
  SQ97,
  SQ87,
  SQ77,
  SQ67,
  SQ57,
  SQ47,
  SQ37,
  SQ27,
  SQ17,
  SQ98,
  SQ88,
  SQ78,
  SQ68,
  SQ58,
  SQ48,
  SQ38,
  SQ28,
  SQ18,
  SQ99,
  SQ89,
  SQ79,
  SQ69,
  SQ59,
  SQ49,
  SQ39,
  SQ29,
  SQ19,
  GRAY_HAND,
  BLACK_HAND,
  WHITE_HAND,
  ERROR_HAND,
  NB,
  NONE = -1,
  NULL = -2,
  WIN = -3,
  RESIGN = -4,
  BREAK = -5,
  SEAL = -6,
}

export enum File {
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  NB,
}

export enum Rank {
  R1,
  R2,
  R3,
  R4,
  R5,
  R6,
  R7,
  R8,
  R9,
  NB,
}

export const fr2sq = (f: File, r: Rank): Square => File.F9 - f + 9 * r;

const sq2frTable = Array.from({ length: Square.NB }, (v, sq) =>
  sq < 81
    ? { f: ((File.F9 - (sq % 9)) | 0) as File, r: ((sq / 9) | 0) as Rank }
    : null
);

export const sq2fr = (sq: Square) => sq2frTable[sq];

export const handSq2Color = (sq: Square): Color =>
  sq < 81 ? Color.ERROR : Math.min(sq - 81, Color.ERROR);

export const handColor2Sq = (c: Color): Square => c + 81;

/**
 * 駒クラス
 */
export class Piece {
  constructor(public readonly v: number) {}
  static gen(
    pt0: PieceType0,
    pro: boolean,
    c: Color,
    cIni: Color,
    sq: Square,
    seq: number
  ): Piece {
    return new Piece(
      (pt0 & 7) |
        (pro ? 8 : 0) |
        ((c & 3) << 4) |
        ((cIni & 3) << 6) |
        ((sq & 255) << 8) |
        (seq << 16)
    );
  }
  static except(sq: Square): Piece {
    return Piece.gen(
      0,
      false,
      Color.ERROR,
      Color.ERROR,
      sq < 0 ? sq : Square.NONE,
      -1
    );
  }
  static none(): Piece {
    return Piece.except(Square.NONE);
  }
  static null(): Piece {
    return Piece.except(Square.NULL);
  }
  static win(): Piece {
    return Piece.except(Square.WIN);
  }
  static resign(): Piece {
    return Piece.except(Square.RESIGN);
  }
  static break(): Piece {
    return Piece.except(Square.BREAK);
  }
  static seal(): Piece {
    return Piece.except(Square.SEAL);
  }
  // .pt0: 0 ~ 7
  pt0(): PieceType0 {
    return this.v & 7;
  }
  genPt0(pt: PieceType0) {
    return new Piece((this.v & -8) | (pt & 7));
  }
  // .pt1: 0 ~ 15
  pt1(): PieceType1 {
    return this.v & 15;
  }
  genPt1(pt: PieceType1) {
    return new Piece((this.v & -16) | (pt & 15));
  }
  // .pt2: 0 ~ 63
  pt2(): PieceType2 {
    return this.v & 63;
  }
  genPt2(pt: PieceType2) {
    return new Piece((this.v & -64) | (pt & 63));
  }
  // .promote: false or true
  promote(): boolean {
    return (this.v & 8) === 8;
  }
  genPromote(pro: boolean) {
    return new Piece(pro ? this.v | 8 : this.v & -9);
  }
  genOrPromote(pro: boolean) {
    return new Piece(this.v | (pro ? 8 : 0));
  }
  // .color: 0 ~ 3
  color(): Color {
    return (this.v >> 4) & 3;
  }
  genColor(c: Color) {
    return new Piece((this.v & -49) | ((c & 3) << 4));
  }
  // .initcolor: 0 ~ 3
  initcolor(): Color {
    return (this.v >> 6) & 3;
  }
  genInitcolor(c: Color) {
    return new Piece((this.v & -193) | ((c & 3) << 6));
  }
  // .square: -128 ~ +127
  square(): Square {
    return -((this.v >> 8) & 128) | ((this.v >> 8) & 127);
  }
  genSquare(sq: Square) {
    return new Piece((this.v & -65281) | ((sq & 255) << 8));
  }
  isSpecial(): boolean {
    return this.color() === Color.ERROR || this.square() < 0;
  }
  // .seq: -32768 ~ +32767
  seq(): number {
    return this.v >> 16;
  }
  genSeq(seq: number) {
    return new Piece((this.v & -65536) | ((seq & 65535) << 16));
  }
  //
  pt0BlackSfen() {
    return pt0BlackSfenTable[this.pt0()];
  }
  pt0WhiteSfen() {
    return pt0WhiteSfenTable[this.pt0()];
  }
  pt1BlackSfen() {
    return pt1BlackSfenTable[this.pt1()];
  }
  pt1WhiteSfen() {
    return pt1WhiteSfenTable[this.pt1()];
  }
  pt2Sfen() {
    return pt2SfenTable[this.pt2()];
  }
  pt1Csa() {
    return pt1CsaTable[this.pt1()];
  }
  isEnemyZone() {
    const c = this.color();
    const fr = sq2fr(this.square());
    return (
      (fr &&
        ((c === Color.BLACK && fr.r <= Rank.R3) ||
          (c === Color.WHITE && fr.r >= Rank.R7))) ||
      false
    );
  }
  canPromote() {
    const pt0 = this.v & 7;
    return pt0 === 4 || pt0 === 7;
  }
}

// 各種変換器
export const convColor2Sfen = (c: Color): string => {
  if (c === Color.BLACK) return "b";
  if (c === Color.WHITE) return "w";
  return "";
};
export const pt2Promoted = (pt2: PieceType2): PieceType2 => pt2 | 8;
export const pt2Unpromoted = (pt2: PieceType2): PieceType2 => pt2 & -9;
export const convPt2Color = (pt2: PieceType2): Color => pt2 >> 4;
export const convPt2Promote = (pt2: PieceType2): boolean => (pt2 & 8) === 8;
export const convPt2Pt0Type = (pt2: PieceType2): PieceType0 => pt2 & 7;
export const convPt2Pt0TypeEq = (pt2a: PieceType2, pt2b: PieceType2): boolean =>
  (pt2a & 7) === (pt2b & 7);
export const convPt0Pt1 = (pt0: PieceType0, prm: boolean): PieceType1 =>
  (pt0 & 7) | (prm ? 8 : 0);
export const convPt0Pt2 = (
  pt0: PieceType0,
  prm: boolean,
  c: Color
): PieceType2 => (pt0 & 7) | (prm ? 8 : 0) | (c << 4);
export const convPt1Pt2 = (pt1: PieceType1, c: Color): PieceType2 =>
  pt1 | (c << 4);
export const convPt1Pt0Obj = (
  pt1: PieceType1
): { pt0: PieceType0; prm: boolean } => ({
  pt0: pt1 & 7,
  prm: (pt1 & 8) === 8,
});
export const convPt2Pt1Obj = (
  pt2: PieceType2
): { pt1: PieceType1; c: Color } => ({ pt1: pt2 & 15, c: pt2 >> 4 });
export const convPt2Pt0Obj = (
  pt2: PieceType2
): { pt0: PieceType0; prm: boolean; c: Color } => ({
  pt0: pt2 & 7,
  prm: (pt2 & 8) === 8,
  c: pt2 >> 4,
});
export const pt0BlackSfenTable: ReadonlyArray<string> = [
  "P",
  "L",
  "N",
  "S",
  "G",
  "B",
  "R",
  "K",
];
export const pt0WhiteSfenTable: ReadonlyArray<string> = [
  "p",
  "l",
  "n",
  "s",
  "g",
  "b",
  "r",
  "k",
];
export const pt1BlackSfenTable: ReadonlyArray<string> = [
  "P",
  "L",
  "N",
  "S",
  "G",
  "B",
  "R",
  "K",
  "+P",
  "+L",
  "+N",
  "+S",
  "+G",
  "+B",
  "+R",
  "+K",
];
export const pt1WhiteSfenTable: ReadonlyArray<string> = [
  "p",
  "l",
  "n",
  "s",
  "g",
  "b",
  "r",
  "k",
  "+p",
  "+l",
  "+n",
  "+s",
  "+g",
  "+b",
  "+r",
  "+k",
];
export const pt2SfenTable: ReadonlyArray<string> = [
  "(P)",
  "(L)",
  "(N)",
  "(S)",
  "(G)",
  "(B)",
  "(R)",
  "(K)",
  "(+P)",
  "(+L)",
  "(+N)",
  "(+S)",
  "(+G)",
  "(+B)",
  "(+R)",
  "(+K)",
  "P",
  "L",
  "N",
  "S",
  "G",
  "B",
  "R",
  "K",
  "+P",
  "+L",
  "+N",
  "+S",
  "+G",
  "+B",
  "+R",
  "+K",
  "p",
  "l",
  "n",
  "s",
  "g",
  "b",
  "r",
  "k",
  "+p",
  "+l",
  "+n",
  "+s",
  "+g",
  "+b",
  "+r",
  "+k",
  "(p)",
  "(l)",
  "(n)",
  "(s)",
  "(g)",
  "(b)",
  "(r)",
  "(k)",
  "(+p)",
  "(+l)",
  "(+n)",
  "(+s)",
  "(+g)",
  "(+b)",
  "(+r)",
  "(+k)",
];
export const pt0CsaTable: ReadonlyArray<string> = [
  "FU",
  "KY",
  "KE",
  "GI",
  "KI",
  "KA",
  "HI",
  "OU",
];
export const pt0BlackCsaTable: ReadonlyArray<string> = [
  "+FU",
  "+KY",
  "+KE",
  "+GI",
  "+KI",
  "+KA",
  "+HI",
  "+OU",
];
export const pt0WhiteCsaTable: ReadonlyArray<string> = [
  "-FU",
  "-KY",
  "-KE",
  "-GI",
  "-KI",
  "-KA",
  "-HI",
  "-OU",
];
export const pt1CsaTable: ReadonlyArray<string> = [
  "FU",
  "KY",
  "KE",
  "GI",
  "KI",
  "KA",
  "HI",
  "OU",
  "TO",
  "NY",
  "NK",
  "NG",
  "KI",
  "UM",
  "RY",
  "OU",
];
export const pt1BlackCsaTable: ReadonlyArray<string> = [
  "+FU",
  "+KY",
  "+KE",
  "+GI",
  "+KI",
  "+KA",
  "+HI",
  "+OU",
  "+TO",
  "+NY",
  "+NK",
  "+NG",
  "+KI",
  "+UM",
  "+RY",
  "+OU",
];
export const pt1WhiteCsaTable: ReadonlyArray<string> = [
  "-FU",
  "-KY",
  "-KE",
  "-GI",
  "-KI",
  "-KA",
  "-HI",
  "-OU",
  "-TO",
  "-NY",
  "-NK",
  "-NG",
  "-KI",
  "-UM",
  "-RY",
  "-OU",
];
export const pt2CsaTable: ReadonlyArray<string> = [
  "*FU",
  "*KY",
  "*KE",
  "*GI",
  "*KI",
  "*KA",
  "*HI",
  "*OU",
  "*TO",
  "*NY",
  "*NK",
  "*NG",
  "*KI",
  "*UM",
  "*RY",
  "*OU",
  "+FU",
  "+KY",
  "+KE",
  "+GI",
  "+KI",
  "+KA",
  "+HI",
  "+OU",
  "+TO",
  "+NY",
  "+NK",
  "+NG",
  "+KI",
  "+UM",
  "+RY",
  "+OU",
  "-FU",
  "-KY",
  "-KE",
  "-GI",
  "-KI",
  "-KA",
  "-HI",
  "-OU",
  "-TO",
  "-NY",
  "-NK",
  "-NG",
  "-KI",
  "-UM",
  "-RY",
  "-OU",
  "#FU",
  "#KY",
  "#KE",
  "#GI",
  "#KI",
  "#KA",
  "#HI",
  "#OU",
  "#TO",
  "#NY",
  "#NK",
  "#NG",
  "#KI",
  "#UM",
  "#RY",
  "#OU",
];
export const pt1Kan1Table: ReadonlyArray<string> = [
  "歩",
  "香",
  "桂",
  "銀",
  "角",
  "飛",
  "金",
  "玉",
  "と",
  "杏",
  "圭",
  "全",
  "　",
  "馬",
  "龍",
  "　",
];
export const pt1Kan2Table: ReadonlyArray<string> = [
  "歩",
  "香",
  "桂",
  "銀",
  "角",
  "飛",
  "金",
  "玉",
  "と",
  "成香",
  "成桂",
  "成銀",
  "成金",
  "馬",
  "龍",
  "成玉",
];

/**
 * 駒移動定義要素（元定義）
 */
interface MoveDefPlainEntry {
  readonly f: number;
  readonly r: number;
}

/**
 * 駒移動定義（元定義）
 */
interface MoveDefPlain {
  readonly name: string;
  readonly fly?: ReadonlyArray<MoveDefPlainEntry>;
  readonly just?: ReadonlyArray<MoveDefPlainEntry>;
}

/**
 * 駒移動定義要素(+bitboard)
 */
export interface MoveDefEntry {
  readonly f: number;
  readonly r: number;
  readonly lShift: number;
  readonly mask: bitboard;
}

/**
 * 駒移動定義(+bitboard)
 */
export interface MoveDefinition {
  readonly name: string;
  readonly fly?: ReadonlyArray<MoveDefEntry>;
  readonly just?: ReadonlyArray<MoveDefEntry>;
}

/**
 * 駒移動定義データ
 */
export const moveDefPlainTable: ReadonlyArray<MoveDefPlain> = [
  // Color.GRAY
  { name: "(P)" },
  { name: "(L)" },
  { name: "(N)" },
  { name: "(S)" },
  { name: "(G)" },
  { name: "(B)" },
  { name: "(R)" },
  { name: "(K)" },
  { name: "(+P)" },
  { name: "(+L)" },
  { name: "(+N)" },
  { name: "(+S)" },
  { name: "(+G)" },
  { name: "(+B)" },
  { name: "(+R)" },
  { name: "(+K)" },
  // Color.BLACK
  { name: "P", just: [{ f: 0, r: -1 }] },
  { name: "L", fly: [{ f: 0, r: -1 }] },
  {
    name: "N",
    just: [
      { f: -1, r: -2 },
      { f: +1, r: -2 },
    ],
  },
  {
    name: "S",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: +1 },
      { f: +1, r: +1 },
    ],
  },
  {
    name: "G",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "B",
    fly: [
      { f: -1, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: +1 },
      { f: +1, r: +1 },
    ],
  },
  {
    name: "R",
    fly: [
      { f: 0, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "K",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: -1, r: +1 },
      { f: 0, r: +1 },
      { f: +1, r: +1 },
    ],
  },
  {
    name: "+P",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+L",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+N",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+S",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+G",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+B",
    fly: [
      { f: -1, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: +1 },
      { f: +1, r: +1 },
    ],
    just: [
      { f: 0, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
  },
  {
    name: "+R",
    fly: [
      { f: 0, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: 0, r: +1 },
    ],
    just: [
      { f: -1, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: +1 },
      { f: +1, r: +1 },
    ],
  },
  {
    name: "+K",
    just: [
      { f: -1, r: -1 },
      { f: 0, r: -1 },
      { f: +1, r: -1 },
      { f: -1, r: 0 },
      { f: +1, r: 0 },
      { f: -1, r: +1 },
      { f: 0, r: +1 },
      { f: +1, r: +1 },
    ],
  },
  // Color.WHITE
  { name: "p", just: [{ f: 0, r: +1 }] },
  { name: "l", fly: [{ f: 0, r: +1 }] },
  {
    name: "n",
    just: [
      { f: +1, r: +2 },
      { f: -1, r: 2 },
    ],
  },
  {
    name: "s",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: -1 },
      { f: -1, r: -1 },
    ],
  },
  {
    name: "g",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "b",
    fly: [
      { f: +1, r: +1 },
      { f: -1, r: 1 },
      { f: +1, r: -1 },
      { f: -1, r: -1 },
    ],
  },
  {
    name: "r",
    fly: [
      { f: 0, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "k",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: +1, r: -1 },
      { f: 0, r: -1 },
      { f: -1, r: -1 },
    ],
  },
  {
    name: "+p",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+l",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+n",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+s",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+g",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+b",
    fly: [
      { f: +1, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: -1 },
      { f: -1, r: -1 },
    ],
    just: [
      { f: 0, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
  },
  {
    name: "+r",
    fly: [
      { f: 0, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: 0, r: -1 },
    ],
    just: [
      { f: +1, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: -1 },
      { f: -1, r: -1 },
    ],
  },
  {
    name: "+k",
    just: [
      { f: +1, r: +1 },
      { f: 0, r: +1 },
      { f: -1, r: +1 },
      { f: +1, r: 0 },
      { f: -1, r: 0 },
      { f: +1, r: -1 },
      { f: 0, r: -1 },
      { f: -1, r: -1 },
    ],
  },
  // Color.ERROR
  { name: "(p)" },
  { name: "(l)" },
  { name: "(n)" },
  { name: "(s)" },
  { name: "(g)" },
  { name: "(b)" },
  { name: "(r)" },
  { name: "(k)" },
  { name: "(+p)" },
  { name: "(+l)" },
  { name: "(+n)" },
  { name: "(+s)" },
  { name: "(+g)" },
  { name: "(+b)" },
  { name: "(+r)" },
  { name: "(+k)" },
];

/**
 * 駒移動定義表
 */
export const moveDefTable: ReadonlyArray<MoveDefinition> = moveDefPlainTable.map(
  (mDef, i, a) => {
    const fn = (
      v: MoveDefPlainEntry,
      i: number,
      a: ReadonlyArray<MoveDefPlainEntry>
    ) => {
      const bb = new bitboard(0, 0, 0);
      for (let sq = 0; sq < 81; sq += 1) {
        const fr: MoveDefPlainEntry = sq2fr(sq) || { f: NaN, r: NaN };
        const toF = fr.f + v.f;
        const toR = fr.r + v.r;
        if (
          toF >= File.F1 &&
          toF <= File.F9 &&
          toR >= Rank.R1 &&
          toR <= Rank.R9
        ) {
          bb.bitSet(fr2sq(toF, toR));
        }
      }
      return { f: v.f, r: v.r, lShift: -v.f + 9 * v.r, mask: bb };
    };
    return {
      name: mDef.name,
      just: mDef.just ? mDef.just.map(fn) : undefined,
      fly: mDef.fly ? mDef.fly.map(fn) : undefined,
    };
  }
);

/**
 * 筋bitboard
 */
export const fileBB = Array.from({ length: 9 }, (v, file) => {
  const board = new bitboard(0, 0, 0);
  for (let rank = Rank.R1; rank <= Rank.R9; rank += 1) {
    board.bitSet(fr2sq(file, rank));
  }
  return board;
});

/**
 * 段bitboard
 */
export const rankBB = Array.from({ length: 9 }, (v, rank) => {
  const board = new bitboard(0, 0, 0);
  for (let file = File.F1; file <= File.F9; file += 1) {
    board.bitSet(fr2sq(file, rank));
  }
  return board;
});

/**
 * 方向
 */
export enum Direction {
  LU,
  U,
  RU,
  L,
  R,
  LB,
  B,
  RB,
}

/**
 * 後手/上手から見た方向
 */
export enum DirectionWhite {
  RB,
  B,
  LB,
  R,
  L,
  RU,
  U,
  LU,
}

/**
 * 利きの方向
 */
export const lineDirBB = [
  { f: +1, r: -1 },
  { f: 0, r: -1 },
  { f: -1, r: -1 },
  { f: +1, r: 0 },
  { f: -1, r: 0 },
  { f: +1, r: +1 },
  { f: 0, r: +1 },
  { f: -1, r: +1 },
].map((dir, i, a) =>
  Array.from({ length: 81 }, (v, sq) => {
    const board = new bitboard(0, 0, 0);
    const fr = sq2fr(sq) || { f: NaN as File, r: NaN as Rank };
    let f = fr.f + dir.f;
    let r = fr.r + dir.r;
    while (f >= File.F1 && f <= File.F9 && r >= Rank.R1 && r <= Rank.R9) {
      board.bitSet(fr2sq(f, r));
      f += dir.f;
      r += dir.r;
    }
    return board;
  })
);

/**
 * 指定方向の範囲
 */
export const planeDirBB = [
  { f: +1, r: -1 },
  { f: 0, r: -1 },
  { f: -1, r: -1 },
  { f: +1, r: 0 },
  { f: -1, r: 0 },
  { f: +1, r: +1 },
  { f: 0, r: +1 },
  { f: -1, r: +1 },
].map((dir, i, a) =>
  Array.from({ length: 81 }, (v, sq) => {
    const board = new bitboard(0, 0, 0);
    const fr = sq2fr(sq) || { f: NaN as File, r: NaN as Rank };
    for (let tsq = 0; tsq < 81; tsq += 1) {
      const tfr = sq2fr(tsq) || { f: NaN as File, r: NaN as Rank };
      if (
        (dir.f === 0 || dir.f * (tfr.f - fr.f) > 0) &&
        (dir.r === 0 || dir.r * (tfr.r - fr.r) > 0)
      ) {
        board.bitSet(tsq);
      }
    }
    return board;
  })
);

/**
 * 指定方向の範囲(同じ列・段を含む)
 */
export const planeEqDirBB = [
  { f: +1, r: -1 },
  { f: 0, r: -1 },
  { f: -1, r: -1 },
  { f: +1, r: 0 },
  { f: -1, r: 0 },
  { f: +1, r: +1 },
  { f: 0, r: +1 },
  { f: -1, r: +1 },
].map((dir, i, a) =>
  Array.from({ length: 81 }, (v, sq) => {
    const board = new bitboard(0, 0, 0);
    const fr = sq2fr(sq) || { f: NaN as File, r: NaN as Rank };
    for (let tsq = 0; tsq < 81; tsq += 1) {
      const tfr = sq2fr(tsq) || { f: NaN as File, r: NaN as Rank };
      if (
        (dir.f === 0 || dir.f * (tfr.f - fr.f) >= 0) &&
        (dir.r === 0 || dir.r * (tfr.r - fr.r) >= 0)
      ) {
        board.bitSet(tsq);
      }
    }
    return board;
  })
);

/**
 * 駒の利き(香角飛の長い利きについては別途判定するため、ここでは1マス分のみの利き)
 */
export const moveBB: bitboard[][] = Array.from(
  { length: PieceType2.NB },
  (v, pt) => {
    const moveDef = moveDefTable[pt];
    return Array.from({ length: 81 }, (v, sq) => {
      const board = new bitboard(0, 0, 0);
      const fr = sq2fr(sq) || { f: NaN as File, r: NaN as Rank };
      if (moveDef.just) {
        for (const mDef of moveDef.just) {
          const f: File = fr.f + mDef.f;
          const r: Rank = fr.r + mDef.r;
          if (f >= File.F1 && f <= File.F9 && r >= Rank.R1 && r <= Rank.R9) {
            board.bitSet(fr2sq(f, r));
          }
        }
      }
      if (moveDef.fly) {
        for (const mDef of moveDef.fly) {
          const f: File = fr.f + mDef.f;
          const r: Rank = fr.r + mDef.r;
          if (f >= File.F1 && f <= File.F9 && r >= Rank.R1 && r <= Rank.R9) {
            board.bitSet(fr2sq(f, r));
          }
        }
      }
      return board;
    });
  }
);
export interface Move {
  fromPiece: Piece;
  toPiece: Piece;
  turn: Color;
}

/**
 * 盤面ハッシュ0
 * boardPieceHash0[pt2][sq]
 */
export const boardPieceHash0: ReadonlyArray<
  ReadonlyArray<number>
> = Array.from({ length: PieceType2.NB }, (v, pt2) =>
  Array.from({ length: 81 }, (v, sq) => mtRand.next().value)
);
/**
 * 盤面ハッシュ1
 * boardPieceHash0[pt2][sq]
 */
export const boardPieceHash1: ReadonlyArray<
  ReadonlyArray<number>
> = Array.from({ length: PieceType2.NB }, (v, pt2) =>
  Array.from({ length: 81 }, (v, sq) => mtRand.next().value)
);
/**
 * 手駒ハッシュ0
 * handPiece0[pt2][駒の枚数 % 32]
 */
export const handPieceHash0: ReadonlyArray<ReadonlyArray<number>> = Array.from(
  { length: PieceType2.NB },
  (v, pt2) => Array.from({ length: 32 }, (v, sq) => mtRand.next().value)
);
/**
 * 手駒ハッシュ1
 * handPiece0[pt2][駒の枚数 % 32]
 */
export const handPieceHash1: ReadonlyArray<ReadonlyArray<number>> = Array.from(
  { length: PieceType2.NB },
  (v, pt2) => Array.from({ length: 32 }, (v, sq) => mtRand.next().value)
);

/**
 * Sfen棋譜形式文字列
 * @param {Move} m
 */
export const moveSfenStr = (m: Move) => {
  const fromFr = sq2fr(m.fromPiece.square());
  const toFr = sq2fr(m.toPiece.square());
  return !toFr
    ? null
    : fromFr
    ? [
        "123456789"[fromFr.f],
        "abcdefghi"[fromFr.r],
        "123456789"[toFr.f],
        "abcdefghi"[toFr.r],
        !m.fromPiece.promote() && m.toPiece.promote() ? "+" : "",
      ].join("")
    : [
        m.fromPiece.pt0BlackSfen(),
        "*",
        "123456789"[toFr.f],
        "abcdefghi"[toFr.r],
      ].join("");
};

/**
 * CSA棋譜形式文字列
 * @param {Move} m
 */
export const moveCsaStr = (m: Move) => {
  const fromFr = sq2fr(m.fromPiece.square());
  const toFr = sq2fr(m.toPiece.square());
  return !toFr
    ? null
    : fromFr
    ? [
        " +- "[m.turn],
        "123456789"[fromFr.f],
        "123456789"[fromFr.r],
        "123456789"[toFr.f],
        "123456789"[toFr.r],
        m.toPiece.pt1Csa(),
      ].join("")
    : [
        " +- "[m.turn],
        "00",
        "123456789"[toFr.f],
        "123456789"[toFr.r],
        m.toPiece.pt1Csa(),
      ].join("");
};

export enum ColorFormat {
  NONE,
  TRIANGLE,
  TRIANGLE_INV,
  PIECE,
  PIECE_INV,
  NB,
}
export enum SquareFormat {
  ASCII,
  CLASSIC,
  WIDEARABIC,
  NB,
}
export enum SameSqFormat {
  NOSPACE,
  ASCIISPACE,
  WIDESPACE,
  NB,
}
export interface IFormatOpt {
  color?: ColorFormat;
  samesq?: SameSqFormat;
  square?: SquareFormat;
}
/**
 * Kif棋譜形式座標
 * @param {IFormatOpt} fmt
 * @param {Move} m
 * @param {Square | undefined} prevSq
 */
export const formatKifSquare = (fmt: IFormatOpt, m: Move, prevSq?: Square) => {
  const color = fmt.color !== undefined ? fmt.color : ColorFormat.PIECE;
  const samesq = fmt.samesq !== undefined ? fmt.samesq : SameSqFormat.NOSPACE;
  const square = fmt.square !== undefined ? fmt.square : SquareFormat.CLASSIC;
  const toFr = sq2fr(m.toPiece.square());
  if (!toFr) return "";
  return [
    [
      ["", "", "", ""],
      ["", "▲", "△", ""],
      ["", "▲", "▽", ""],
      ["", "☗", "☖", ""],
      ["", "☗", "⛉", ""],
      // tslint:disable-next-line:ter-computed-property-spacing
    ][color][m.turn],
    prevSq === m.toPiece.square()
      ? ["同", "同 ", "同　"][samesq]
      : ["123456789", "１２３４５６７８９", "１２３４５６７８９"][square][
          toFr.f
        ] +
        ["123456789", "一二三四五六七八九", "１２３４５６７８９"][square][
          toFr.r
        ],
  ].join("");
};

/**
 * Kif棋譜形式文字列
 * @param {Move} m
 * @param {Square | undefined} prevSq 直前の着手先Square
 * @param {IFormatOpt | undefined} fmt
 * @returns {string | null}
 */
export const moveKifStr = (m: Move, prevSq?: Square, fmt: IFormatOpt = {}) => {
  const fromFr = sq2fr(m.fromPiece.square());
  const toFr = sq2fr(m.toPiece.square());
  return !toFr
    ? null
    : fromFr
    ? [
        formatKifSquare(fmt, m, prevSq),
        pt1Kan2Table[m.fromPiece.pt1()],
        m.fromPiece.promote()
          ? ""
          : m.toPiece.promote()
          ? "成"
          : m.fromPiece.pt0() === PieceType0.g ||
            m.fromPiece.pt0() === PieceType0.k
          ? ""
          : m.fromPiece.isEnemyZone() || m.toPiece.isEnemyZone()
          ? "不成"
          : "",
        "(",
        "123456789"[fromFr.f],
        "123456789"[fromFr.r],
        ")",
      ].join("")
    : [formatKifSquare(fmt, m), pt1Kan2Table[m.fromPiece.pt1()], "打"].join("");
};

/**
 * Ki2棋譜形式文字列
 * @param {Move} m Move
 * @param {bitboard} canMoveBB 移動先に動かせる同種駒
 * @param {Square | undefined} prevSq 直前の着手先Square
 * @param {IFormatOpt | undefined} fmt
 * @returns {string | null}
 */
export const moveKi2Str = (
  m: Move,
  canMoveBB: bitboard,
  prevSq?: Square,
  fmt: IFormatOpt = {}
) => {
  const fromFr = sq2fr(m.fromPiece.square());
  const toFr = sq2fr(m.toPiece.square());
  return !toFr
    ? null
    : fromFr
    ? [
        formatKifSquare(fmt, m, prevSq),
        pt1Kan2Table[m.fromPiece.pt1()],
        (() => {
          if (canMoveBB.isOne()) return "";
          if (canMoveBB.isZero()) return "x";
          // 馬や竜が3枚以上ある場合などは今のところ考慮しない
          const dirfn = (dirbb: bitboard) =>
            dirbb.bitCheck(m.fromPiece.square()) &&
            canMoveBB.and(dirbb).isOne();
          if (dirfn(rankBB[toFr.r])) return "寄";
          const dir = m.turn !== Color.WHITE ? Direction : DirectionWhite;
          if (dirfn(planeDirBB[dir.B][m.toPiece.square()])) return "上";
          if (dirfn(planeDirBB[dir.U][m.toPiece.square()])) return "引";
          if (
            ((pt1: PieceType1) =>
              pt1 === PieceType1.s ||
              pt1 === PieceType1.g ||
              pt1 === PieceType1["+p"] ||
              pt1 === PieceType1["+l"] ||
              pt1 === PieceType1["+n"] ||
              pt1 === PieceType1["+s"])(m.fromPiece.pt1()) &&
            dirfn(lineDirBB[dir.B][m.toPiece.square()])
          )
            return "直";
          if (dirfn(planeEqDirBB[dir.L][m.fromPiece.square()])) return "左";
          if (dirfn(planeEqDirBB[dir.R][m.fromPiece.square()])) return "右";
          if (dirfn(lineDirBB[dir.L][m.toPiece.square()])) return "左寄";
          if (dirfn(lineDirBB[dir.R][m.toPiece.square()])) return "右寄";
          const dir2fn = (dirbb1: bitboard, dirbb2: bitboard) =>
            dirbb1.bitCheck(m.fromPiece.square()) &&
            dirbb2.bitCheck(m.fromPiece.square()) &&
            canMoveBB.and(dirbb1).and(dirbb2).isOne();
          if (
            dir2fn(
              planeDirBB[dir.B][m.toPiece.square()],
              planeEqDirBB[dir.L][m.fromPiece.square()]
            )
          )
            return "左上";
          if (
            dir2fn(
              planeDirBB[dir.B][m.toPiece.square()],
              planeEqDirBB[dir.R][m.fromPiece.square()]
            )
          )
            return "右上";
          if (
            dir2fn(
              planeDirBB[dir.U][m.toPiece.square()],
              planeEqDirBB[dir.L][m.fromPiece.square()]
            )
          )
            return "左引";
          if (
            dir2fn(
              planeDirBB[dir.U][m.toPiece.square()],
              planeEqDirBB[dir.R][m.fromPiece.square()]
            )
          )
            return "右引";
          return "x";
        })(),
        m.fromPiece.promote()
          ? ""
          : m.toPiece.promote()
          ? "成"
          : m.fromPiece.pt0() === PieceType0.g ||
            m.fromPiece.pt0() === PieceType0.k
          ? ""
          : m.fromPiece.canPromote() &&
            (m.fromPiece.isEnemyZone() || m.toPiece.isEnemyZone())
          ? "不成"
          : "",
      ].join("")
    : [
        formatKifSquare(fmt, m),
        pt1Kan2Table[m.fromPiece.pt1()],
        canMoveBB.isZero() ? "" : "打",
      ].join("");
};

/**
 * 局面遷移情報などの詰め合わせ
 *
 * 手を戻す、棋譜を書き出すなどする際に使う情報。
 */
export interface StateInfo {
  move: Move;
  capturedPiece: Nullable<Piece>;
  prev: Nullable<StateInfo>;
  changeTurn: boolean;
  canMoveBB: bitboard;
  boardHash0: number;
  boardHash1: number;
  handHash0: number[];
  handHash1: number[];
}

/**
 * 合法手生成タイプ
 */
export enum GenMoveType {
  // 駒を取らない指し手
  NonCaptures,
  // 駒を取る指し手
  Captures,
  // Captures + 価値のかなり高い成りの手(歩成)
  CapturesProPlus,
  // NonCaptures - 価値のかなり高い成りの手(歩成)
  NonCapturesProMinus,
  // 王手回避
  Evasions,
  // 歩・二段香・飛角の不成 を含む Evasions
  EvasionsAll,
  // 王手回避ではない手
  NonEvasions,
  // 歩・二段香・飛角の不成 を含む NonEvasions
  NonEvasionsAll,
  // 歩・二段香・飛角の不成 を除く合法手すべて
  Legal,
  // 合法手すべて
  LegalAll,
  // 王手となる指し手
  Checks,
  // 歩・二段香・飛角の不成 を含む Checks
  ChecksAll,
  // 歩・二段香・飛角の不成 を含まず Captures も除く Checks
  QuietChecks,
  // 歩・二段香・飛角の不成 を含み Captures を除く Checks
  QuietChecksAll,
  // 指定升への移動の指し手のみを生成
  Recaptures,
  // 歩・二段香・飛角の不成 を含む Recaptures
  RecapturesAll,
}

/**
 * 256bitにpackされた局面オブジェクト
 *
 * 駒落ち・詰将棋などの局面対応のため、やねうら王やAperyの教師用フォーマットなどとは非互換にするかも。
 * (現状[2018/01現在]のやねうら王の実装において、玉だけが盤上に無い局面だと玉が欠けた枚数=1～2bit溢れる。)
 * https://github.com/yaneurao/YaneuraOu/blob/master/source/extra/sfen_packer.cpp
 */
export class PackedSfen {
  constructor() {
    throw "TODO: Implement Here";
  }
}

/**
 * 駒の連番号などを含むオブジェクト(内部処理用？)
 */
export class ExtraSfen {
  constructor() {
    throw "TODO: Implement Here";
  }
}

/**
 * 初期局面集
 */
export const presetSfen: { [index: string]: string } = {
  HIRATE: "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
  KY: "lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  KY_R: "1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  KA: "lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HI: "lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HIKY: "lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  2: "lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  3: "lnsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  "3_L": "1nsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  4: "1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  5: "2sgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  "5_L": "1nsgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  6: "2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  8: "3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  10: "4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  19: "4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  TAIKOU: "lnsgkgsnl/1r5b1/p1ppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  RYOUNARI: "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1+B5+R1/LNSGKGSNL b - 1",
  RYUOU: "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPP1P/1B5R1/LNSGKGSNL b p 1",
};

/**
 * 合法局面・合法手判定器の雛形
 */
export interface Validator {
  // 合法手判定
  readonly legal: (pos: Position, m: Move) => boolean;
  // 自殺手を除く合法手判定
  readonly pseudoLegal: (pos: Position, m: Move) => boolean;
  // 局面の合法性
  readonly positionLegal: (pos: Position) => boolean;
}

/**
 * 局面編集用判定器
 */
export const editValidator: Validator = {
  legal: (pos, m): boolean => true,
  pseudoLegal: (pos, m): boolean => true,
  positionLegal: (pos): boolean => true,
};

/**
 * 本将棋用判定器（平手だけでなく、駒落ちの局面も許容）
 */
export const standardValidator: Validator = (() => {
  const pt0Max = [18, 4, 4, 4, 2, 2, 4, 2];
  // 局面の合法性
  const positionLegal = (pos: Position): boolean => {
    const pt0a: Piece[][] = Array.from({ length: PieceType0.NB }, () => []);
    const pt2a: Piece[][] = Array.from({ length: PieceType2.NB }, () => []);
    // 盤上のチェック
    for (let sq: Square = 0; sq < 81; sq += 1) {
      const p = pos.board[sq];
      if (p === null) continue;
      const c = p.color();
      const pt2 = p.pt2();
      const pt0 = p.pt0();
      // 手番のおかしな駒が無いか
      if (c !== Color.BLACK && c !== Color.WHITE) return false;
      // 行き所のない駒ではないか
      if (moveBB[pt2][sq].isZero()) return false;
      // 枚数カウント
      pt0a[pt0].push(p);
      pt2a[pt2].push(p);
    }
    for (const pt2 of [PieceType2.k, PieceType2.K]) {
      // 盤上に王/玉が1枚ずつあるか
      if (pt2a[pt2].length !== 1) return true;
    }
    // 二歩チェック
    for (const pt2 of [PieceType2.p, PieceType2.P]) {
      const fcount = Array.from({ length: 9 }, (v, k) => 0);
      for (const p of pt2a[pt2]) {
        const fr = sq2fr(p.square());
        if (!fr) return false;
        fcount[fr.f] += 1;
      }
      for (let f: File = 0; f < 9; f += 1) {
        if (fcount[f] > 1) return false;
      }
    }
    // 駒台のチェック
    for (let c: Color = 0; c < Color.NB; c += 1) {
      for (let pt2: PieceType2 = 0; pt2 < PieceType2.NB; pt2 += 1) {
        for (const p of pos.hand[c][pt2]) {
          // 手番のおかしな駒は無いか
          if (c !== p.color()) return false;
          // 枚数カウント
          pt0a[p.pt0()].push(p);
          pt2a[p.pt2()].push(p);
        }
      }
    }
    for (let pt0: PieceType0 = 0; pt0 < PieceType0.NB; pt0 += 1) {
      // 駒の枚数が多すぎないか
      if (pt0a[pt0].length > pt0Max[pt0]) return false;
    }
    return true;
  };
  // 自殺手を除く合法手判定
  const pseudoLegal = (pos: Position, m: Move): boolean => {
    // 局面の手番と指し手の手番が異なってはいけない
    if (pos.turn !== m.turn) return false;
    // 局面が不正ではいけない
    if (!positionLegal(pos)) return false;
    throw "TODO: Implement Here";
  };
  // 合法手判定
  const legal = (pos: Position, m: Move): boolean => {
    if (!pseudoLegal(pos, m)) return false;
    throw "TODO: Implement Here";
  };
  return { legal, pseudoLegal, positionLegal };
})();

/**
 * 詰将棋用判定器
 * 攻方は黒番、玉方は白番。
 * 攻方は王手を掛ける手、玉方は相手の王手を受ける局面のみ許容。
 * 詰みの局面で攻方に持駒があってはならない。
 */
export const tsumeValidator: Validator = {
  // 合法手判定
  legal: (pos, m): boolean => {
    throw "TODO: Implement Here";
  },
  // 自殺手を除く合法手判定
  pseudoLegal: (pos, m): boolean => {
    throw "TODO: Implement Here";
  },
  // 局面の合法性
  positionLegal: (pos): boolean => {
    throw "TODO: Implement Here";
  },
};

/**
 * 盤面クラス
 */
export class Position {
  board: Nullable<Piece>[];
  fv: Piece[][];
  pboard: bitboard[];
  pboardColor: bitboard[];
  pboardAll: bitboard;
  hand: Piece[][][];
  turn: Color;
  ply: number;
  stateinfo: Nullable<StateInfo>;
  // 駒生成情報
  pieceBox: { createdNum: number; maxNum: number }[];
  // 駒台の駒に成駒を認めるか
  promoteHand: boolean;
  validator: Validator;
  boardHash0: number;
  boardHash1: number;
  handHash0: number[];
  handHash1: number[];

  constructor(opt: { infinityPieceBox?: boolean; validator?: Validator } = {}) {
    this.board = Array.from({ length: 81 }, () => null);
    this.fv = Array.from({ length: PieceType0.NB }, () => []);
    this.pboard = Array.from(
      { length: PieceType2.NB },
      () => new bitboard(0, 0, 0)
    );
    this.pboardColor = Array.from(
      { length: Color.NB },
      () => new bitboard(0, 0, 0)
    );
    this.pboardAll = new bitboard(0, 0, 0);
    this.hand = Array.from({ length: Color.NB }, () =>
      Array.from({ length: PieceType2.NB }, () => [])
    );
    this.turn = Color.BLACK;
    this.ply = 1;
    this.stateinfo = null;
    this.pieceBox = Array.from({ length: 8 }, (_, k) => ({
      createdNum: 0,
      maxNum: opt.infinityPieceBox ? 999 : [18, 4, 4, 4, 2, 2, 4, 2][k],
    }));
    this.promoteHand = false;
    this.validator = opt.validator || editValidator;
    this.boardHash0 = 0;
    this.boardHash1 = 0;
    this.handHash0 = Array.from({ length: Color.NB }, () => 0);
    this.handHash1 = Array.from({ length: Color.NB }, () => 0);
  }
  /**
   * 盤面初期化
   */
  clear(): void {
    this.board = Array.from({ length: 81 }, () => null);
    this.fv = Array.from({ length: PieceType0.NB }, () => []);
    this.pboard = Array.from(
      { length: PieceType2.NB },
      () => new bitboard(0, 0, 0)
    );
    this.pboardColor = Array.from(
      { length: Color.NB },
      () => new bitboard(0, 0, 0)
    );
    this.pboardAll = new bitboard(0, 0, 0);
    this.hand = Array.from({ length: Color.NB }, () =>
      Array.from({ length: PieceType2.NB }, () => [])
    );
    for (const val of this.pieceBox) {
      val.createdNum = 0;
    }
    this.turn = Color.BLACK;
    this.ply = 1;
    this.stateinfo = null;
    this.boardHash0 = 0;
    this.boardHash1 = 0;
    this.handHash0 = Array.from({ length: Color.NB }, () => 0);
    this.handHash1 = Array.from({ length: Color.NB }, () => 0);
  }
  /**
   * 合法判定器の変更
   * @param validator
   */
  changeValidator(validator: Validator): void {
    this.validator = validator;
  }
  /**
   * 駒数上限の変更
   * @param infinityPieceBox
   */
  changeMaxPieceBox(infinityPieceBox: boolean): void {
    if (infinityPieceBox) {
      this.pieceBox[0].maxNum = 999;
      this.pieceBox[1].maxNum = 999;
      this.pieceBox[2].maxNum = 999;
      this.pieceBox[3].maxNum = 999;
      this.pieceBox[4].maxNum = 999;
      this.pieceBox[5].maxNum = 999;
      this.pieceBox[6].maxNum = 999;
      this.pieceBox[7].maxNum = 999;
    } else {
      this.pieceBox[0].maxNum = 18;
      this.pieceBox[1].maxNum = 4;
      this.pieceBox[2].maxNum = 4;
      this.pieceBox[3].maxNum = 4;
      this.pieceBox[4].maxNum = 2;
      this.pieceBox[5].maxNum = 2;
      this.pieceBox[6].maxNum = 4;
      this.pieceBox[7].maxNum = 2;
    }
  }
  /**
   * 盤面の設定
   * @param {string | PackedSfen | ExtraSfen} sfen
   * @returns {boolean}
   */
  set(sfen: string | PackedSfen | ExtraSfen): boolean {
    try {
      const parseErrorStr = "illeagal sfen";
      this.clear();
      if (typeof sfen === "string") {
        // sfen is string
        const fragWords = sfen.split(" ").filter((v, i, a) => v);
        let frag: string | undefined;
        while ((frag = fragWords.shift()) !== undefined) {
          if (frag === "" || frag === "position" || frag === "sfen") {
            continue;
          } else if (frag === "startpos") {
            frag = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL";
            fragWords.unshift("b", "-", "1");
            break;
          } else {
            break;
          }
        }
        if (!frag) {
          return true;
        }
        // 盤面の処理
        const fragRank = frag.split("/");
        if (fragRank.length !== 9) {
          throw `${parseErrorStr}: 盤面が9つの段に分かれていない`;
        }
        for (let rank = Rank.R1; rank <= Rank.R9; rank += 1) {
          const strRank = fragRank[rank];
          let file = File.F9;
          let idx = 0;
          let promoted = false;
          let sfenChar: string | undefined;
          while ((sfenChar = strRank[idx])) {
            if (file < File.F1) {
              throw `${parseErrorStr}: 盤面で1つの段が多すぎてはみ出した`;
            }
            switch (sfenChar) {
              case "+":
                if (promoted) {
                  throw `${parseErrorStr}: 持駒で成記号"+"の後に再び成記号が現れた`;
                }
                promoted = true;
                break;
              case "1":
              case "2":
              case "3":
              case "4":
              case "5":
              case "6":
              case "7":
              case "8":
              case "9":
                if (promoted) {
                  throw `${parseErrorStr}: 盤面で成記号"+"直後の数字は認められない`;
                }
                file -= Number(sfenChar);
                break;
              // この段階では成金も成玉も、行きどころのない歩香桂、玉が片側に2枚なんかも許す。
              // Validatorを使って後でチェックするつもり。
              case "P":
              case "L":
              case "N":
              case "S":
              case "G":
              case "B":
              case "R":
              case "K":
                this.putPiece(
                  PieceType0[sfenChar],
                  promoted,
                  Color.BLACK,
                  fr2sq(file, rank)
                );
                file -= 1;
                promoted = false;
                break;
              case "p":
              case "l":
              case "n":
              case "s":
              case "g":
              case "b":
              case "r":
              case "k":
                this.putPiece(
                  PieceType0[sfenChar],
                  promoted,
                  Color.WHITE,
                  fr2sq(file, rank)
                );
                file -= 1;
                promoted = false;
                break;
              default:
                throw `${parseErrorStr}: 盤面で不明な文字が現れた`;
            }
            idx += 1;
          }
          if (file !== File.F1 - 1) {
            throw `${parseErrorStr}: 盤面で1つの段の情報が満たされていない`;
          }
        }
        // 手番の処理
        switch (fragWords.shift()) {
          case "b":
            this.turn = Color.BLACK;
            break;
          case "w":
            this.turn = Color.WHITE;
            break;
          default:
            throw `${parseErrorStr}: 手番指定が不明`;
        }
        // 持ち駒の処理
        frag = fragWords.shift();
        if (!frag) {
          throw `${parseErrorStr}: 持駒の欄が存在しない`;
        }
        if (frag !== "-") {
          let idx = 0;
          let amount = 0;
          let promoted = false;
          let sfenChar: string | undefined;
          while ((sfenChar = frag[idx]) !== undefined) {
            switch (sfenChar) {
              case "0":
                // 0で始まる枚数指定は認めない
                if (amount === 0) {
                  throw `${parseErrorStr}: 持駒で0が指定された`;
                }
                if (promoted) {
                  throw `${parseErrorStr}: 持駒で成記号"+"直後の数字は認められない`;
                }
                amount *= 10;
                break;
              case "1":
              case "2":
              case "3":
              case "4":
              case "5":
              case "6":
              case "7":
              case "8":
              case "9":
                if (promoted) {
                  throw `${parseErrorStr}: 持駒で成記号"+"直後の数字は認められない`;
                }
                amount = amount * 10 + Number(sfenChar);
                break;
              // 成駒の持ち駒を認める。'12+p'の書き方は可、'+12p'は不可。
              case "+":
                if (promoted) {
                  throw `${parseErrorStr}: 持駒で成記号"+"の後に再び成記号が現れた`;
                }
                promoted = true;
                break;
              case "P":
              case "L":
              case "N":
              case "S":
              case "G":
              case "B":
              case "R":
              case "K":
                this.putHandPiece(
                  PieceType0[sfenChar],
                  promoted,
                  Color.BLACK,
                  Math.max(amount, 1)
                );
                amount = 0;
                promoted = false;
                break;
              case "p":
              case "l":
              case "n":
              case "s":
              case "g":
              case "b":
              case "r":
              case "k":
                this.putHandPiece(
                  PieceType0[sfenChar],
                  promoted,
                  Color.WHITE,
                  Math.max(amount, 1)
                );
                amount = 0;
                promoted = false;
                break;
              default:
                throw `${parseErrorStr}: 持駒で不明な文字が現れた`;
            }
            idx += 1;
          }
        }
        frag = fragWords.shift();
        // 手数の省略を認める
        if (frag && frag !== "moves") {
          const ply = Number(frag);
          // 一応、0や負の手数も受け入れる
          if (Number.isSafeInteger(ply) && String(ply) === frag) {
            this.ply = ply;
          } else {
            throw `${parseErrorStr}: 手数の表記が不正`;
          }
          frag = fragWords.shift();
        }
        if (!this.validator.positionLegal(this)) {
          throw `${parseErrorStr}: 局面が不正`;
        }
        if (frag === "moves") {
          for (;;) {
            frag = fragWords.shift();
            if (!frag) {
              break;
            }
            if (
              /^(?:[1-9][a-i][1-9][a-i]\+?|[PLNSGBRK]\*[1-9][a-i])$/.test(frag)
            ) {
              if (frag[1] === "*") {
                const toSq: Square = fr2sq(
                  frag.charCodeAt(2) - "1".charCodeAt(0),
                  frag.charCodeAt(3) - "a".charCodeAt(0)
                );
                const pt0h: { [i: string]: PieceType0 } = {
                  P: PieceType0.P,
                  L: PieceType0.L,
                  N: PieceType0.N,
                  S: PieceType0.S,
                  G: PieceType0.G,
                  B: PieceType0.B,
                  R: PieceType0.R,
                  K: PieceType0.K,
                };
                if (
                  !this.hand[this.turn][
                    convPt0Pt2(pt0h[frag[0]], false, this.turn)
                  ].length
                ) {
                  `${parseErrorStr}: 持駒が存在しない`;
                }
                const fromPiece = this.hand[this.turn][
                  convPt0Pt2(pt0h[frag[0]], false, this.turn)
                ][0];
                const toPiece = fromPiece.genSquare(toSq);
                this.doMove({ fromPiece, toPiece, turn: this.turn });
              } else {
                const fromSq: Square = fr2sq(
                  frag.charCodeAt(0) - "1".charCodeAt(0),
                  frag.charCodeAt(1) - "a".charCodeAt(0)
                );
                const fromPiece = this.board[fromSq];
                if (!fromPiece) {
                  throw `${parseErrorStr}: 指定されたマスに駒がない`;
                }
                const toSq: Square = fr2sq(
                  frag.charCodeAt(2) - "1".charCodeAt(0),
                  frag.charCodeAt(3) - "a".charCodeAt(0)
                );
                const promote = frag[4] === "+";
                if (promote && fromPiece.promote()) {
                  throw `${parseErrorStr}: 成駒を成ろうとしている`;
                }
                const toPiece = fromPiece.genSquare(toSq).genOrPromote(promote);
                this.doMove({ fromPiece, toPiece, turn: this.turn });
              }
            } else if (frag === "0000" || frag === "null" || frag === "pass") {
              this.doNullMove();
            } else if (frag === "resign" || frag === "win" || frag === "draw") {
              break;
            } else {
              throw `${parseErrorStr}: 不明な指し手文字列`;
            }
          }
        }
      } else if (sfen instanceof PackedSfen) {
        // sfen is PackedSfen
        sfen;
      } else if (sfen instanceof ExtraSfen) {
        // sfen is ExtraSfen
        sfen;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }
  sfen(trimPly = false): string {
    return [
      Array.from({ length: 9 }, (v, r) => {
        let b = "";
        for (let f = 0; f < 9; f += 1) {
          const p = this.board[r * 9 + f];
          if (p) {
            b += p.pt2Sfen();
          } else {
            let e = 1;
            while (f < 8 && !this.board[r * 9 + f + 1]) {
              e += 1;
              f += 1;
            }
            b += String(e);
          }
        }
        return b;
      }).join("/"),
      convColor2Sfen(this.turn),
      [
        PieceType2.R,
        PieceType2.B,
        PieceType2.G,
        PieceType2.S,
        PieceType2.N,
        PieceType2.L,
        PieceType2.P,
        PieceType2.r,
        PieceType2.b,
        PieceType2.g,
        PieceType2.s,
        PieceType2.n,
        PieceType2.l,
        PieceType2.p,
      ]
        .map((v, i) => {
          const len = this.hand[convPt2Color(v)][v].length;
          if (len > 1) {
            return String(len) + pt2SfenTable[v];
          }
          if (len === 1) {
            return pt2SfenTable[v];
          }
          return "";
        })
        .join("") || "-",
      String(this.ply),
    ].join(" ");
  }
  packedsfen(): PackedSfen {
    throw "TODO: Implement Here";
  }
  pretty(m: Move): string {
    throw "TODO: Implement Here";
  }
  /**
   * toSq に移動可能な pt2 の種類の駒を bitboard にて列挙する。
   * 伝統的棋譜表現と内部表現との変換に利用。
   * @param {PieceType2} pt2
   * @param {Square} toSq
   * @returns {bitboard}
   */
  canMoveSameTypeBB(pt2: PieceType2, toSq: Square): bitboard {
    const bb = new bitboard(0, 0, 0);
    const tofr = sq2fr(toSq);
    const md = moveDefPlainTable[pt2];
    if (tofr) {
      for (const p of this.fv[convPt2Pt0Type(pt2)]) {
        if (p.pt2() !== pt2) {
          continue;
        }
        const psq = p.square();
        const pfr = sq2fr(psq);
        if (!pfr) {
          continue;
        }
        let fl = false;
        if (md.just) {
          for (const mde of md.just) {
            if (pfr.f + mde.f === tofr.f && pfr.r + mde.r === tofr.r) {
              fl = true;
              bb.bitSet(psq);
              break;
            }
          }
        }
        if (!fl && md.fly) {
          for (const mde of md.fly) {
            let f = pfr.f;
            let r = pfr.r;
            for (let i = 1; i < 9; i += 1) {
              f += mde.f;
              r += mde.r;
              if (f === tofr.f && r === tofr.r) {
                fl = true;
                bb.bitSet(psq);
                break;
              }
              if (
                f < File.F1 ||
                f > File.F9 ||
                r < Rank.R1 ||
                r > Rank.R9 ||
                this.board[fr2sq(f, r)]
              ) {
                break;
              }
            }
            if (fl) {
              break;
            }
          }
        }
      }
    }
    return bb;
  }
  /**
   * 着手
   * @param {Move} m
   * @param {boolean | undefined} changeTurn
   * @returns {boolean}
   */
  doMove(m: Move, changeTurn = true): boolean {
    // 移動元と移動先の駒の種類が異なるのはNG
    if (
      m.fromPiece.pt0() !== m.toPiece.pt0() ||
      m.fromPiece.seq() !== m.toPiece.seq()
    ) {
      console.error("move failed; fromPiece/toPiece is wrong;", { m });
      return false;
    }
    if (m.fromPiece.square() < 0 || m.toPiece.square() < 0) {
      if (m.fromPiece.square() !== m.toPiece.square()) {
        return false;
      }
    }
    // バリデーションの処理は大部分を丸投げ
    if (!this.validator.legal(this, m)) {
      return false;
    }
    let movedPiece: Piece;
    let capturedPiece: Nullable<Piece>;
    const canMoveBB = this.canMoveSameTypeBB(
      m.fromPiece.pt2(),
      m.toPiece.square()
    );
    // 移動元から駒を除去
    if (m.fromPiece.square() < 81 && m.fromPiece.square() >= 0) {
      const fromPiece = this.board[m.fromPiece.square()];
      if (!fromPiece || fromPiece.pt2() !== m.fromPiece.pt2()) {
        console.error("move failed; fromPieceType is wrong;", { m, pos: this });
        return false;
      }
      movedPiece = m.fromPiece;
      this.board[m.fromPiece.square()] = null;
      this.pboard[m.fromPiece.pt2()].bitClear(m.fromPiece.square());
      this.pboardColor[m.fromPiece.color()].bitClear(m.fromPiece.square());
      this.pboardAll.bitClear(m.fromPiece.square());
      this.boardHash0 ^=
        boardPieceHash0[m.fromPiece.pt2()][m.fromPiece.square()];
      this.boardHash1 ^=
        boardPieceHash1[m.fromPiece.pt2()][m.fromPiece.square()];
    } else {
      const handColor = handSq2Color(m.fromPiece.square());
      const handPiece = this.hand[handColor][m.fromPiece.pt2()].find(
        (v) => v.pt2() === m.fromPiece.pt2() && v.seq() === m.fromPiece.seq()
      );
      if (handPiece) {
        movedPiece = handPiece;
      } else {
        if (handColor === Color.GRAY) {
          const boxSt = this.pieceBox[m.fromPiece.pt0()];
          if (boxSt.createdNum < boxSt.maxNum) {
            const toPiece = m.toPiece;
            movedPiece = this.putPiecebox(
              toPiece.pt0(),
              toPiece.promote(),
              toPiece.color(),
              toPiece.square()
            );
          } else {
            console.error("move failed; not remain pieceBox;", {
              m,
              pos: this,
            });
            return false;
          }
        }
        console.error("move failed; hand has not the piece;", { m, pos: this });
        return false;
      }
      this.hand[handColor][movedPiece.pt2()] = this.hand[handColor][
        movedPiece.pt2()
      ].filter(
        (v) => v.pt2() !== movedPiece.pt2() || v.seq() !== movedPiece.seq()
      );
      this.handHash0[handColor] ^=
        handPieceHash0[movedPiece.pt2()][
          this.hand[handColor][movedPiece.pt0()].length & 31
        ];
      this.handHash1[handColor] ^=
        handPieceHash1[movedPiece.pt2()][
          this.hand[handColor][movedPiece.pt0()].length & 31
        ];
    }
    // 移動先に駒を移す
    if (m.toPiece.square() < 0) {
      return false;
    }
    if (m.toPiece.square() < 81) {
      capturedPiece = this.board[m.toPiece.square()];
      if (capturedPiece) {
        // 盤面編集の用途を兼ねて、駒が重なった時は動かした駒の側の駒台に載せるようにする
        const p = this.promoteHand
          ? capturedPiece
              .genColor(m.fromPiece.color())
              .genSquare(handColor2Sq(m.toPiece.color()))
          : capturedPiece
              .genPromote(false)
              .genColor(m.fromPiece.color())
              .genSquare(handColor2Sq(m.toPiece.color()));
        this.boardHash0 ^=
          boardPieceHash0[capturedPiece.pt2()][capturedPiece.square()];
        this.boardHash1 ^=
          boardPieceHash1[capturedPiece.pt2()][capturedPiece.square()];
        this.handHash0[p.color()] ^=
          handPieceHash0[p.pt2()][
            this.hand[m.fromPiece.color()][p.pt2()].length & 31
          ];
        this.handHash1[p.color()] ^=
          handPieceHash1[p.pt2()][
            this.hand[m.fromPiece.color()][p.pt2()].length & 31
          ];
        this.hand[m.fromPiece.color()][p.pt2()].push(p);
        this.fv[p.pt0()][p.seq()] = p;
        this.pboard[capturedPiece.pt2()].bitClear(m.toPiece.square());
        this.pboardColor[capturedPiece.color()].bitClear(m.toPiece.square());
        // this.pboardAll.bitClear(m.toSquare());
      } else {
        capturedPiece = null;
      }
      const p = movedPiece
        .genPt2(m.toPiece.pt2())
        .genSquare(m.toPiece.square());
      this.board[p.square()] = p;
      this.fv[p.pt0()][p.seq()] = p;
      this.pboard[p.pt2()].bitSet(p.square());
      this.pboardColor[p.color()].bitSet(p.square());
      this.pboardAll.bitSet(p.square());
      this.boardHash0 ^= boardPieceHash0[p.pt2()][p.square()];
      this.boardHash1 ^= boardPieceHash1[p.pt2()][p.square()];
    } else {
      capturedPiece = null;
      const p = movedPiece
        .genPt2(m.toPiece.pt2())
        .genSquare(m.toPiece.square());
      const c = handSq2Color(p.square());
      this.handHash0[c] ^=
        handPieceHash0[p.pt2()][this.hand[c][p.pt2()].length & 31];
      this.handHash1[c] ^=
        handPieceHash1[p.pt2()][this.hand[c][p.pt2()].length & 31];
      this.hand[c][p.pt2()].push(p);
      this.fv[p.pt0()][p.seq()] = p;
    }
    this.stateinfo = {
      capturedPiece,
      canMoveBB,
      changeTurn,
      move: m,
      prev: this.stateinfo,
      boardHash0: this.boardHash0,
      boardHash1: this.boardHash1,
      handHash0: Array.from({ length: Color.NB }, (v, k) => this.handHash0[k]),
      handHash1: Array.from({ length: Color.NB }, (v, k) => this.handHash1[k]),
    };
    if (changeTurn) {
      this.changeTurn();
    }
    this.ply += 1;
    return true;
  }
  /**
   * 手を戻す
   * @returns {boolean}
   */
  undoMove(): boolean {
    if (!this.stateinfo) {
      // moveの履歴情報がない
      console.error("stateinfo is null");
      return false;
    }
    const si = this.stateinfo;
    const fromPiece = si.move.fromPiece;
    const toPiece = si.move.toPiece;
    if (
      fromPiece.square() < 81 &&
      fromPiece.square() >= 0 &&
      this.board[fromPiece.square()]
    ) {
      // 移動元に駒があるのはおかしい
      console.error("fromsquare has piece", {
        stateinfo: si,
        board: this.board,
      });
      return false;
    }
    if (toPiece.square() < 81 && toPiece.square() >= 0) {
      /*
      const p = this.board[si.move.toPiece.square()];
      if (!p || p.pt2() !== si.move.toPiece.pt2() || p.seq !== si.move.toPiece.seq()) {
        console.log('', { stateinfo: si, pos: this });
        return false;
      }
      */
      const capturedPiece = si.capturedPiece;
      if (capturedPiece) {
        /*
        const cp = this.hand[si.move.fromPiece.color()][capturedPiece.pt0()].find(
          (v, i, a) => (v.pt0() === capturedPiece.pt0() && v.seq() === capturedPiece.seq()),
        );
        if (!cp) {
          console.log('', { stateinfo: si, pos: this });
          return false;
        }
        */
        const p = this.promoteHand
          ? capturedPiece
              .genColor(fromPiece.color())
              .genSquare(handColor2Sq(toPiece.color()))
          : capturedPiece
              .genPromote(false)
              .genColor(fromPiece.color())
              .genSquare(handColor2Sq(toPiece.color()));

        this.hand[fromPiece.color()][p.pt2()] = this.hand[fromPiece.color()][
          p.pt2()
        ].filter((v, i, a) => v.pt2() !== p.pt2() || v.seq() !== p.seq());
        this.board[toPiece.square()] = capturedPiece;
        this.fv[capturedPiece.pt0()][capturedPiece.seq()] = capturedPiece;
        this.pboard[toPiece.pt2()].bitClear(toPiece.square());
        this.pboardColor[toPiece.color()].bitClear(toPiece.square());
        this.pboard[capturedPiece.pt2()].bitSet(toPiece.square());
        this.pboardColor[capturedPiece.color()].bitSet(toPiece.square());
        // this.pboardAll.bitSet(toPiece.square());
        this.boardHash0 ^=
          boardPieceHash0[capturedPiece.pt2()][capturedPiece.square()];
        this.boardHash1 ^=
          boardPieceHash1[capturedPiece.pt2()][capturedPiece.square()];
        this.handHash0[p.color()] ^=
          handPieceHash0[p.pt2()][
            this.hand[fromPiece.color()][p.pt2()].length & 31
          ];
        this.handHash1[p.color()] ^=
          handPieceHash1[p.pt2()][
            this.hand[fromPiece.color()][p.pt2()].length & 31
          ];
      } else {
        this.board[toPiece.square()] = null;
        this.pboard[toPiece.pt2()].bitClear(toPiece.square());
        this.pboardColor[toPiece.color()].bitClear(toPiece.square());
        this.pboardAll.bitClear(toPiece.square());
      }
      this.boardHash0 ^= boardPieceHash0[toPiece.pt2()][toPiece.square()];
      this.boardHash1 ^= boardPieceHash1[toPiece.pt2()][toPiece.square()];
    } else {
      const handColor = handSq2Color(si.move.toPiece.square());
      /*
      const p = this.hand[handColor][si.move.toPiece.pt0()].find(
        (v, i, a) => (v.pt0() === si.move.toPiece.pt0() && v.seq() === si.move.toPiece.seq()),
      );
      if (!p) {
        console.log('', { stateinfo: si, pos: this });
        return false;
      }
      */
      this.hand[handColor][toPiece.pt2()] = this.hand[handColor][
        toPiece.pt2()
      ].filter(
        (v, i, a) => v.pt0() !== toPiece.pt0() || v.seq() !== toPiece.seq()
      );
      this.handHash0[handColor] ^=
        handPieceHash0[toPiece.pt2()][
          this.hand[handColor][toPiece.pt2()].length & 31
        ];
      this.handHash1[handColor] ^=
        handPieceHash1[toPiece.pt2()][
          this.hand[handColor][toPiece.pt2()].length & 31
        ];
    }
    if (fromPiece.square() < 81 && fromPiece.square() >= 0) {
      this.board[fromPiece.square()] = fromPiece;
      this.fv[fromPiece.pt0()][fromPiece.seq()] = fromPiece;
      this.pboard[fromPiece.pt2()].bitSet(fromPiece.square());
      this.pboardColor[fromPiece.color()].bitSet(fromPiece.square());
      this.pboardAll.bitSet(fromPiece.square());
      this.boardHash0 ^= boardPieceHash0[fromPiece.pt2()][fromPiece.square()];
      this.boardHash1 ^= boardPieceHash1[fromPiece.pt2()][fromPiece.square()];
    } else {
      const c = handSq2Color(fromPiece.square());
      this.hand[c][fromPiece.pt2()].push(fromPiece);
      this.fv[fromPiece.pt0()][fromPiece.seq()] = fromPiece;
      this.handHash0[c] ^=
        handPieceHash0[fromPiece.pt2()][
          this.hand[c][fromPiece.pt2()].length & 31
        ];
      this.handHash1[c] ^=
        handPieceHash1[fromPiece.pt2()][
          this.hand[c][fromPiece.pt2()].length & 31
        ];
    }
    if (si.changeTurn) {
      this.changeTurn();
    }
    this.ply -= 1;
    this.stateinfo = si.prev;
    return true;
  }
  doNullMove(): boolean {
    throw "TODO: Implement Here";
  }
  undoNullMove(): boolean {
    throw "TODO: Implement Here";
  }
  /**
   * 駒箱から駒を取り出す
   * @param {PieceType0} pt0
   * @param {boolean} pro
   * @param {Color} c
   * @param {Square} sq
   * @returns {Piece}
   */
  putPiecebox(pt0: PieceType0, pro: boolean, c: Color, sq: Square): Piece {
    const pb = this.pieceBox[pt0];
    if (pb === undefined) {
      console.error("not found piecetype in piecebox;", { pos: this });
      throw "error in putPiecebox";
    }
    if (pb.createdNum >= pb.maxNum) {
      // もう出せる駒が残っていない
      console.error("not remain piece;", { pos: this });
      throw "error in putPiecebox";
    }
    const p = Piece.gen(pt0, pro, c, c, sq, pb.createdNum);
    pb.createdNum += 1;
    return p;
  }
  /**
   * (駒箱から)盤上に駒を置く
   * @param {PieceType0} pt0
   * @param {boolean} pro
   * @param {Color} c
   * @param {Square} sq
   * @returns {boolean}
   */
  putPiece(pt0: PieceType0, pro: boolean, c: Color, sq: Square): boolean {
    if (!Number.isSafeInteger(sq) || sq < 0 || sq >= 81) {
      // この関数で駒箱から駒台には駒を置けない
      console.error("error argument sq;", { sq, pos: this });
      return false;
    }
    if (this.board[sq]) {
      // もうそのマスに駒があるようですが？
      console.error("this square already have piece;", { sq, pos: this });
      return false;
    }
    const p = this.putPiecebox(pt0, pro, c, sq);
    this.board[sq] = p;
    this.fv[pt0][p.seq()] = p;
    this.pboard[p.pt2()].bitSet(sq);
    this.pboardColor[c].bitSet(sq);
    this.pboardAll.bitSet(sq);
    this.boardHash0 ^= boardPieceHash0[p.pt2()][sq];
    this.boardHash1 ^= boardPieceHash1[p.pt2()][sq];
    return true;
  }
  /**
   * (駒箱から)駒台に駒を置く
   * @param {PieceType0} pt0
   * @param {boolean} pro
   * @param {Color} c
   * @param {number} num
   * @returns {boolean}
   */
  putHandPiece(pt0: PieceType0, pro: boolean, c: Color, num: number): boolean {
    if (!Number.isSafeInteger(num) || num < 0) {
      // 負の枚数は認めない
      console.error("error argument;", { pt0, pro, c, num, pos: this });
      return false;
    }
    const sq = handColor2Sq(c);
    const pt2 = convPt0Pt2(pt0, pro, c);
    for (let i = 0; i < num; i += 1) {
      const p = this.putPiecebox(pt0, pro, c, sq);
      this.handHash0[c] ^= handPieceHash0[c][this.hand[c][pt2].length & 31];
      this.handHash1[c] ^= handPieceHash1[c][this.hand[c][pt2].length & 31];
      this.hand[c][pt2].push(p);
      this.fv[pt0][p.seq()] = p;
    }
    return true;
  }
  /**
   * 手数
   * @returns {number}
   */
  gamePly(): number {
    return this.ply;
  }
  /**
   * 手数の設定
   * @param {number} ply
   * @returns {boolean}
   */
  setPly(ply: number): boolean {
    if (Number.isSafeInteger(ply)) {
      this.ply = ply;
      return true;
    }
    console.error("error argument;", { ply, pos: this });
    return false;
  }
  /**
   * 手番
   * @returns {Color}
   */
  gameTurn(): Color {
    return this.turn;
  }
  /**
   * 手番の設定
   * @param c
   * @returns {boolean}
   */
  setTurn(c: Color): boolean {
    switch (c) {
      case Color.BLACK:
      case Color.WHITE:
        this.turn = c;
        return true;
      default:
        console.error("error turn;", { pos: this });
        return false;
    }
  }
  /**
   * 手番の変更
   * @returns {boolean}
   */
  changeTurn(): boolean {
    switch (this.turn) {
      case Color.BLACK:
        this.turn = Color.WHITE;
        return true;
      case Color.WHITE:
        this.turn = Color.BLACK;
        return true;
      default:
        console.error("error turn;", { pos: this });
        return false;
    }
  }
  /**
   * 盤上の駒を返す
   * @param {Square} sq
   * @returns {Nullable<Piece>}
   */
  pieceOn(sq: Square): Nullable<Piece> {
    return this.board[sq];
  }
  /**
   * c側の玉の位置を返す
   * @param {Color} c
   * @returns {Nullable<Square>}
   */
  kingSquare(c: Color): Nullable<Square> {
    for (const p of this.fv[PieceType0.k]) {
      if (p && p.color() === c) {
        return p.square();
      }
    }
    return null;
  }
  /**
   * sqに利きのある駒のあるマスの列
   * @param {Square} sq
   * @param {Color | undefined} c
   */
  attackersTo(sq: Square, c?: Color): Square[] {
    const fr = sq2fr(sq);
    if (!fr) {
      return [];
    }
    const f = fr.f;
    const r = fr.r;
    const res: Square[] = [];
    for (let sqI: Square = 0; sqI < 81; sqI += 1) {
      const p = this.board[sqI];
      if (!p || sq === sqI || (c !== undefined && c !== p.color())) {
        continue;
      }
      const m = moveDefTable[p.pt2()];
      const frI = sq2fr(sqI);
      if (!frI) {
        continue;
      }
      let fl = false;
      if (m.just) {
        for (const frMD of m.just) {
          if (
            ((frI.f + frMD.f) as File) === f &&
            ((frI.r + frMD.r) as Rank) === r
          ) {
            res.push(sqI);
            fl = true;
            break;
          }
        }
      }
      if (!fl && m.fly) {
        for (const frMD of m.fly) {
          let fT = frI.f;
          let rT = frI.r;
          do {
            fT += frMD.f;
            rT += frMD.r;
            if (fT === f && rT === r) {
              res.push(sqI);
              fl = true;
              break;
            }
          } while (
            !(fT < 0 || fT > 8 || rT < 0 || rT > 8 || this.board[fr2sq(fT, rT)])
          );
          if (fl) {
            break;
          }
        }
      }
    }
    return res;
  }
  /**
   * c側の駒がsqに利きがあればtrue
   * @param {Square} sq
   * @param {Color} c
   * @returns {boolean}
   */
  effectedTo(sq: Square, c: Color): boolean {
    const fr = sq2fr(sq);
    if (!fr) {
      return false;
    }
    const f = fr.f;
    const r = fr.r;
    for (let sqI: Square = 0; sqI < 81; sqI += 1) {
      const p = this.board[sqI];
      if (!p || sq === sqI || c !== p.color()) {
        continue;
      }
      const m = moveDefTable[p.pt2()];
      const frI = sq2fr(sqI);
      if (!frI) {
        continue;
      }
      if (m.just) {
        for (const frMD of m.just) {
          if (
            ((frI.f + frMD.f) as File) === f &&
            ((frI.r + frMD.r) as Rank) === r
          ) {
            return true;
          }
        }
      }
      if (m.fly) {
        for (const frMD of m.fly) {
          let fT = frI.f;
          let rT = frI.r;
          do {
            fT += frMD.f;
            rT += frMD.r;
            if (fT === f && rT === r) {
              return true;
            }
          } while (
            !(
              fT < File.F1 ||
              fT > File.F9 ||
              rT < Rank.R1 ||
              rT > Rank.R9 ||
              this.board[fr2sq(fT, rT)]
            )
          );
        }
      }
    }
    return false;
  }
  /**
   * 手番側の玉に王手がかけられているかどうか
   * @returns {boolean}
   */
  check(): boolean {
    const ksq = this.kingSquare(this.turn);
    return ksq ? this.effectedTo(ksq, this.turn) : false;
  }
  /**
   * その地点に歩を打って二歩・打ち歩詰めならfalse
   * @param {Square} sq
   * @returns {boolean}
   */
  legalPawnDrop(sq: Square): boolean {
    throw "TODO: Implement Here";
  }
  /**
   * 合法手生成, recapSq は Recaptures, RecapturesAll専用
   * @param {GenMoveType} type
   * @param {Square | undefined} recapSq
   */
  genMove(type: GenMoveType, recapSq?: Square): Move[] {
    throw "TODO: Implement Here";
  }
}

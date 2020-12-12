import { Shogi, Color, Piece } from "shogi.js";
import { IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

// TypeScriptでの psfenw (PackedSfenWeb-base64url) エンコーダ/デコーダ実装例
// PHPでのデコーダ実装例は public/psfenw.php

/*

# packedsfen-web

- 256bit(32bytes)バイナリ列 or URL-safe文字列43bytes での将棋局面表現を想定した仕様案
  - URL-safe文字列エンコードはbase64url(padding無し)を用いる
- +着手の表現は +26bit(282bit,47文字)
- +手数の表現は
  - 0-31手:+6bit(288bit,48文字)
  - 32-1023手:+12bit(294bit,49文字)
  - 1024手-32767手:+18bit(300bit,50文字)
  - 32768手-1048575手:+24bit(306bit,51文字)
- Web局面図など、Web上での局面図交換用途を想定
- 部分図・詰将棋・駒落の局面の表現を考慮するため、やねうら王のバイナリ教師データ等で使われているpackedsfenとは非互換

- 参考
  - [やねうら王ブログ - 将棋の局面を256bitに圧縮するには？ - 2016年7月2日](http://yaneuraou.yaneu.com/2016/07/02/%E5%B0%86%E6%A3%8B%E3%81%AE%E5%B1%80%E9%9D%A2%E3%82%92256bit%E3%81%AB%E5%9C%A7%E7%B8%AE%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%EF%BC%9F/)
  - [github - yaneurao/YaneuraOu - source/extra/sfen_packer.cpp](https://github.com/yaneurao/YaneuraOu/blob/master/source/extra/sfen_packer.cpp)

## bit格納順

- 上位bit(MSB)から順に格納していく実装を採用
  - おそらく大差は無いが、固定ハフマン符号部のデコード処理が若干容易？
  - bitset, bitstream 等のライブラリでは下位bit(LSB)から格納していく場合が多そう?
  - ヘッダや拡張ビットは下位bit(LSB)から順に格納し、ハフマン符号部は上位bit(MSB)から順に格納していく圧縮方式も存在する 例: Deflate
    - [Mr.Kの資料室 - メモ・RFC1951伸長コード](http://mrkk.ciao.jp/dx11/rfc1951decode.html)
    - [futomi's CGI Cafe - RFC 1951 DEFLATE Compressed Data Format Specification version 1.3 日本語訳 - 3.1 全体的な規約](https://www.futomi.com/lecture/japanese/rfc1951.html#s3_1)
  - BASE64が以下のような区切りでバイナリデータ列からの変換を行う（MSBから順に近い）のに合わせたいという事情もある
    - 1byte目の上位6bit
    - 1byte目の下位2bit + 2byte目の上位4bit
    - 2byte目の下位4bit + 3byte目の上位2bit
    - 3byte目の下位6bit
  - 数値をハフマン符号にエンコードする際、LSBから順に格納していくハフマン符号を採用すると、元の数値をbit逆順に格納するエンコードをする破目になりそうだった
    - いろいろ考えていたら「ハフマン符号は可変長の固定or浮動小数点数の一種」みたいな認識が生えてしまったので、やっぱりハフマン符号は上位bit(MSB)から格納するのが自然に思えた

- byte00 ⇒ byte31 の順
- 上位bit(MSB) ⇒ 下位bit(LSB) の順 (やねうら王ではbit順逆)

## データ格納順

- 基本(256bit)
  - 手番(1bit)
  - 先手玉の位置(6-7bit, 通常7bit)
  - 後手玉の位置(6-7bit, 通常7bit)
    - (やねうら王では7bit固定、双玉のみ)
  - 盤面（玉以外）
  - 先手持駒
  - 後手持駒
  - 駒落（玉以外）
    - (やねうら王では駒落の考慮なし)
- 最終着手(20bit, optional)
- 手数(6-24bit, optional)

## bitパターン

- 1列目: bitパターン(bit,2進)
  - `?`: パラメータにより変動するbit
  - `x`: bit長の範囲外
- 2列目: デコード想定値域(hex,16進)
- 3列目: bit長
- 4列目: 備考・注釈

## 手番

- `0xxxxxxx`, `0x00`-`0x7f`, 1bit, 先手/下手/黒番 sente/sitate/black
- `1xxxxxxx`, `0x80`-`0xff`, 1bit, 後手/上手/白番 gote/uwate/white

## 玉の位置 x 2

- 先手玉 ⇒ 後手玉 の順
- 詰将棋局面などで片玉・玉無しの場合、盤の表現に1bit余分に必要になるため、玉の位置から1bitずつケチる

- `00?????x`, `0x00`-`0x3f`, 7bit, pos00-pos31
- `01?????x`, `0x40`-`0x7f`, 7bit, pos32-pos63
- `10?????x`, `0x80`-`0xbf`, 7bit, pos64-pos95(pos81-pos95:unused)
- `11????xx`, `0xc0`-`0xff`, 6bit, sp00-sp15(sp00-sp14:unused)(sp15:玉無し)

例:

- `0000000x`, `0x00`-`0x01`, 7bit, pos00
- `0000001x`, `0x02`-`0x03`, 7bit, pos01
- `0000010x`, `0x04`-`0x05`, 7bit, pos02
- ...
- `0011111x`, `0x3e`-`0x3f`, 7bit, pos31
- `0100000x`, `0x40`-`0x41`, 7bit, pos32
- `0100001x`, `0x42`-`0x43`, 7bit, pos33
- ...
- `0111111x`, `0x7e`-`0x7f`, 7bit, pos63
- `1000000x`, `0x80`-`0x81`, 7bit, pos64
- `1000001x`, `0x82`-`0x83`, 7bit, pos65
- ...
- `1010000x`, `0xa0`-`0xa1`, 7bit, pos80
- `1010001x`, `0xa2`-`0xa3`, 7bit, pos81(unused)
- ...
- `1011111x`, `0xbe`-`0xbf`, 7bit, pos95(unused)
- `110000xx`, `0xc0`-`0xc3`, 6bit, sp00(unused)
- `110001xx`, `0xc4`-`0xc7`, 6bit, sp01(unused)
- ...
- `111111xx`, `0xfc`-`0xff`, 6bit, sp15(玉無し)

### 玉の位置 file/rank <=> pos

- 縦型座標
- pos00,1a,１一 ⇒ ... ⇒ pos08,1i,１九 ⇒ pos09,2a,２一 ⇒ ... ⇒ pos80,9i,９九

```
 9  8  7  6  5  4  3  2  1
72 63 54 45 36 27 18 09 00 a 一
73 64 55 46 37 28 19 10 01 b 二
74 65 56 47 38 29 20 11 02 c 三
75 66 57 48 39 30 21 12 03 d 四
76 67 58 49 40 31 22 13 04 e 五
77 68 59 50 41 32 23 14 05 f 六
78 69 60 51 42 33 24 15 06 g 七
79 70 61 52 43 34 25 16 07 h 八
80 71 62 53 44 35 26 17 08 i 九
```

## 盤上の駒の位置（玉以外） x 79(双玉) ~ 81(玉無し)

- pos00 ⇒ pos80 の順
- 玉が存在するマスは飛ばす
- 金将のみ、成を示すbitは無い

- `0xxxxxxx`, `0x00`-`0x7f`, 0bit, 空
- `10??xxxx`, `0x80`-`0xbf`, 4bit, 歩+成+手番
- `1100??xx`, `0xc0`-`0xcf`, 6bit, 香+成+手番
- `1101??xx`, `0xd0`-`0xdf`, 6bit, 桂+成+手番
- `1110??xx`, `0xe0`-`0xef`, 6bit, 銀+成+手番
- `11110?xx`, `0xf0`-`0xf7`, 6bit, 金+手番
- `111110??`, `0xf8`-`0xfb`, 8bit, 角+成+手番
- `111111??`, `0xfc`-`0xff`, 8bit, 飛+成+手番

### 成・手番の例

- `1000xxxx`, `0x80`-`0x8f`, 4bit, 歩兵+先手
- `1001xxxx`, `0x90`-`0x9f`, 4bit, 歩兵+後手
- `1010xxxx`, `0xa0`-`0xaf`, 4bit, と金+先手
- `1011xxxx`, `0xb0`-`0xbf`, 4bit, と金+後手

## 持駒/駒落 x 0 ~ 38

- 先手持駒 ⇒ 後手持駒 ⇒ 駒落 の順
- 飛車 ⇒ 角行 ⇒ 金将 ⇒ 銀将 ⇒ 桂馬 ⇒ 香車 ⇒ 歩兵 の順
  - 駒落の駒も順番は同様、金将はbit配列上は後手のものを用いるが歩兵の後に回す事はしない
- 駒落の手番は基本的に先手成駒のbit配列を使う
- 駒落の金のみ、後手成銀のbit配列を用いる
- 後手成銀以外の後手成駒のbit配列は使用しない

- `00?xxxxx`, `0x00`-`0x3f`, 3bit, 歩+手番
- `010xxxxx`, `0x40`-`0x5f`, 3bit, 駒落・歩(と金先手)
- `011xxxxx`, `0x60`-`0x7f`, 3bit, (unused)(と金後手)
- `1000?xxx`, `0x80`-`0x8f`, 5bit, 香+手番
- `10010xxx`, `0x90`-`0x97`, 5bit, 駒落・香(成香先手)
- `10011xxx`, `0x98`-`0x9f`, 5bit, (unused)(成香後手)
- `1010?xxx`, `0xa0`-`0xaf`, 5bit, 桂+手番
- `10110xxx`, `0xb0`-`0xb7`, 5bit, 駒落・桂(成桂先手)
- `10111xxx`, `0xb8`-`0xbf`, 5bit, (unused)(成桂後手)
- `1100?xxx`, `0xc0`-`0xcf`, 5bit, 銀+手番
- `11010xxx`, `0xd0`-`0xd7`, 5bit, 駒落・銀(成銀先手)
- `11011xxx`, `0xd8`-`0xdf`, 5bit, 駒落・金(成銀後手)
- `1110?xxx`, `0xe0`-`0xef`, 5bit, 金+手番
- `111100?x`, `0xf0`-`0xf3`, 7bit, 角+手番
- `1111010x`, `0xf4`-`0xf5`, 7bit, 駒落・角(竜馬先手)
- `1111011x`, `0xf6`-`0xf7`, 7bit, (unused)(竜馬後手)
- `111110?x`, `0xf8`-`0xfb`, 7bit, 飛+手番
- `1111110x`, `0xfc`-`0xfd`, 7bit, 駒落・飛(龍王先手)
- `1111111x`, `0xfe`-`0xff`, 7bit, (unused)(龍王後手)

## move

最終着手、若しくは次の指し手（候補手など）のいずれかを強調表示するのに用いる。

1bit turn
7bit movefrom pos / hand
7bit moveto pos / hand
1bit promotion
1bit same
1bit unused
4bit relative
4bit capture piecetype

move none: all zero

turn
0 black
1 white

move position
000 - 080 pos00-80
081 - 087 unused
088 - 095 komabako (OU,FU,KY,KE,GI,KI,KA,HI)
096 - 103 black hand (OU,FU,KY,KE,GI,KI,KA,HI)
104 - 111 unused
112 - 119 white hand (OU,FU,KY,KE,GI,KI,KA,HI)
120 - 127 unused

088 OU
089 FU
090 KY
091 KE
092 GI
093 KI
094 KA
095 HI
096 +OU
097 +FU
098 +KY
099 +KE
100 +GI
101 +KI
102 +KA
103 +HI
112 -OU
113 -FU
114 -KY
115 -KE
116 -GI
117 -KI
118 -KA
119 -HI

promotion
0 none
1 promotion

same
0 none
1 same

relative
00 none
01 L / 左
02 C / 直
03 R / 右
04 M / 寄
05 LM / 左寄
06 H / 打 (同位置に動かせる同種駒がある紛らわしい場合の駒打ちのみ)
07 RM / 右寄
08 U / 上
09 LU / 左上
10 CU / 直上 (本将棋では使わない)
11 RU / 右上
12 D / 引
13 LD / 左引
14 CD / 直引 (本将棋では使わない)
15 RD / 右引

capture piece type
00 none
01 FU
02 KY
03 KE
04 GI
05 KI
06 KA
07 HI
08 OU
09 TO
10 NY
11 NK
12 NG
13 unused
14 UM
15 RY

### special move

(実装未定)

```
abnormal
chudan
fuzumi
illegal_action
illegal_kachi
illegal_move
jishogi
kachi
max_moves
sennichite
time_up
toryo
tsumi
uchifuzume
oute_kaihimore
oute_sennichite
outori
```

## ply

```
bit pattern                 : range-min (hex pattern)     - range-max (hex pattern)
0?????                      :     0 (0x00)                -      31 (0x1f)
100000                      :   NaN (0x20)                -     NaN (0x20)
1????? 0?????               :    32 (0x21 0x00)           -    1023 (0x3f 0x1f)
1????? 1????? 0?????        :  1024 (0x21 0x20 0x00)      -   32767 (0x3f 0x3f 0x1f)
1????? 1????? 1????? 0????? : 32768 (0x21 0x20 0x20 0x00) - 1048575 (0x3f 0x3f 0x3f 0x1f)
```

## base64url

- [RFC 4648 §5: Base 64 Encoding with URL and Filename Safe Alphabet](https://tools.ietf.org/html/rfc4648#section-5)
- [(ja) wikipedia: Base64](https://ja.wikipedia.org/wiki/Base64)
- [(en) wikipedia: Base64](https://en.wikipedia.org/wiki/Base64)

index62 に `-`, index63 に `_` をそれぞれ使い、
padding文字 `=` は使用しない実装を予定。

### base64url index table (excerpt)

- Index(10), Binary(2), Char
- `00`, `000000`, `A`
- `01`, `000001`, `B`
- ...
- `25`, `011001`, `Z`
- `26`, `011010`, `a`
- `27`, `011011`, `b`
- ...
- `51`, `110011`, `z`
- `52`, `110100`, `0`
- `53`, `110101`, `1`
- ...
- `61`, `111101`, `9`
- `62`, `111110`, `-` ( standard base64では `+` )
- `63`, `111111`, `_` ( standard base64では `/` )

- `**`, `padding`, `=` ( optional )

## examples

- 平手 初期局面
  sfen: `lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1`
  move: `none`
  psfenw-b64u: `LEmKRDDX5kR-acpEOPUiHiRD1Ih5ykQ41_ZEfGmKRDA`
- 電竜戦 第3回予行演習 2回戦☗ほっしーdolphinタッグ-☖Viper 終局図
  csa: https://golan.sakura.ne.jp/denryusen/dr1_test3/kifufiles/dr1t3t1+sg-2_hosshii_viper-300-2F+hosshii+viper+20200905203344.csa
  kifu: https://golan.sakura.ne.jp/denryusen/dr1_test3/dist/denryusen_single.html#dr1t3t1+sg-2_hosshii_viper-300-2F+hosshii+viper+20200905203344
  sfen: `1+B1k1G3/4PLL1K/+NGGSSSB+R+P/1NN+RN4/9/P3S4/1G1P5/9/L7L w 14P 1`
  move: `177☗８一角成`
  psfenw-b64u: `gVqgYH8Aw-APMOAEcaOA4_iA80B9PNDwNiDAAAAAAABJfwAlR`
- 電竜戦 第3回予行演習 10回戦☗Daig振り飛車-☖ほっしーdolphinタッグ 終局図
  csa: https://golan.sakura.ne.jp/denryusen/dr1_test3/kifufiles/dr1t3t1+sg-10_daigorilla_hosshii-300-2F+daigorilla+hosshii+20200906000224.csa
  kifu: https://golan.sakura.ne.jp/denryusen/dr1_test3/dist/denryusen_single.html#dr1t3t1+sg-10_daigorilla_hosshii-300-2F+daigorilla+hosshii+20200906000224
  sfen: `9/9/9/9/9/9/2k6/1r7/K8 b r2b4g4s4n4l18p 1`
  move: `346☖８八飛不成`
  psfenw-b64u: `UHgAAAAAAAAAAA_QB98-e973Oc5rWtYxjEkkkkkkkkm9jACqa`
- 電竜戦 第4回予行演習2部 23回戦☗Sylwi-☖ほっしー水匠タッグ 終局図
  csa: https://golan.sakura.ne.jp/denryusen/dr1_test4a/kifufiles/dr1t4+snc-23_sylwi_hosshii-300-2F+sylwi+hosshii+20201025090721.csa
  kifu: https://golan.sakura.ne.jp/denryusen/dr1_test4a/dist/denryusen_single.html#dr1t4+snc-23_sylwi_hosshii-300-2F+sylwi+hosshii+20201025090721
  sfen: `lr5nl/3sk1+S2/p2P1ps2/3Sp1p1p/PP1p1P1P1/1G4P1P/1K2P1N2/5G3/+bN1R4L w 2G2Pbnl2p 1`
  move: `115☗６三歩`
  psfenw-b64u: `xUuJKDDUQDrmUaBKDwSQOY4kfgA_RHjTFKB984B5rElhXgAjT`
- 電竜戦 第4回予行演習2部 25回戦☗ほっしー水匠タッグ-☖スーパーうさぴょん2X 208手目
  csa: https://golan.sakura.ne.jp/denryusen/dr1_test4a/kifufiles/dr1t4+snc-25_hosshii_superusa2x-300-2F+hosshii+superusa2x+20201025100533.csa
  kifu: https://golan.sakura.ne.jp/denryusen/dr1_test4a/dist/denryusen_single.html#dr1t4+snc-25_hosshii_superusa2x-300-2F+hosshii+superusa2x+20201025100533
  sfen: `5+RpG1/sp6K/ksn4G1/p1spp4/2p3+B1p/1GP+BP4/P4P3/3+n5/LN6L b RGSN2LP6p 1`
  move: `208☖８三銀左上`
  psfenw-b64u: `AZQkYePAJH0H8CASgCX03GvMwE8nho5khh85ikIAkkm3giQmQ`

*/

// 1語8ビット長以下のハフマン符号列を扱うクラス
export class Huffman {
  public data: number[];
  public length: number;
  // 初期化
  constructor(data: number[] = [], length = 0) {
    this.data = data;
    this.length = length;
  }
  // ハフマン符号追加
  add(v: number, l: number): void {
    const q = this.length >>> 3;
    const r = this.length & 7;
    const x =
      ((v & [0x00, 0x80, 0xc0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe, 0xff][l]) << 8) >>>
      r;
    this.data[q + 0] |= x >>> 8;
    this.data[q + 1] |= x & 255;
    this.length += l;
  }
  // Base64URL文字列インポート
  static fromB64(b64: string): Huffman {
    const r = new Huffman();
    Array.from(b64, (c) =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(
        c
      )
    )
      .filter((v) => v >= 0)
      .forEach((v) => {
        r.add(v << 2, 6);
      });
    return r;
  }
  // Base64URL文字列に変換（パディング無し）
  toB64(): string {
    return Array.from(
      { length: Math.ceil(this.length / 6) },
      (_, i) =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[
          (((this.data[(i * 6) >>> 3] << 8) |
            (this.data[((i * 6) >>> 3) + 1] | 0)) >>>
            (10 - ((i * 6) & 7))) &
            63
        ]
    ).join("");
  }
  // Uint8Arrayに変換
  toU8(): Uint8Array {
    return Uint8Array.from(this.data);
  }
  // 指定ビット数位置から8bit数を切り出し
  getByteValue(i: number): number {
    return (
      (((this.data[i >>> 3] << 8) | this.data[(i >>> 3) + 1]) >>>
        (8 - (i & 7))) &
      255
    );
  }
  // 現在のビット長
  getBitLength(): number {
    return this.length;
  }
}

const posFR = Array.from({ length: 81 }, (_, i) => ({
  i,
  f: (i / 9) | 0,
  r: i % 9,
}));
// 玉位置
const tHuffmanKingPos = Array.from({ length: 81 }, (_, i) => ({
  i,
  f: (i / 9) | 0,
  r: i % 9,
  v: i << 1,
  l: 7,
}));
const tHuffmanKingNone = { i: -1, f: -1, r: -1, v: 0xfc, l: 6 };
// 盤上駒
const tHuffmanPiece = [0, 1].map((c) =>
  [
    { q: "FU", u: "FU", r: 0, _v: 0x80, l: 4 },
    { q: "TO", u: "FU", r: 1, _v: 0xa0, l: 4 },
    { q: "KY", u: "KY", r: 0, _v: 0xc0, l: 6 },
    { q: "NY", u: "KY", r: 1, _v: 0xc8, l: 6 },
    { q: "KE", u: "KE", r: 0, _v: 0xd0, l: 6 },
    { q: "NK", u: "KE", r: 1, _v: 0xd8, l: 6 },
    { q: "GI", u: "GI", r: 0, _v: 0xe0, l: 6 },
    { q: "NG", u: "GI", r: 1, _v: 0xe8, l: 6 },
    { q: "KI", u: "KI", r: 0, _v: 0xf0, l: 6 },
    { q: "KA", u: "KA", r: 0, _v: 0xf8, l: 8 },
    { q: "UM", u: "KA", r: 1, _v: 0xfa, l: 8 },
    { q: "HI", u: "HI", r: 0, _v: 0xfc, l: 8 },
    { q: "RY", u: "HI", r: 1, _v: 0xfe, l: 8 },
  ].reduce((p, e) => {
    p[e.q] = { ...e, c, v: e._v | (c << (8 - e.l)) };
    return p;
  }, {} as { [kind: string]: { q: string; u: string; r: number; l: number; c: Color; v: number } })
);
// 持駒
const tHuffmanHand = [0, 1].map((c) =>
  [
    { q: "FU", u: "FU", r: 0, _v: 0x00, l: 3 },
    { q: "TO", u: "FU", r: 1, _v: 0x40, l: 3 },
    { q: "KY", u: "KY", r: 0, _v: 0x80, l: 5 },
    { q: "NY", u: "KY", r: 1, _v: 0x90, l: 5 },
    { q: "KE", u: "KE", r: 0, _v: 0xa0, l: 5 },
    { q: "NK", u: "KE", r: 1, _v: 0xb0, l: 5 },
    { q: "GI", u: "GI", r: 0, _v: 0xc0, l: 5 },
    { q: "NG", u: "GI", r: 1, _v: 0xd0, l: 5 },
    { q: "KI", u: "KI", r: 0, _v: 0xe0, l: 5 },
    { q: "KA", u: "KA", r: 0, _v: 0xf0, l: 7 },
    { q: "UM", u: "KA", r: 1, _v: 0xf4, l: 7 },
    { q: "HI", u: "HI", r: 0, _v: 0xf8, l: 7 },
    { q: "RY", u: "HI", r: 1, _v: 0xfc, l: 7 },
  ].reduce((p, e) => {
    p[e.q] = { ...e, c, v: e._v | (c << (8 - e.l)) };
    return p;
  }, {} as { [kind: string]: { q: string; u: string; r: number; l: number; c: Color; v: number } })
);
// 駒箱
const tHuffmanBox: {
  [kind: string]: {
    q: string;
    u: string;
    r: number;
    l: number;
    c: Color;
    v: number;
  };
} = {
  FU: { q: "TO", u: "FU", r: 1, l: 3, c: 0, v: 0x40 },
  KY: { q: "NY", u: "KY", r: 1, l: 5, c: 0, v: 0x90 },
  KE: { q: "NK", u: "KE", r: 1, l: 5, c: 0, v: 0xb0 },
  GI: { q: "NG", u: "GI", r: 1, l: 5, c: 0, v: 0xd0 },
  KI: { q: "NG", u: "GI", r: 1, l: 5, c: 1, v: 0xd8 },
  KA: { q: "UM", u: "KA", r: 1, l: 5, c: 0, v: 0xf4 },
  HI: { q: "RY", u: "HI", r: 1, l: 7, c: 0, v: 0xfc },
};

// 持駒・駒箱の駒処理順
const pOrder = ["HI", "KA", "KI", "GI", "KE", "KY", "FU"];

// packedsfenweb
export const toPackedSfenWeb = (
  shogi: Shogi,
  move?: IMoveMoveFormat,
  tesuu = NaN
): Huffman => {
  const h = new Huffman();
  const pieces = posFR.map((v) => ({ ...v, p: shogi.board[v.f][v.r] }));
  // 手番
  h.add(shogi.turn === Color.Black ? 0x00 : 0x80, 1);
  // 玉位置
  [Color.Black, Color.White].forEach((c) => {
    const king = pieces.reduce(
      (p, _, i) =>
        _.p?.color === c && _.p?.kind === "OU" ? tHuffmanKingPos[i] : p,
      tHuffmanKingNone
    );
    h.add(king.v, king.l);
  });
  // 盤上の駒
  pieces.forEach(({ p }) => {
    if (!p?.kind) {
      h.add(0, 1);
    } else if (p?.kind !== "OU") {
      const pHuf = tHuffmanPiece[p?.color][p?.kind];
      h.add(pHuf.v, pHuf.l);
    }
  });
  // 持駒
  const hands = [Color.Black, Color.White].map((c) => shogi.getHandsSummary(c));
  hands.forEach((hand, c) => {
    pOrder.forEach((kind) => {
      Array.from({ length: hand[kind] }).forEach(() => {
        const pHuf = tHuffmanHand[c][kind];
        h.add(pHuf.v, pHuf.l);
      });
    });
  });
  // 駒箱カウントダウン
  const remain: { [kind: string]: number } = {
    OU: 2,
    HI: 2,
    KA: 2,
    KI: 4,
    GI: 4,
    KE: 4,
    KY: 4,
    FU: 18,
  };
  pieces.forEach(({ p }) => {
    if (p?.kind) {
      remain[Piece.unpromote(p?.kind)] -= 1;
    }
  });
  hands.forEach((hand) => {
    Object.entries(hand).forEach(([kind, num]) => {
      remain[kind] -= num;
    });
  });
  // 駒箱出力
  pOrder.forEach((kind) => {
    Array.from({ length: remain[kind] }).forEach(() => {
      const pHuf = tHuffmanBox[kind];
      h.add(pHuf.v, pHuf.l);
    });
  });
  // ビット長チェック
  if (h.getBitLength() !== 256) {
    throw `encoding invalid bitpos:${h.getBitLength()}`;
  }
  // 指し手出力
  if (move) {
    h.add(move.color === Color.Black ? 0 : 128, 1);
    h.add(
      move.from
        ? (move.from.x - 1) * 18 + (move.from.y - 1) * 2
        : ({ OU: 0, FU: 2, KY: 4, KE: 6, GI: 8, KI: 10, KA: 12, HI: 14 } as {
            [kind: string]: number;
          })[Piece.unpromote(move.piece)] +
            (move.color << 5) +
            192,
      7
    );
    h.add(
      move.to
        ? (move.to.x - 1) * 18 + (move.to.y - 1) * 2
        : ({ OU: 0, FU: 2, KY: 4, KE: 6, GI: 8, KI: 10, KA: 12, HI: 14 } as {
            [kind: string]: number;
          })[Piece.unpromote(move.piece)] +
            (move.color << 5) +
            192,
      7
    );
    h.add(move.promote ? 128 : 0, 1);
    h.add(move.same ? 128 : 0, 1);
    h.add(0, 1);
    h.add(
      move.relative
        ? ({
            L: 16,
            C: 32,
            R: 48,
            M: 64,
            LM: 80,
            H: 96,
            RM: 112,
            U: 128,
            LU: 144,
            CU: 160,
            RU: 176,
            D: 192,
            LD: 208,
            CD: 224,
            RD: 240,
          } as { [rel: string]: number })[move.relative]
        : 0,
      4
    );
    h.add(
      move.capture
        ? ({
            FU: 16,
            KY: 32,
            KE: 48,
            GI: 64,
            KI: 80,
            KA: 96,
            HI: 112,
            OU: 128,
            TO: 144,
            NY: 160,
            NK: 176,
            NG: 192,
            UM: 224,
            RY: 240,
          } as { [kind: string]: number })[move.capture]
        : 0,
      4
    );
    // 手数出力
    if (!isNaN(tesuu)) {
      for (let j = 6; j >= 0; j -= 1) {
        if (tesuu >>> (j * 5) > 0 || j === 0) {
          for (let i = j; i >= 0; i -= 1) {
            h.add(i > 0 ? 128 : 0, 1);
            h.add((tesuu >>> (i * 5)) << 3, 5);
          }
          break;
        }
      }
    }
  }
  // 返り値
  return h;
};

// ハフマン符号デコード表・手番
const tDeHuffmanColor = [
  ...Array.from({ length: 256 }).map((_, i) => ({ j: i >> 7, l: 1 })),
].map((e, i) => Object.assign({ i }, e));

// ハフマン符号デコード表・玉位置
const tDeHuffmanKing = [
  ...Array.from({ length: 192 }).map((_, i) => ({
    j: i >> 1,
    f: ((i >> 1) / 9) | 0,
    r: (i >> 1) % 9,
    l: 7,
  })),
  ...Array.from({ length: 64 }).map(() => ({ j: -1, f: -1, r: -1, l: 6 })),
].map((e, i) => Object.assign({ i }, e));

// ハフマン符号デコード表・盤上駒
const tDeHuffmanPiece = [
  ...Array.from({ length: 128 }).map(() => ({
    c: -1,
    q: "**",
    u: "**",
    r: -1,
    p: "***",
    l: 1,
  })),
  ...[
    {
      l: 4,
      s: 64,
      q: ["FU", "TO"],
      u: ["FU", "FU"],
      r: [0, 1],
    },
    {
      l: 6,
      s: 56,
      q: ["KY", "NY", "KE", "NK", "GI", "NG", "KI"],
      u: ["KY", "KY", "KE", "KE", "GI", "GI", "KI"],
      r: [0, 1, 0, 1, 0, 1, 0],
    },
    {
      l: 8,
      s: 8,
      q: ["KA", "UM", "HI", "RY"],
      u: ["KA", "KA", "HI", "HI"],
      r: [0, 1, 0, 1],
    },
  ]
    .map((o) =>
      Array.from({ length: o.s }).map((_, i) => ({
        c: (i >> (8 - o.l)) & 1,
        q: o.q[i >> (9 - o.l)],
        u: o.u[i >> (9 - o.l)],
        r: o.r[i >> (9 - o.l)],
        p: `${(i >> (8 - o.l)) & 1}${o.q[i >> (9 - o.l)]}`,
        l: o.l,
      }))
    )
    .reduce((p, c) => [...p, ...c]),
].map((e, i) => Object.assign({ i }, e));

// ハフマン符号デコード表・持駒・駒箱
const tDeHuffmanHand = [
  {
    l: 3,
    s: 128,
    q: ["FU", "TO"],
    u: ["FU", "FU"],
    r: [0, 1],
  },
  {
    l: 5,
    s: 112,
    q: ["KY", "NY", "KE", "NK", "GI", "NG", "KI"],
    u: ["KY", "KY", "KE", "KE", "GI", "GI", "KI"],
    r: [0, 1, 0, 1, 0, 1, 0],
  },
  {
    l: 7,
    s: 16,
    q: ["KA", "UM", "HI", "RY"],
    u: ["KA", "KA", "HI", "HI"],
    r: [0, 1, 0, 1],
  },
]
  .map((o) =>
    Array.from({ length: o.s }).map((_, i) => ({
      c: (i >> (8 - o.l)) & 1,
      q: o.q[i >> (9 - o.l)],
      u: o.u[i >> (9 - o.l)],
      r: o.r[i >> (9 - o.l)],
      p: `${(i >> (8 - o.l)) & 1}${o.q[i >> (9 - o.l)]}`,
      l: o.l,
    }))
  )
  .reduce((p, c) => [...p, ...c])
  .map((e, i) => Object.assign({ i }, e));

// PackedSfenWebのデコード
export const fromPackedSfenWeb = (
  h: Huffman
): { shogi: Shogi; move?: IMoveMoveFormat; tesuu: number } => {
  const data: {
    color: Color;
    board: {
      color?: Color;
      kind?: string;
    }[][];
    hands: {
      [index: string]: number;
    }[];
  } = {
    color: Color.Black,
    board: Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => ({}))
    ),
    hands: Array.from({ length: 2 }, () => ({
      HI: 0,
      KA: 0,
      KI: 0,
      GI: 0,
      KE: 0,
      KY: 0,
      FU: 0,
    })),
  };
  let bitpos = 0;
  // 手番デコード
  {
    const dec = tDeHuffmanColor[h.getByteValue(bitpos)];
    data.color = dec.j;
    bitpos += dec.l;
  }
  // 玉位置デコード
  [Color.Black, Color.White].forEach((color) => {
    const dec = tDeHuffmanKing[h.getByteValue(bitpos)];
    if (dec.j >= 0) {
      data.board[dec.f][dec.r] = { color, kind: "OU" };
    }
    bitpos += dec.l;
  });
  // 盤上駒デコード
  posFR.forEach((pos) => {
    if (data.board[pos.f][pos.r]?.kind !== "OU") {
      const dec = tDeHuffmanPiece[h.getByteValue(bitpos)];
      if (dec.c >= 0) {
        data.board[pos.f][pos.r] = { color: dec.c, kind: dec.q };
      }
      bitpos += dec.l;
    }
  });
  // 持駒・駒箱デコード
  while (bitpos < 256) {
    const dec = tDeHuffmanHand[h.getByteValue(bitpos)];
    if (dec.r === 0) {
      data.hands[dec.c][dec.q] += 1;
    } else {
      if (dec.c === 0 || dec.q === "NG") {
        //
      } else {
        throw `invalid hand/piecebox color:${dec.c} kind:${dec.q}`;
      }
    }
    bitpos += dec.l;
  }
  // ビット長チェック
  if (bitpos !== 256) {
    throw `decoding invalid bitpos:${bitpos}`;
  }
  // 指し手
  const move: IMoveMoveFormat = {
    color: Color.Black,
    piece: "",
  };
  if (h.getBitLength() >= bitpos + 26) {
    move.color = h.getByteValue(bitpos) < 0x80 ? Color.Black : Color.White;
    const mFrom = h.getByteValue(bitpos) & 0x7f;
    const mTo = h.getByteValue(bitpos + 7) & 0x7f;
    move.promote = (h.getByteValue(bitpos + 8) & 1) === 1 || undefined;
    if (mFrom !== mTo) {
      if (mTo < 81) {
        move.to = { x: (mTo / 9 + 1) | 0, y: (mTo % 9) + 1 };
        const pTo = data.board[(mTo / 9) | 0][mTo % 9];
        if (pTo?.kind) {
          move.piece = move.promote ? Piece.unpromote(pTo.kind) : pTo.kind;
        }
      } else {
        move.piece = ["OU", "FU", "KY", "KE", "GI", "KI", "KA", "HI"][mTo & 7];
      }
      if (mFrom < 81) {
        move.from = { x: (mFrom / 9 + 1) | 0, y: (mFrom % 9) + 1 };
        const pFrom = data.board[(mFrom / 9) | 0][mFrom % 9];
        if (pFrom?.kind) {
          move.piece = pFrom.kind;
        }
      } else {
        move.piece = ["OU", "FU", "KY", "KE", "GI", "KI", "KA", "HI"][
          mFrom & 7
        ];
      }
    }
    move.same = (h.getByteValue(bitpos + 9) & 1) === 1 || undefined;
    move.relative = [
      undefined,
      "L",
      "C",
      "R",
      "M",
      "LM",
      "H",
      "RM",
      "U",
      "LU",
      "CU",
      "RU",
      "D",
      "LD",
      "CD",
      "RD",
    ][h.getByteValue(bitpos + 14) & 15];
    move.capture = [
      undefined,
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
      undefined,
      "UM",
      "RY",
    ][h.getByteValue(bitpos + 18) & 15];
    bitpos += 26;
  }
  // 手数
  let tesuu = NaN;
  if (h.getBitLength() >= bitpos + 6 && h.getByteValue(bitpos) >>> 2 !== 32) {
    tesuu = 0;
    while (h.getBitLength() >= bitpos + 6) {
      const sByte = h.getByteValue(bitpos);
      tesuu += (sByte & 0x7c) >>> 2;
      if (sByte >= 0x80) {
        tesuu = tesuu << 5;
      }
      bitpos += 6;
    }
  }
  // 出力
  return {
    shogi: new Shogi({
      preset: "OTHER",
      data,
    }),
    move: move.piece ? move : undefined,
    tesuu,
  };
};

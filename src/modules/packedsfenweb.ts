const huf = {
  encode: {
    color: [
      { i: 0, v: 0x00, l: 1 },
      { i: 1, v: 0x80, l: 1 },
    ],
    king: [
      ...Array.from({ length: 81 }).map((_, i) => ({
        i,
        f: (i / 9) | 0,
        r: i % 9,
        v: i << 1,
        l: 7,
      })),
      { i: -1, f: -1, r: -1, v: 0xfc, l: 6 },
    ],
    piece: [
      { q: "**", u: "**", r: -1, v: 0x00, l: 1, p: "***", c: -1 },
      ...[
        { q: "FU", u: "FU", r: 0, v: 0x80, l: 4 },
        { q: "TO", u: "FU", r: 1, v: 0xa0, l: 4 },
        { q: "KY", u: "KY", r: 0, v: 0xc0, l: 6 },
        { q: "NY", u: "KY", r: 1, v: 0xc8, l: 6 },
        { q: "KE", u: "KE", r: 0, v: 0xd0, l: 6 },
        { q: "NK", u: "KE", r: 1, v: 0xd8, l: 6 },
        { q: "GI", u: "GI", r: 0, v: 0xe0, l: 6 },
        { q: "NG", u: "GI", r: 1, v: 0xe8, l: 6 },
        { q: "KI", u: "KI", r: 0, v: 0xf0, l: 6 },
        { q: "KA", u: "KA", r: 0, v: 0xf8, l: 8 },
        { q: "UM", u: "KA", r: 1, v: 0xfa, l: 8 },
        { q: "HI", u: "HI", r: 0, v: 0xfc, l: 8 },
        { q: "RY", u: "HI", r: 1, v: 0xfe, l: 8 },
      ]
        .map((b) =>
          [0, 1].map((i) =>
            Object.assign({}, b, {
              p: `${i}${b.q}`,
              c: i,
              v: b.v | (i << (8 - b.l)),
            })
          )
        )
        .reduce((p, c) => [...p, ...c]),
    ],
    hand: [
      { q: "FU", u: "FU", r: 0, v: 0x00, l: 3 },
      { q: "TO", u: "FU", r: 1, v: 0x40, l: 3 },
      { q: "KY", u: "KY", r: 0, v: 0x80, l: 5 },
      { q: "NY", u: "KY", r: 1, v: 0x90, l: 5 },
      { q: "KE", u: "KE", r: 0, v: 0xa0, l: 5 },
      { q: "NK", u: "KE", r: 1, v: 0xb0, l: 5 },
      { q: "GI", u: "GI", r: 0, v: 0xc0, l: 5 },
      { q: "NG", u: "GI", r: 1, v: 0xd0, l: 5 },
      { q: "KI", u: "KI", r: 0, v: 0xe0, l: 5 },
      { q: "KA", u: "KA", r: 0, v: 0xf0, l: 7 },
      { q: "UM", u: "KA", r: 1, v: 0xf4, l: 7 },
      { q: "HI", u: "HI", r: 0, v: 0xf8, l: 7 },
      { q: "RY", u: "HI", r: 1, v: 0xfc, l: 7 },
    ]
      .map((b) =>
        [0, 1].map((i) =>
          Object.assign({}, b, {
            p: `${i}${b.q}`,
            c: i,
            v: b.v | (i << (8 - b.l)),
          })
        )
      )
      .reduce((p, c) => [...p, ...c]),
  },
  decode: {
    color: [
      ...Array.from({ length: 256 }).map((_, i) => ({ j: i >> 7, l: 1 })),
    ].map((e, i) => Object.assign({ i }, e)),
    king: [
      ...Array.from({ length: 192 }).map((_, i) => ({
        j: i >> 1,
        f: ((i >> 1) / 9) | 0,
        r: (i >> 1) % 9,
        l: 7,
      })),
      ...Array.from({ length: 64 }).map(() => ({ j: -1, f: -1, r: -1, l: 6 })),
    ].map((e, i) => Object.assign({ i }, e)),
    piece: [
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
    ].map((e, i) => Object.assign({ i }, e)),
    hand: [
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
      .map((e, i) => Object.assign({ i }, e)),
  },
};

console.log(
  JSON.stringify(huf, undefined, 1)
    .replace(/^ +/gm, (match) => match.replace(/ /g, "\t"))
    .replace(
      /{\n(?:\s+(?:[\w.-]|"[^"]+"): (?:[\w.-]+|"[^"]+"),?\n)+\s+}/g,
      (match) => match.replace(/\n\s+/g, " ")
    )
);

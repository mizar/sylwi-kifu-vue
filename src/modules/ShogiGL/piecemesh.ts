import * as BABYLON from "@babylonjs/core";
import * as Shogi from "./shogi";
import { assign } from "./assign";

export interface IPieceParam {
  type: string;
  height: number;
  width: number;
  thick: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  scale: number;
}
export interface IPieceGeo {
  type: string;
  height: number;
  width: number;
  thick: number;
  alpha: number;
  beta: number;
  gamma: number;
  sinAlpha: number;
  sinBeta: number;
  sinGamma: number;
  cosAlpha: number;
  cosBeta: number;
  cosGamma: number;
  tanAlpha: number;
  tanBeta: number;
  tanGamma: number;
  hheight: number;
  hwidth: number;
  hthick: number;
  hfacevert: number;
  facevert: number;
  sholl: number;
  sholw: number;
  sholh: number;
  sidel: number;
  sidew: number;
  sideh: number;
  hsholt: number;
  sholt: number;
  hheadt: number;
  headt: number;
  sholy: number;
  perpe: number;
  radius: number;
}

export function createPieceGeo(param: IPieceParam): IPieceGeo {
  const type = param.type;
  const height = param.height * param.scale;
  const width = param.width * param.scale;
  const thick = param.thick * param.scale;
  const alpha = param.alpha || (18 * Math.PI) / 180;
  const sinAlpha = Math.sin(alpha);
  const cosAlpha = Math.cos(alpha);
  const tanAlpha = Math.tan(alpha);
  const beta = param.beta || (9 * Math.PI) / 180;
  const sinBeta = Math.sin(beta);
  const cosBeta = Math.cos(beta);
  const tanBeta = Math.tan(beta);
  const gamma = param.gamma || (4.5 * Math.PI) / 180;
  const sinGamma = Math.sin(gamma);
  const cosGamma = Math.cos(gamma);
  const tanGamma = Math.tan(gamma);
  const hheight = 0.5 * height;
  const hwidth = 0.5 * width;
  const hthick = 0.5 * thick;
  const hfacevert = hheight / cosGamma;
  const facevert = height / cosGamma;
  const sholl = (hwidth - height * tanBeta) / (cosAlpha - sinAlpha * tanBeta);
  const sholw = sholl * cosAlpha;
  const sholh = sholl * sinAlpha;
  const sidel = (height - hwidth * tanAlpha) / (cosBeta - sinBeta * tanAlpha);
  const sidew = sidel * sinBeta;
  const sideh = sidel * cosBeta;
  const hsholt = hthick - sideh * tanGamma;
  const sholt = 2 * hsholt;
  const hheadt = hthick - height * tanGamma;
  const headt = 2 * hheadt;
  const sholy = hheight - sholh;
  const perpe = hthick * cosGamma - hheight * sinGamma;
  const radius = Math.sqrt(
    hwidth * hwidth + hheight * hheight + hthick * hthick
  );
  return {
    type,
    height,
    width,
    thick,
    alpha,
    beta,
    gamma,
    sinAlpha,
    sinBeta,
    sinGamma,
    cosAlpha,
    cosBeta,
    cosGamma,
    tanAlpha,
    tanBeta,
    tanGamma,
    hheight,
    hwidth,
    hthick,
    hfacevert,
    facevert,
    sholl,
    sholw,
    sholh,
    sidel,
    sidew,
    sideh,
    hsholt,
    sholt,
    hheadt,
    headt,
    sholy,
    perpe,
    radius,
  };
}

export const pieceScale = 10;
export const scaleY = (23 / 594) * pieceScale;
export const pieceGeoSet: { [type: string]: IPieceGeo } = {
  k: createPieceGeo({
    type: "k",
    height: 0.825,
    width: 0.741,
    thick: 0.251,
    scale: scaleY,
  }),
  j: createPieceGeo({
    type: "j",
    height: 0.825,
    width: 0.741,
    thick: 0.251,
    scale: scaleY,
  }),
  r: createPieceGeo({
    type: "r",
    height: 0.8,
    width: 0.715,
    thick: 0.24,
    scale: scaleY,
  }),
  b: createPieceGeo({
    type: "b",
    height: 0.8,
    width: 0.715,
    thick: 0.24,
    scale: scaleY,
  }),
  g: createPieceGeo({
    type: "g",
    height: 0.775,
    width: 0.69,
    thick: 0.227,
    scale: scaleY,
  }),
  s: createPieceGeo({
    type: "s",
    height: 0.775,
    width: 0.69,
    thick: 0.227,
    scale: scaleY,
  }),
  n: createPieceGeo({
    type: "n",
    height: 0.75,
    width: 0.659,
    thick: 0.214,
    scale: scaleY,
  }),
  l: createPieceGeo({
    type: "l",
    height: 0.725,
    width: 0.607,
    thick: 0.207,
    scale: scaleY,
  }),
  p: createPieceGeo({
    type: "p",
    height: 0.7,
    width: 0.581,
    thick: 0.2,
    scale: scaleY,
  }),
};

const uvScale = Array.from("kjplnsgbr", (c) => {
  const geo = pieceGeoSet[c];
  return Math.min(
    18 / geo.thick,
    48 / geo.sidel,
    23 / geo.sholl,
    48 / geo.width,
    58 / geo.facevert
  );
}).reduce((p, c) => Math.min(p, c));

export function getPieceVertex(geo: IPieceGeo): BABYLON.VertexData {
  const tstr = "kjplnsgbr";
  const tidx = tstr.indexOf(geo.type);
  if (!(tidx >= 0)) throw "unknown type";
  const positions = [
    // fore face
    0,
    +geo.hheadt,
    +geo.hheight,
    -geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    -geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    +geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    +geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    // back face
    0,
    -geo.hheadt,
    +geo.hheight,
    +geo.sholw,
    -geo.hsholt,
    +geo.sholy,
    +geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    -geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    -geo.sholw,
    -geo.hsholt,
    +geo.sholy,
    // bottom face
    -geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    -geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    +geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    +geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    // side face left
    -geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    -geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    -geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    -geo.sholw,
    -geo.hsholt,
    +geo.sholy,
    // side face right
    +geo.hwidth,
    +geo.hthick,
    -geo.hheight,
    +geo.hwidth,
    -geo.hthick,
    -geo.hheight,
    +geo.sholw,
    -geo.hsholt,
    +geo.sholy,
    +geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    // sholder face left
    0,
    +geo.hheadt,
    +geo.hheight,
    0,
    -geo.hheadt,
    +geo.hheight,
    -geo.sholw,
    -geo.hsholt,
    +geo.sholy,
    -geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    // sholder face right
    0,
    -geo.hheadt,
    +geo.hheight,
    0,
    +geo.hheadt,
    +geo.hheight,
    +geo.sholw,
    +geo.hsholt,
    +geo.sholy,
    +geo.sholw,
    -geo.hsholt,
    +geo.sholy,
  ];
  const indices = [
    // fore face
    0,
    1,
    4,
    1,
    2,
    3,
    1,
    3,
    4,
    // back face
    5,
    6,
    9,
    6,
    7,
    8,
    6,
    8,
    9,
    // bottom face
    10,
    11,
    12,
    10,
    12,
    13,
    // side face
    14,
    15,
    16,
    14,
    16,
    17,
    // side face
    18,
    19,
    20,
    18,
    20,
    21,
    // sholder face
    22,
    23,
    24,
    22,
    24,
    25,
    // sholder face
    26,
    27,
    28,
    26,
    28,
    29,
  ];

  const normals: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);

  const uvs: number[] = [];
  [
    {
      // 表面
      dx: 25,
      dy: 99,
      points: [
        { x: 0, y: -geo.facevert },
        { x: -geo.sholw, y: -geo.sideh / geo.cosGamma },
        { x: -geo.hwidth, y: 0 },
        { x: +geo.hwidth, y: 0 },
        { x: +geo.sholw, y: -geo.sideh / geo.cosGamma },
      ],
    },
    {
      // 裏面
      dx: 75,
      dy: 99,
      points: [
        { x: 0, y: -geo.facevert },
        { x: -geo.sholw, y: -geo.sideh / geo.cosGamma },
        { x: -geo.hwidth, y: 0 },
        { x: +geo.hwidth, y: 0 },
        { x: +geo.sholw, y: -geo.sideh / geo.cosGamma },
      ],
    },
    {
      // 底面
      dx: 25,
      dy: 30,
      points: [
        { x: -geo.hwidth, y: -geo.hthick },
        { x: -geo.hwidth, y: +geo.hthick },
        { x: +geo.hwidth, y: +geo.hthick },
        { x: +geo.hwidth, y: -geo.hthick },
      ],
    },
    {
      // 左側面
      dx: 51,
      dy: 10,
      points: [
        { x: 0, y: -geo.hthick },
        { x: 0, y: +geo.hthick },
        { x: geo.sidel, y: +geo.hsholt },
        { x: geo.sidel, y: -geo.hsholt },
      ],
    },
    {
      // 右側面
      dx: 51,
      dy: 30,
      points: [
        { x: 0, y: -geo.hthick },
        { x: 0, y: +geo.hthick },
        { x: geo.sidel, y: +geo.hsholt },
        { x: geo.sidel, y: -geo.hsholt },
      ],
    },
    {
      // 左頭
      dx: 24,
      dy: 10,
      points: [
        { x: 0, y: +geo.hheadt },
        { x: 0, y: -geo.hheadt },
        { x: -geo.sholl, y: -geo.hsholt },
        { x: -geo.sholl, y: +geo.hsholt },
      ],
    },
    {
      // 右頭
      dx: 26,
      dy: 10,
      points: [
        { x: 0, y: -geo.hheadt },
        { x: 0, y: +geo.hheadt },
        { x: +geo.sholl, y: +geo.hsholt },
        { x: +geo.sholl, y: -geo.hsholt },
      ],
    },
  ].map((pathe) => {
    pathe.points.forEach((path) => {
      uvs.push(
        (path.x * uvScale + pathe.dx + (tidx % 3 | 0) * 100) / +300,
        (path.y * uvScale + pathe.dy + ((tidx / 3) | 0) * 100) / -300 + 1
      );
    });
  });

  return assign(new BABYLON.VertexData(), {
    positions,
    indices,
    normals,
    uvs,
  });
}

export class PieceMesh extends BABYLON.Mesh {
  public geo: IPieceGeo;
  public spiece: Shogi.Piece = Shogi.Piece.none();
  public targetPosition0 = BABYLON.Vector3.Zero();
  public targetPosition1 = BABYLON.Vector3.Zero();
  public targetRotateQuaternion0 = BABYLON.Quaternion.Identity();
  public targetRotateQuaternion1 = BABYLON.Quaternion.Identity();
  constructor(id: string, geo: IPieceGeo, scene: BABYLON.Scene) {
    super(id, scene);
    this.geo = geo;
    getPieceVertex(geo).applyToMesh(this);
  }
  public static createPieceMesh(
    id: string,
    ptype: string,
    scene: BABYLON.Scene
  ): PieceMesh {
    return new PieceMesh(id, pieceGeoSet[ptype], scene);
  }
  public updateMesh(geo: IPieceGeo): void {
    getPieceVertex(geo).applyToMesh(this);
  }
}

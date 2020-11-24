import * as BABYLON from "@babylonjs/core";
import { assign } from "./assign";
import { PieceMesh, IPieceGeo, pieceGeoSet } from "./piecemesh";
import * as Shogi from "./shogi";
import { StageSet } from "./stage";

export class PieceTransTactics {
  private static sid = 0;
  geo: IPieceGeo[];
  ktype = Array.from("jjkj");
  moveDropAngle = 0.8;
  moveBringHeight: number;

  constructor(public stageSet: StageSet) {
    this.geo = Array.from(
      { length: Shogi.PieceType0.NB },
      (v, k) => pieceGeoSet[Shogi.pt0WhiteSfenTable[k]]
    );
    this.moveBringHeight = stageSet.scaleY * 2;
  }
  getAnimGroupName(): string {
    return `AnimGroup${PieceTransTactics.getId()}`;
  }
  pieceTypeStr(p: Shogi.Piece): string {
    return p.pt0() === Shogi.PieceType0.k
      ? this.ktype[p.color()]
      : p.pt0WhiteSfen();
  }
  pieceIdStr(p: Shogi.Piece): string {
    return `piece${this.pieceTypeStr(p)}${p.seq()}`;
  }
  static getId(): number {
    const id = this.sid;
    this.sid += 1;
    return id;
  }
}

export interface IPieceTrans {
  piece: Shogi.Piece;
  position0: BABYLON.Vector3;
  quaternion0: BABYLON.Quaternion;
}

export enum TransType {
  Unknown,
  Board,
  HandB,
  HandW,
}

export class PieceTrans implements IPieceTrans {
  constructor(
    public piece: Shogi.Piece,
    public position0: BABYLON.Vector3,
    public quaternion0: BABYLON.Quaternion,
    public position1: BABYLON.Vector3,
    public quaternion1: BABYLON.Quaternion,
    public type: TransType
  ) {}
  static calcTrans(tact: PieceTransTactics): PieceTrans[] {
    const stage = tact.stageSet;
    const pos = stage.position;
    const ptrances: PieceTrans[] = [];
    Array.from(
      { length: Shogi.Square.NB },
      (v, k) => k as Shogi.Square
    ).forEach((sq) => {
      switch (sq) {
        case Shogi.Square.GRAY_HAND:
        case Shogi.Square.ERROR_HAND:
          break;
        case Shogi.Square.BLACK_HAND:
        case Shogi.Square.WHITE_HAND:
          (() => {
            const wMul = 1.05;
            const toR = false;
            const handPosX = (sq === Shogi.Square.BLACK_HAND
              ? stage.htableb
              : stage.htablew
            ).position.x;
            const handPN = sq === Shogi.Square.BLACK_HAND ? +1 : -1;
            const fv = pos.fv.map((tp: Shogi.Piece[]) =>
              tp.filter((p: Shogi.Piece) => p.square() === sq)
            );
            const hGroup1: Shogi.Piece[][] = [];
            let hWidth1Prev = 0;
            fv.forEach((tp: Shogi.Piece[], fvi: number) => {
              if (tp.length === 0) {
                return;
              }
              const hWidth1 = tp.length * tact.geo[fvi].width;
              if (
                hGroup1.length === 0 ||
                (hGroup1.length > 0 &&
                  (hWidth1Prev + hWidth1) * wMul >= tact.stageSet.handWidth)
              ) {
                hGroup1.push(tp.concat([]));
                hWidth1Prev = hWidth1;
              } else {
                hGroup1[hGroup1.length - 1] = hGroup1[
                  hGroup1.length - 1
                ].concat(tp);
                hWidth1Prev += hWidth1;
              }
            });
            const hGroup2: Shogi.Piece[][] = [];
            hGroup1.forEach((gp: Shogi.Piece[]) => {
              const hWidth2 = gp.reduce(
                (p: number, c: Shogi.Piece) => p + tact.geo[c.pt0()].width,
                0
              );
              if (hWidth2 * wMul >= tact.stageSet.handWidth) {
                const divCount = Math.ceil(
                  (hWidth2 * wMul) / tact.stageSet.handWidth
                );
                let bgnIdx = 0;
                for (let dgi = 0; dgi < divCount; dgi += 1) {
                  const dglen = Math.ceil(
                    (gp.length - bgnIdx) / (divCount - dgi)
                  );
                  hGroup2.push(gp.slice(bgnIdx, bgnIdx + dglen));
                  bgnIdx += dglen;
                }
              } else {
                hGroup2.push(gp);
              }
            });
            let z = -4.5 * stage.scaleY;
            const kgeo = tact.geo[Shogi.PieceType0.k];
            hGroup2.forEach((gp: Shogi.Piece[]) => {
              /*
              const hWidth3 = gp.reduce(
                (p: number, c: Shogi.Piece) => p + tact.geo[c.pt0()].width,
                0
              );
              */
              let maxHeight = 0;
              const hGpw: {
                p: Shogi.Piece;
                geo: IPieceGeo;
                angle: number;
                lPos: BABYLON.Vector3;
                cPos: BABYLON.Vector3;
                rPos: BABYLON.Vector3;
                type: TransType;
              }[] = [];
              for (let i = 0; i < gp.length; i += 1) {
                const p = gp[i];
                const geo = tact.geo[p.pt0()];
                maxHeight = Math.max(geo.height, maxHeight);
                if (hGpw.length === 0) {
                  hGpw.push({
                    p,
                    geo,
                    angle: 0,
                    lPos: new BABYLON.Vector3(-geo.hwidth * wMul, 0, 0),
                    cPos: new BABYLON.Vector3(0, 0, geo.hheight),
                    rPos: new BABYLON.Vector3(+geo.hwidth * wMul, 0, 0),
                    type:
                      p.color() === Shogi.Color.BLACK
                        ? TransType.HandB
                        : TransType.HandW,
                  });
                } else {
                  if (toR) {
                    const prevSet = hGpw[hGpw.length - 1];
                    const angle = prevSet.angle - (prevSet.geo.beta + geo.beta);
                    const rotYMat = BABYLON.Matrix.RotationY(angle);
                    hGpw.push({
                      p,
                      geo,
                      angle,
                      lPos: prevSet.rPos.clone(),
                      cPos: BABYLON.Vector3.TransformCoordinates(
                        new BABYLON.Vector3(+geo.hwidth * wMul, 0, geo.hheight),
                        rotYMat
                      ).add(prevSet.rPos),
                      rPos: BABYLON.Vector3.TransformCoordinates(
                        new BABYLON.Vector3(+geo.width * wMul, 0, 0),
                        rotYMat
                      ).add(prevSet.rPos),
                      type:
                        p.color() === Shogi.Color.BLACK
                          ? TransType.HandB
                          : TransType.HandW,
                    });
                  } else {
                    const prevSet = hGpw[0];
                    const angle = prevSet.angle + (prevSet.geo.beta + geo.beta);
                    const rotYMat = BABYLON.Matrix.RotationY(angle);
                    hGpw.unshift({
                      p,
                      geo,
                      angle,
                      lPos: BABYLON.Vector3.TransformCoordinates(
                        new BABYLON.Vector3(-geo.width * wMul, 0, 0),
                        rotYMat
                      ).add(prevSet.lPos),
                      cPos: BABYLON.Vector3.TransformCoordinates(
                        new BABYLON.Vector3(-geo.hwidth * wMul, 0, geo.hheight),
                        rotYMat
                      ).add(prevSet.lPos),
                      rPos: prevSet.lPos.clone(),
                      type:
                        p.color() === Shogi.Color.BLACK
                          ? TransType.HandB
                          : TransType.HandW,
                    });
                  }
                }
              }
              {
                const lPosNagate = hGpw[0].lPos.negate();
                for (let i = 0; i < gp.length; i += 1) {
                  hGpw[i].lPos.addInPlace(lPosNagate);
                  hGpw[i].cPos.addInPlace(lPosNagate);
                  hGpw[i].rPos.addInPlace(lPosNagate);
                }
              }
              {
                const rPos = hGpw[hGpw.length - 1].rPos;
                const angleNegate = Math.atan2(rPos.z, rPos.x);
                const angleNegateMat = BABYLON.Matrix.RotationY(angleNegate);
                for (let i = 0; i < gp.length; i += 1) {
                  hGpw[i].angle += angleNegate;
                  hGpw[i].lPos = BABYLON.Vector3.TransformCoordinates(
                    hGpw[i].lPos,
                    angleNegateMat
                  );
                  hGpw[i].cPos = BABYLON.Vector3.TransformCoordinates(
                    hGpw[i].cPos,
                    angleNegateMat
                  );
                  hGpw[i].rPos = BABYLON.Vector3.TransformCoordinates(
                    hGpw[i].rPos,
                    angleNegateMat
                  );
                }
              }
              {
                let minZ = hGpw[0].lPos.z;
                let minX = 0;
                let maxX = 0;
                for (let i = 0; i < gp.length; i += 1) {
                  minZ = Math.min(minZ, hGpw[i].lPos.z, hGpw[i].rPos.z);
                  minX = Math.min(minX, hGpw[i].lPos.x, hGpw[i].rPos.x);
                  maxX = Math.max(maxX, hGpw[i].lPos.x, hGpw[i].rPos.x);
                }
                const cXdelta = 0.5 * (minX - maxX);
                for (let i = 0; i < gp.length; i += 1) {
                  hGpw[i].lPos.addInPlaceFromFloats(cXdelta, 0, -minZ);
                  hGpw[i].cPos.addInPlaceFromFloats(cXdelta, 0, -minZ);
                  hGpw[i].rPos.addInPlaceFromFloats(cXdelta, 0, -minZ);
                }
              }
              for (let i = 0; i < hGpw.length; i += 1) {
                const hpw = hGpw[i];
                const p = hpw.p;
                const geo = hpw.geo;
                ptrances.push(
                  new PieceTrans(
                    p,
                    new BABYLON.Vector3(
                      handPN * hpw.cPos.x + handPosX,
                      geo.perpe + stage.handHeight,
                      handPN * (z + hpw.cPos.z)
                    ),
                    new BABYLON.Vector3(
                      geo.gamma,
                      hpw.angle +
                        (p.color() === Shogi.Color.WHITE ? Math.PI : 0),
                      p.promote() ? Math.PI : 0
                    ).toQuaternion(),
                    new BABYLON.Vector3(
                      handPN * hpw.cPos.x + handPosX,
                      geo.perpe +
                        stage.handHeight +
                        (geo.perpe + geo.hheight) *
                          Math.sin(tact.moveDropAngle),
                      handPN * (z + hpw.cPos.z)
                    ),
                    new BABYLON.Vector3(
                      geo.gamma + tact.moveDropAngle,
                      hpw.angle +
                        (p.color() === Shogi.Color.WHITE ? Math.PI : 0),
                      p.promote() ? Math.PI : 0
                    ).toQuaternion(),
                    hpw.type
                  )
                );
              }
              z += maxHeight + kgeo.hthick;
            });
          })();
          break;
        default:
          (() => {
            const p = pos.pieceOn(sq);
            if (!p) {
              return;
            }
            const fr = Shogi.sq2fr(sq);
            if (!fr) {
              return;
            }
            const kgeo = tact.geo[Shogi.PieceType0.k];
            const geo = tact.geo[p.pt0()];
            ptrances.push(
              new PieceTrans(
                p,
                new BABYLON.Vector3(
                  stage.scaleX * (4 - fr.f),
                  geo.perpe,
                  stage.scaleY * (4 - fr.r) +
                    (p.color() === Shogi.Color.WHITE ? -1 : +1) *
                      (geo.hheight - kgeo.hheight)
                ),
                new BABYLON.Vector3(
                  geo.gamma,
                  p.color() === Shogi.Color.WHITE ? Math.PI : 0,
                  p.promote() ? Math.PI : 0
                ).toQuaternion(),
                new BABYLON.Vector3(
                  stage.scaleX * (4 - fr.f),
                  geo.perpe +
                    (geo.perpe + geo.hheight) * Math.sin(tact.moveDropAngle),
                  stage.scaleY * (4 - fr.r) +
                    (p.color() === Shogi.Color.WHITE ? -1 : +1) *
                      (geo.hheight * Math.cos(tact.moveDropAngle) -
                        kgeo.hheight)
                ),
                new BABYLON.Vector3(
                  geo.gamma + tact.moveDropAngle,
                  p.color() === Shogi.Color.WHITE ? Math.PI : 0,
                  p.promote() ? Math.PI : 0
                ).toQuaternion(),
                TransType.Board
              )
            );
          })();
      }
    });
    return ptrances.sort(
      (a, b) => a.piece.pt0() - b.piece.pt0() || a.piece.seq() - b.piece.seq()
    );
  }
  static execAnims(tact: PieceTransTactics): void {
    const pieceTransList = this.calcTrans(tact);
    const stage = tact.stageSet;
    stage.pieces
      .filter((m: PieceMesh) =>
        pieceTransList.every(
          (tr: PieceTrans) => m.name !== tact.pieceIdStr(tr.piece)
        )
      )
      .forEach((m) => {
        const physicsImpostor = m.physicsImpostor;
        m.physicsImpostor = null;
        stage.scene.removeMesh(m);
        setTimeout(() => {
          if (physicsImpostor) {
            physicsImpostor.dispose();
          }
          m.dispose();
        }, 0);
      });
    while (stage.pieces.length > 0) {
      stage.pieces.pop();
    }
    pieceTransList.forEach((ptrans) => {
      const piece = ptrans.piece;
      const type = tact.pieceTypeStr(piece);
      const pmid = tact.pieceIdStr(piece);
      const mesh = assign(
        (stage.scene.getMeshByName(pmid) as BABYLON.Nullable<PieceMesh>) ||
          assign(PieceMesh.createPieceMesh(pmid, type, tact.stageSet.scene), {
            position: ptrans.position1.clone(),
            rotationQuaternion: ptrans.quaternion1.clone(),
          }),
        {
          spiece: piece,
          material:
            piece.color() !== Shogi.Color.WHITE
              ? stage.pieceMaterialB
              : stage.pieceMaterialW,
          targetPosition0: ptrans.position0.clone(),
          targetPosition1: ptrans.position1.clone(),
          targetRotateQuaternion0: ptrans.quaternion0.clone(),
          targetRotateQuaternion1: ptrans.quaternion1.clone(),
        }
      );
      if (mesh.physicsImpostor) {
        mesh.physicsImpostor.dispose();
        mesh.physicsImpostor = null;
      }
      stage.pieces.push(mesh);
    });

    /*
    const scalarLerp = (
      start: number,
      end: number,
      k: number,
      len: number,
      ease?: BABYLON.EasingFunction
    ) =>
      k === 0
        ? start
        : k === len
        ? end
        : BABYLON.Scalar.Lerp(start, end, ease ? ease.ease(k / len) : k / len);
    */

    const vec3Lerp = (
      start: BABYLON.Vector3,
      end: BABYLON.Vector3,
      k: number,
      len: number,
      ease?: BABYLON.EasingFunction
    ) =>
      k === 0
        ? start
        : k === len
        ? end
        : BABYLON.Vector3.Lerp(start, end, ease ? ease.ease(k / len) : k / len);

    const quatSlerp = (
      start: BABYLON.Quaternion,
      end: BABYLON.Quaternion,
      k: number,
      len: number,
      ease?: BABYLON.EasingFunction
    ) =>
      k === 0
        ? start
        : k === len
        ? end
        : BABYLON.Quaternion.Slerp(
            start,
            end,
            ease ? ease.ease(k / len) : k / len
          );

    const bezier3 = (
      p0: BABYLON.Vector3,
      p1: BABYLON.Vector3,
      p2: BABYLON.Vector3,
      p3: BABYLON.Vector3,
      t: number
    ): BABYLON.Vector3 => {
      const u = 1 - t;
      const t0 = u * u * u;
      const t1 = 3 * u * u * t;
      const t2 = 3 * u * t * t;
      const t3 = t * t * t;
      return new BABYLON.Vector3(
        t0 * p0.x + t1 * p1.x + t2 * p2.x + t3 * p3.x,
        t0 * p0.y + t1 * p1.y + t2 * p2.y + t3 * p3.y,
        t0 * p0.z + t1 * p1.z + t2 * p2.z + t3 * p3.z
      );
    };

    {
      const fps = stage.animateFps;
      const endFrame = Math.max(
        1,
        Math.round((fps * stage.animateDuration) / 1000)
      );
      const ease = new BABYLON.QuarticEase();
      ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      if (stage.animgroup) {
        stage.animgroup.pause();
        stage.animgroup.onAnimationEndObservable.clear();
        stage.animgroup.dispose();
        stage.animgroup = null;
      }
      const animgroup = new BABYLON.AnimationGroup("pieceAnim0", stage.scene);
      stage.animgroup = animgroup;
      stage.pieces.forEach((piece, i) => {
        if (piece.physicsImpostor) {
          piece.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
          piece.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        }
        //const boardMoveStartRate = 0.5;
        const tp1rate = 0.9;
        const bezY = 2 * stage.scaleY;
        const fixbez = (
          pos: BABYLON.Immutable<BABYLON.Vector3>
        ): BABYLON.Vector3 => assign(pos.clone(), { y: Math.max(pos.y, bezY) });
        const dist =
          piece.position.subtract(piece.targetPosition0).length() /
          stage.scaleY;
        const rotQuatW = piece.targetRotateQuaternion0.multiply(
          BABYLON.Quaternion.Inverse(
            piece.rotationQuaternion || BABYLON.Quaternion.Identity()
          )
        ).w;
        const shortMove = Math.max(
          dist / 1.35,
          2 - (rotQuatW * rotQuatW * 2 - 1) / 0.5
        );
        const endFrameV = Math.max(1, endFrame * Math.min(1, shortMove));
        // const startFrameV = endFrame - endFrameV;
        {
          const anim = new BABYLON.Animation(
            `pieceAnimVec${i}`,
            "position",
            fps,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
          );
          anim.setKeys(
            shortMove <= 1
              ? Array.from({ length: endFrameV + 1 }, (v, k) => ({
                  frame: k,
                  value: vec3Lerp(
                    piece.position,
                    piece.targetPosition0,
                    k,
                    endFrameV,
                    ease
                  ),
                }))
              : Array.from({ length: endFrameV + 1 }, (v, k) => ({
                  frame: k,
                  value:
                    k < endFrameV * tp1rate
                      ? bezier3(
                          piece.position,
                          fixbez(piece.position),
                          fixbez(piece.targetPosition1),
                          piece.targetPosition1,
                          ease.ease(k / (endFrameV * tp1rate))
                        )
                      : vec3Lerp(
                          piece.targetPosition1,
                          piece.targetPosition0,
                          k - tp1rate * endFrameV,
                          (1 - tp1rate) * endFrameV,
                          ease
                        ),
                }))
          );
          animgroup.addTargetedAnimation(anim, piece);
        }
        {
          const anim = new BABYLON.Animation(
            `pieceAnimRot${i}`,
            "rotationQuaternion",
            fps,
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION
          );
          anim.setKeys(
            shortMove <= 1
              ? Array.from({ length: endFrameV + 1 }, (v, k) => ({
                  frame: k,
                  value: quatSlerp(
                    piece.rotationQuaternion || BABYLON.Quaternion.Identity(),
                    piece.targetRotateQuaternion0,
                    k,
                    endFrameV,
                    ease
                  ),
                }))
              : Array.from({ length: endFrameV + 1 }, (v, k) => ({
                  frame: k,
                  value:
                    k < tp1rate * endFrameV
                      ? quatSlerp(
                          piece.rotationQuaternion ||
                            BABYLON.Quaternion.Identity(),
                          piece.targetRotateQuaternion1,
                          k,
                          tp1rate * endFrameV
                        )
                      : quatSlerp(
                          piece.targetRotateQuaternion1,
                          piece.targetRotateQuaternion0,
                          k - tp1rate * endFrameV,
                          (1 - tp1rate) * endFrameV,
                          ease
                        ),
                }))
          );
          animgroup.addTargetedAnimation(anim, piece);
        }
      });
      animgroup.normalize();
      animgroup.onAnimationEndObservable.addOnce(() => {
        animgroup.dispose();
        for (let i = 0; i < 1; i += 1) {
          stage.pieces.forEach((piece) => {
            assign(piece, {
              position: piece.targetPosition0.clone(),
              rotationQuaternion: piece.targetRotateQuaternion0.clone(),
            });
            if (piece.physicsImpostor) {
              piece.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
              piece.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            }
          });
        }
      });
      animgroup.start(false);
    }

    {
      stage.highlightLayer.removeAllMeshes();
      const stateinfo = stage.position.stateinfo?.move.fromPiece.isSpecial()
        ? stage.position.stateinfo?.prev
        : stage.position.stateinfo;
      stage.pieces.forEach((pm) => {
        if (
          stateinfo?.move.toPiece &&
          pm.name ===
            stage.pieceTransTactics.pieceIdStr(stateinfo?.move.toPiece)
        ) {
          stage.highlightLayer.addMesh(pm, BABYLON.Color3.Red());
        }
        if (
          stateinfo?.capturedPiece &&
          pm.name ===
            stage.pieceTransTactics.pieceIdStr(stateinfo?.capturedPiece)
        ) {
          stage.highlightLayer.addMesh(pm, BABYLON.Color3.Green());
        }
      });
      if (stateinfo?.move.fromPiece.square() === Shogi.Square.BLACK_HAND) {
        stage.highlightLayer.addMesh(stage.htableb, BABYLON.Color3.Red());
      }
      if (stateinfo?.move.fromPiece.square() === Shogi.Square.WHITE_HAND) {
        stage.highlightLayer.addMesh(stage.htablew, BABYLON.Color3.Red());
      }
      if (stateinfo?.move) {
        stage.squares.forEach((sqm) => {
          const fr = Shogi.sq2fr(stateinfo.move.fromPiece.square());
          if (fr && sqm.name === `square${fr.f + 1}${fr.r + 1}`) {
            stage.highlightLayer.addMesh(sqm, BABYLON.Color3.Red());
          }
        });
      }
    }
  }
}

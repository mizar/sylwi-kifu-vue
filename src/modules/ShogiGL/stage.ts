// tslint:disable:import-name
// tslint:disable:max-classes-per-file
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
// import '@babylonjs/core/Debug/debugLayer';
// import '@babylonjs/inspector';
import { assign } from "./assign";
import { PieceMaterial } from "./piecemat";
import { PieceMesh, pieceScale } from "./piecemesh";
import * as Shogi from "./shogi";
import { PieceTrans, PieceTransTactics } from "./piecetrans";
import Ammo from "ammojs-typed";
import { JKFPlayer } from "json-kifu-format";
import { defineComponent, h, watch } from "vue";

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
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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
    : BABYLON.Quaternion.Slerp(start, end, ease ? ease.ease(k / len) : k / len);

export class StageSet {
  // scaleY: board square height: 0.03872053872053872053872 (meter)
  public scaleY = (23 / 594) * pieceScale;
  // scaleX: board square width: 0.03535353535353535353535 (meter)
  public scaleX = (21 / 594) * pieceScale;

  public handWidth = 3.17 * this.scaleY;
  public handHeight = -0.16 * this.scaleY;

  public scene: BABYLON.Scene;
  public camera: BABYLON.ArcRotateCamera;
  public shadowGenerator: BABYLON.ShadowGenerator | null = null;
  public light: BABYLON.Light | null = null;
  public matBoard: BABYLON.PBRMaterial;
  public matHand: BABYLON.PBRMaterial;
  public matLine: BABYLON.PBRMaterial;
  public matNull: BABYLON.Material;
  public board: BABYLON.Mesh;
  public htableb: BABYLON.Mesh;
  public htablew: BABYLON.Mesh;
  public lines: BABYLON.Mesh;
  public pieces: PieceMesh[] = [];
  public squares: BABYLON.Mesh[] = [];
  public pieceMaterialB: PieceMaterial;
  public pieceMaterialW: PieceMaterial;
  public pieceTextures: { [key: string]: BABYLON.Texture } = {};
  public advancedTexture: GUI.AdvancedDynamicTexture;
  public cameraRound = 32;

  public pieceTexturePath = require("@/assets/piecegl/piece_mincho_a_2k.png");
  public pieceTextureSize = 2048;
  public pieceBlurSize = 3.0;
  public pieceHeightBase = 5.0;
  public pieceHeightStrength = -1;
  public pieceNoiseBase = 0.04;
  public pieceNoiseStrength = 0;

  public sfenText = "";
  public animateFps = 30;
  public animateDuration = 700; // (milliseconds)
  skyMaterial: BABYLON.PBRMaterial;

  public position = new Shogi.Position({ infinityPieceBox: true });
  pieceTransTactics: PieceTransTactics;

  gravityVector: BABYLON.Vector3;
  physics: BABYLON.AmmoJSPlugin;

  animgroup: BABYLON.Nullable<BABYLON.AnimationGroup> = null;
  highlightLayer: BABYLON.HighlightLayer;

  constructor(
    public engine: BABYLON.Engine,
    public canvas: HTMLCanvasElement,
    public ammo: typeof Ammo
  ) {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = (this.scene = new BABYLON.Scene(engine));
    this.canvas = canvas;

    const gravityVector = (this.gravityVector = new BABYLON.Vector3(
      0,
      (-9.81 * pieceScale) / 4,
      0
    ));
    const physics = (this.physics = new BABYLON.AmmoJSPlugin(false, ammo));
    physics.setFixedTimeStep(1 / 120);
    physics.setMaxSteps(5);
    scene.enablePhysics(gravityVector, physics);

    // This creates and positions a arc rotate camera (non-mesh)
    /*const camera =*/ this.camera = assign(
      // tslint:disable:max-line-length
      new BABYLON.ArcRotateCamera(
        "camera1",
        -Math.PI / 2,
        0,
        this.cameraRound * this.scaleY,
        BABYLON.Vector3.Zero(),
        scene
      ),
      {
        lowerBetaLimit: -Math.PI,
        upperBetaLimit: +Math.PI,
        lowerRadiusLimit: 0.5 * this.scaleY,
        upperRadiusLimit: 80.0 * this.scaleY,
        pinchDeltaPercentage: 0.01,
        wheelDeltaPercentage: 0.01,
        minZ: 0.1 * this.scaleY,
        fov: 0.32,
      }
    );
    // camera.pinchPrecision;
    // camera.pinchToPanMaxDistance;
    // const postProcess = new BABYLON.PassPostProcess('scene copy', 1.0, camera);
    // const postProcess = new BABYLON.FxaaPostProcess('fxaa', 1.0, camera);

    // This attaches the camera to the canvas
    //camera.attachControl(canvas, true);

    this.highlightLayer = new BABYLON.HighlightLayer("hl1", scene);

    const lightDir = new BABYLON.Vector3(+1, -2, -0.4).normalize();

    /*
    const sceneLight = this.light = assign(
      new BABYLON.SpotLight(
        '*spot00',
        lightDir.multiplyByFloats(-18 * this.scaleY, -18 * this.scaleY, -18 * this.scaleY),
        lightDir,
        1.5,
        24,
        scene,
      ),
      {
        intensity: 2 * pieceScale * pieceScale,
        shadowMaxZ: 64 * this.scaleY,
      },
    );
    */

    const sceneLight = (this.light = assign(
      new BABYLON.DirectionalLight("*dirlight0", lightDir, scene),
      {
        intensity: 2,
      }
    ));

    this.matBoard = new BABYLON.PBRMaterial("mat_board", scene);
    this.matHand = new BABYLON.PBRMaterial("mat_hand", scene);
    this.matLine = new BABYLON.PBRMaterial("mat_line", scene);
    this.matNull = new BABYLON.Material("mat_null", scene);

    this.skyMaterial = assign(new BABYLON.PBRMaterial("skyMat", scene), {
      backFaceCulling: false,
      albedoColor: BABYLON.Color3.Black(),
      ambientColor: BABYLON.Color3.Black(),
    });

    /*const sky =*/ assign(
      BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        { diameter: 10 * pieceScale },
        scene
      ),
      {
        material: this.skyMaterial,
      }
    );
    const boardHeight = 1.0 * this.scaleY;
    this.board = assign(
      BABYLON.MeshBuilder.CreateBox(
        "board",
        {
          width: 9 * this.scaleX + 0.5 * this.scaleY,
          depth: 9.5 * this.scaleY,
          height: boardHeight,
        },
        scene
      ),
      {
        material: this.matBoard,
        position: new BABYLON.Vector3(
          0,
          -0.5 * boardHeight - 0.005 * this.scaleY,
          0
        ),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        receiveShadows: true,
      }
    );
    this.htableb = assign(
      BABYLON.MeshBuilder.CreateBox(
        "htableb",
        {
          width: this.handWidth,
          depth: 9.5 * this.scaleY,
          height: boardHeight + this.handHeight,
        },
        scene
      ),
      {
        material: this.matHand,
        position: new BABYLON.Vector3(
          4.5 * this.scaleX + 0.3 * this.scaleY + 0.5 * this.handWidth,
          -0.5 * boardHeight + 0.5 * this.handHeight,
          0
        ),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        receiveShadows: true,
      }
    );
    this.htablew = assign(
      BABYLON.MeshBuilder.CreateBox(
        "htablew",
        {
          width: this.handWidth,
          depth: 9.5 * this.scaleY,
          height: boardHeight + this.handHeight,
        },
        scene
      ),
      {
        material: this.matHand,
        position: new BABYLON.Vector3(
          -4.5 * this.scaleX - 0.3 * this.scaleY - 0.5 * this.handWidth,
          -0.5 * boardHeight + 0.5 * this.handHeight,
          0
        ),
        rotationQuaternion: new BABYLON.Vector3(0, Math.PI, 0).toQuaternion(),
        receiveShadows: true,
      }
    );
    this.lines = (() => {
      const linesary: BABYLON.Mesh[] = [];
      const lineWidth = 0.015;
      for (let i = 0; i <= 9; i += 1) {
        linesary.push(
          assign(
            BABYLON.MeshBuilder.CreateBox(
              `hline${i}`,
              {
                width: 9 * this.scaleX + lineWidth * this.scaleY,
                height: 0.007 * this.scaleY,
                depth: lineWidth * this.scaleY,
              },
              scene
            ),
            {
              position: new BABYLON.Vector3(
                0,
                -0.003 * this.scaleY,
                (4.5 - i) * this.scaleY
              ),
            }
          )
        );
        linesary.push(
          assign(
            BABYLON.MeshBuilder.CreateBox(
              `vline${i}`,
              {
                width: lineWidth * this.scaleY,
                height: 0.007 * this.scaleY,
                depth: (9 + lineWidth) * this.scaleY,
              },
              scene
            ),
            {
              position: new BABYLON.Vector3(
                (4.5 - i) * this.scaleX,
                -0.003 * this.scaleY,
                0
              ),
            }
          )
        );
      }
      for (const x of [-1, 1]) {
        for (const y of [-1, 1]) {
          linesary.push(
            assign(
              BABYLON.MeshBuilder.CreateCylinder(
                `star${(x + 1) / 2}${(y + 1) / 2}`,
                {
                  diameter: 0.05 * this.scaleY,
                  height: 0.007 * this.scaleY,
                },
                scene
              ),
              {
                position: new BABYLON.Vector3(
                  1.5 * x * this.scaleX,
                  -0.003 * this.scaleY,
                  1.5 * y * this.scaleY
                ),
              }
            )
          );
        }
      }
      return assign(BABYLON.Mesh.MergeMeshes(linesary, true) as BABYLON.Mesh, {
        material: this.matLine,
        receiveShadows: true,
      });
    })();
    this.squares = Array.from<unknown, BABYLON.Mesh>({ length: 81 }, (v, i) => {
      const fr = Shogi.sq2fr(i as Shogi.Square);
      return assign(
        BABYLON.MeshBuilder.CreateBox(
          `square${(fr?.f ?? 0) + 1}${(fr?.r ?? 0) + 1}`,
          {
            width: this.scaleX * 0.985,
            height: 0.01 * this.scaleY,
            depth: this.scaleY * 0.985,
          }
        ),
        {
          position: new BABYLON.Vector3(
            (((i % 9) - 4) | 0) * this.scaleX,
            -0.005 * this.scaleY,
            (4 - ((i / 9) | 0)) * this.scaleY
          ),
          material: this.matBoard,
          receiveShadows: true,
        }
      );
    });

    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      scene
    );

    this.pieceMaterialB = new PieceMaterial("pieceMatB", scene, {
      texturePath: this.pieceTexturePath,
      textureSize: this.pieceTextureSize,
      blurSize: this.pieceBlurSize,
      heightStrength: this.pieceHeightStrength * this.pieceHeightBase,
      noiseZoom: 800,
      noiseStrength: this.pieceNoiseStrength * this.pieceNoiseBase,
    });
    this.pieceMaterialW = new PieceMaterial("pieceMatW", scene, {
      texturePath: this.pieceTexturePath,
      textureSize: this.pieceTextureSize,
      blurSize: this.pieceBlurSize,
      heightStrength: this.pieceHeightStrength * this.pieceHeightBase,
      noiseZoom: 800,
      noiseStrength: this.pieceNoiseStrength * this.pieceNoiseBase,
    });

    this.setMatWood();

    /*const shadowGenerator =*/ this.shadowGenerator = assign(
      new BABYLON.ShadowGenerator(2048, sceneLight),
      {
        // useCloseExponentialShadowMap: true,
        useBlurExponentialShadowMap: true,
        forceBackFacesOnly: true,
        frustumEdgeFalloff: 1.0,
        // useContactHardeningShadow: true,
        // filteringQuality: BABYLON.ShadowGenerator.QUALITY_HIGH,
      }
    );

    const tactics = (this.pieceTransTactics = new PieceTransTactics(this));
    this.position.set(this.sfenText);
    PieceTrans.execAnims(tactics);

    const roomFloor = assign(
      BABYLON.MeshBuilder.CreateBox(
        "g1",
        {
          width: 3 * pieceScale,
          depth: 3 * pieceScale,
          height: 0.1 * pieceScale,
        },
        scene
      ),
      {
        material: this.matNull,
        position: new BABYLON.Vector3(0, -0.55 * pieceScale, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        receiveShadows: true,
      }
    );

    const bWallN = assign(
      BABYLON.MeshBuilder.CreateBox(
        "walls",
        {
          width: 9 * this.scaleX + 18.6 * this.scaleY + 2 * this.handWidth,
          height: 19 * this.scaleY,
          depth: 0.4 * this.scaleY,
        },
        scene
      ),
      {
        material: this.matNull,
        position: new BABYLON.Vector3(0, 0, 5 * this.scaleY),
        rotationQuaternion: BABYLON.Quaternion.RotationAlphaBetaGamma(
          0,
          0.3,
          0
        ),
        receiveShadows: false,
      }
    );
    const bWallS = assign(
      BABYLON.MeshBuilder.CreateBox(
        "walls",
        {
          width: 9 * this.scaleX + 18.6 * this.scaleY + 2 * this.handWidth,
          height: 19 * this.scaleY,
          depth: 0.4 * this.scaleY,
        },
        scene
      ),
      {
        material: this.matNull,
        position: new BABYLON.Vector3(0, 0, -5 * this.scaleY),
        rotationQuaternion: BABYLON.Quaternion.RotationAlphaBetaGamma(
          0,
          -0.3,
          0
        ),
        receiveShadows: false,
      }
    );
    const bWallE = assign(
      BABYLON.MeshBuilder.CreateBox(
        "walls",
        {
          width: 0.4 * this.scaleY,
          height: 19 * this.scaleY,
          depth: 27.5 * this.scaleY,
        },
        scene
      ),
      {
        material: this.matNull,
        position: new BABYLON.Vector3(
          4.5 * this.scaleX + 0.3 * this.scaleY + this.handWidth,
          0,
          0
        ),
        rotationQuaternion: BABYLON.Quaternion.RotationAlphaBetaGamma(
          -0.3,
          0,
          0
        ),
        receiveShadows: false,
      }
    );
    const bWallW = assign(
      BABYLON.MeshBuilder.CreateBox(
        "walls",
        {
          width: 0.4 * this.scaleY,
          height: 19 * this.scaleY,
          depth: 27.5 * this.scaleY,
        },
        scene
      ),
      {
        material: this.matNull,
        position: new BABYLON.Vector3(
          -4.5 * this.scaleX - 0.3 * this.scaleY - this.handWidth,
          0,
          0
        ),
        rotationQuaternion: BABYLON.Quaternion.RotationAlphaBetaGamma(
          0.3,
          0,
          0
        ),
        receiveShadows: false,
      }
    );

    [roomFloor, bWallN, bWallS, bWallE, bWallW].forEach((ground) => {
      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: 0,
          restitution: 2,
        },
        scene
      );
    });

    [this.htableb, this.htablew, roomFloor].forEach((ground) => {
      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: 0.4,
          restitution: 0.4,
        },
        scene
      );
    });

    [this.board].forEach((ground) => {
      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: 0.4,
          restitution: 0.4,
        },
        scene
      );
    });

    if (this.shadowGenerator) {
      const shadowMap = this.shadowGenerator.getShadowMap();
      if (shadowMap) {
        shadowMap.renderList = this.pieces || null;
      }
    }

    // cubemap読み込み
    const cubemap = new BABYLON.HDRCubeTexture(
      require("file-loader!@/assets/cube/small_cathedral_512.hdr"),
      scene,
      256,
      // reflection に roughness を適用するために mipmapはあった方が良い?
      // noMipmap を true にしてしまうと、roughness の指定によらずツルツルの質感になってしまう模様。
      false,
      undefined, // まだわかんね
      undefined, // まだわかんね
      undefined, // まだわかんね
      () => {
        // 読み込み完了後に各マテリアルの反射テクスチャとして cubemap を適用
        this.matBoard.reflectionTexture = cubemap;
        this.matHand.reflectionTexture = cubemap;
        this.matLine.reflectionTexture = cubemap;
        this.pieceMaterialB.reflectionTexture = cubemap;
        this.pieceMaterialW.reflectionTexture = cubemap;
        this.skyMaterial.reflectionTexture = assign(cubemap.clone(), {
          coordinatesMode: BABYLON.Texture.SKYBOX_MODE,
        });
      }
    );

    // 外からマウスカーソルがドラッグして入ってきた時の処理
    canvas.addEventListener(
      "dragover",
      (dev: DragEvent) => {
        dev.stopPropagation();
        dev.preventDefault();
        if (dev.dataTransfer) {
          // 「コピー」エフェクトを発生させる
          dev.dataTransfer.dropEffect = "copy";
        }
      },
      false
    );

    // ドラッグ＆ドロップされたデータを駒画像テクスチャ生成に回す
    // TODO: 棋譜テキストっぽいなら棋譜として読み込む
    canvas.addEventListener(
      "drop",
      (dev: DragEvent) => {
        dev.preventDefault();
        if (!dev.dataTransfer) return;
        const files = dev.dataTransfer.files;
        for (let i = 0; i < files.length; i += 1) {
          const fileReader = new FileReader();
          fileReader.addEventListener("load", () => {
            const texturePath = fileReader.result;
            if (typeof texturePath === "string") {
              this.pieceTexturePath = texturePath;
              this.pieceMaterialB.setParams({ texturePath });
              this.pieceMaterialW.setParams({ texturePath });
            }
          });
          fileReader.readAsDataURL(files[i]);
        }
      },
      false
    );
  }

  public setMatWood(pRed = true): void {
    assign(this.matBoard, {
      albedoColor: new BABYLON.Color3(0.8, 0.3, 0.15),
      metallic: 0.0,
      roughness: 0.5,
    });
    assign(this.matHand, {
      albedoColor: new BABYLON.Color3(0.6, 0.2, 0.1),
      metallic: 0.0,
      roughness: 0.5,
    });
    assign(this.matLine, {
      albedoColor: new BABYLON.Color3(0.0, 0.0, 0.0),
      metallic: 0.0,
      roughness: 0.5,
    });
    this.pieceMaterialB.setParams({
      colorCharN: new BABYLON.Color3(0.0, 0.0, 0.0),
      colorCharP: pRed
        ? new BABYLON.Color3(0.9, 0.0, 0.0)
        : new BABYLON.Color3(0.0, 0.0, 0.0),
      colorPiece: new BABYLON.Color3(1.0, 0.7, 0.5),
      metallicCharN: new BABYLON.Color3(0.0, 0.5, 0.0),
      metallicCharP: new BABYLON.Color3(0.0, 0.5, 0.0),
      metallicPiece: new BABYLON.Color3(0.0, 0.5, 0.0),
    });
    this.pieceMaterialW.setParams({
      colorCharN: new BABYLON.Color3(0.0, 0.0, 0.0),
      colorCharP: pRed
        ? new BABYLON.Color3(0.9, 0.0, 0.0)
        : new BABYLON.Color3(0.0, 0.0, 0.0),
      colorPiece: new BABYLON.Color3(1.0, 0.7, 0.5),
      metallicCharN: new BABYLON.Color3(0.0, 0.5, 0.0),
      metallicCharP: new BABYLON.Color3(0.0, 0.5, 0.0),
      metallicPiece: new BABYLON.Color3(0.0, 0.5, 0.0),
    });
    this.pieceMaterialB.render();
    this.pieceMaterialW.render();
  }

  public setMatMono(pRed = true): void {
    assign(this.matBoard, {
      albedoColor: new BABYLON.Color3(0.4, 0.42, 0.44),
      metallic: 0.5,
      roughness: 0.5,
    });
    assign(this.matHand, {
      albedoColor: new BABYLON.Color3(0.3, 0.32, 0.34),
      metallic: 0.5,
      roughness: 0.5,
    });
    assign(this.matLine, {
      albedoColor: new BABYLON.Color3(0.01, 0.01, 0.01),
      metallic: 0.5,
      roughness: 0.5,
    });
    this.pieceMaterialB.setParams({
      colorCharN: new BABYLON.Color3(1.0, 1.0, 1.0),
      colorCharP: pRed
        ? new BABYLON.Color3(0.9, 0.0, 0.0)
        : new BABYLON.Color3(1.0, 1.0, 1.0),
      colorPiece: new BABYLON.Color3(0.0, 0.0, 0.0),
      metallicCharN: new BABYLON.Color3(0.5, 0.5, 0.0),
      metallicCharP: new BABYLON.Color3(0.5, 0.5, 0.0),
      metallicPiece: new BABYLON.Color3(0.5, 0.5, 0.0),
    });
    this.pieceMaterialW.setParams({
      colorCharN: new BABYLON.Color3(0.0, 0.0, 0.0),
      colorCharP: pRed
        ? new BABYLON.Color3(0.9, 0.0, 0.0)
        : new BABYLON.Color3(0.0, 0.0, 0.0),
      colorPiece: new BABYLON.Color3(0.9, 0.9, 0.9),
      metallicCharN: new BABYLON.Color3(0.5, 0.5, 0.0),
      metallicCharP: new BABYLON.Color3(0.5, 0.5, 0.0),
      metallicPiece: new BABYLON.Color3(0.5, 0.5, 0.0),
    });
    this.pieceMaterialB.render();
    this.pieceMaterialW.render();
  }

  player2sfen(jkf: string, tesuu: number): void {
    const player = JKFPlayer.parseJKF(jkf);
    player.goto(-Infinity);
    this.sfenUpdate(
      `${player.shogi.toSFENString()} moves ${player.kifu.moves
        .map((v, i) =>
          !v.move || i > tesuu
            ? ""
            : v.move.from && v.move.to
            ? `${v.move.from.x}${"_abcdefghi"[v.move.from.y]}${v.move.to.x}${
                "_abcdefghi"[v.move.to.y]
              }${v.move.promote ? "+" : ""}`
            : v.move.to
            ? `${
                ({
                  FU: "P",
                  KY: "L",
                  KE: "N",
                  GI: "S",
                  KI: "G",
                  KA: "B",
                  HI: "R",
                } as { [csapt: string]: string })[v.move.piece]
              }*${v.move.to.x}${"_abcdefghi"[v.move.to.y]}`
            : ""
        )
        .filter((v) => v)
        .join(" ")}`
    );
  }

  sfenUpdate(text: string): boolean {
    if (!this.position.set(text)) {
      return false;
    }
    this.sfenText = text;
    PieceTrans.execAnims(this.pieceTransTactics);
    return true;
  }

  attachControl(flag: boolean): void {
    this.camera.attachControl(this.canvas, flag);
  }

  cam0(): void {
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.alpha -=
      Math.round(this.camera.alpha / Math.PI / 2 + 0.25) * Math.PI * 2;
    const fps = this.animateFps;
    const endFrame = Math.max(
      1,
      Math.round((fps * this.animateDuration) / 1000)
    );
    const ease = new BABYLON.QuarticEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const animAlpha = new BABYLON.Animation(
      "camAlpha",
      "alpha",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animAlpha.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(this.camera.alpha, -Math.PI / 2, k, endFrame, ease),
      }))
    );
    const animBeta = new BABYLON.Animation(
      "camBeta",
      "beta",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animBeta.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(this.camera.beta, 0, k, endFrame, ease),
      }))
    );
    const animRadius = new BABYLON.Animation(
      "camRadius",
      "radius",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animRadius.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(
          this.camera.radius,
          this.cameraRound * this.scaleY,
          k,
          endFrame,
          ease
        ),
      }))
    );
    this.scene.beginDirectAnimation(
      this.camera,
      [animAlpha, animBeta, animRadius],
      0,
      endFrame,
      false
    );
  }

  cam1(): void {
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.alpha -=
      Math.round(this.camera.alpha / Math.PI / 2 - 0.25) * Math.PI * 2;
    const fps = this.animateFps;
    const endFrame = Math.max(
      1,
      Math.round((fps * this.animateDuration) / 1000)
    );
    const ease = new BABYLON.QuarticEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const animAlpha = new BABYLON.Animation(
      "camAlpha",
      "alpha",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animAlpha.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(this.camera.alpha, +Math.PI / 2, k, endFrame, ease),
      }))
    );
    const animBeta = new BABYLON.Animation(
      "camBeta",
      "beta",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animBeta.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(this.camera.beta, 0, k, endFrame, ease),
      }))
    );
    const animRadius = new BABYLON.Animation(
      "camRadius",
      "radius",
      fps,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animRadius.setKeys(
      Array.from({ length: endFrame + 1 }, (v, k) => ({
        frame: k,
        value: scalarLerp(
          this.camera.radius,
          this.cameraRound * this.scaleY,
          k,
          endFrame,
          ease
        ),
      }))
    );
    this.scene.beginDirectAnimation(
      this.camera,
      [animAlpha, animBeta, animRadius],
      0,
      endFrame,
      false
    );
  }
}

export const Stage = defineComponent({
  props: {
    jkf: {
      type: String,
      required: true,
    },
    tesuu: {
      type: Number,
      required: true,
    },
    rotated: {
      type: Boolean,
      required: true,
    },
    attach: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, ctx) {
    return {
      props,
      ctx,
      engine: undefined as BABYLON.Engine | undefined,
      scene: undefined as BABYLON.Scene | undefined,
      stageSet: undefined as StageSet | undefined,
    };
  },
  methods: {
    async stageSetup(canvas: HTMLCanvasElement) {
      const engine = (this.engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
      }));
      const ammo = await Ammo();
      const stageSet = (this.stageSet = new StageSet(engine, canvas, ammo));
      const scene = (this.scene = stageSet.scene);
      engine.runRenderLoop(() => {
        if (this.scene) {
          this.scene.render();
        }
      });
      // Resize
      const resizeExec = () => {
        const _vfov = 0.32;
        const _hfov = 0.5;
        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
          engine.resize();
          scene.cameras.forEach((e) => {
            if (canvas.clientWidth * _vfov >= canvas.clientHeight * _hfov) {
              e.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
              e.fov = _vfov;
            } else {
              e.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
              e.fov = _hfov;
            }
          });
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).ResizeObserver) {
        // https://wicg.github.io/ResizeObserver/
        // https://caniuse.com/#feat=resizeobserver
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).ResizeObserver(resizeExec).observe(canvas);
      }
      window.addEventListener("resize", resizeExec);
    },
    pupdate() {
      const tesuu = isNaN(this.props.tesuu) ? Infinity : this.props.tesuu;
      this.stageSet?.player2sfen(this.props.jkf, tesuu);
      this.stageSet?.attachControl(this.props.attach);
    },
  },
  mounted() {
    const canvas = this.$refs.stage as HTMLCanvasElement;

    if (typeof window === "undefined") {
      return;
    }

    if (!BABYLON.Engine.isSupported()) {
      alert("WebGL is disabled or unavailable");
      return;
    }

    this.stageSetup(canvas).then(() => {
      this.pupdate();
    });

    watch([() => this.props.jkf, () => this.props.tesuu], () => this.pupdate());
  },
  render() {
    return h("canvas", { ref: "stage" });
  },
  beforeUnmount() {
    this.stageSet = undefined;
    this.scene?.dispose();
    this.scene = undefined;
    this.engine?.dispose();
    this.engine = undefined;
  },
});

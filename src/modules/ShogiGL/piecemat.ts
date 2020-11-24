import * as BABYLON from "@babylonjs/core";
import { assign } from "./assign";
import { ShaderTexture } from "./shadertexture";

export interface IPieceMaterialParams {
  texturePath: string;
  textureSize: number;
  blurSize: number;
  heightStrength: number;
  noiseZoom: number;
  noiseStrength: number;
  colorCharN: BABYLON.Color3;
  colorCharP: BABYLON.Color3;
  colorPiece: BABYLON.Color3;
  metallicCharN: BABYLON.Color3;
  metallicCharP: BABYLON.Color3;
  metallicPiece: BABYLON.Color3;
}

export class PieceMaterial extends BABYLON.PBRMaterial {
  private static shaderInit = false;
  disposeList: (BABYLON.IDisposable | undefined)[] = [];
  disposed = false;
  static init(): void {
    if (this.shaderInit) {
      return;
    }
    BABYLON.Effect.ShadersStore[
      "pieceTextureVertexShader"
    ] = `precision mediump float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUV;
void main(void) {
  vUV = uv;
  gl_Position = vec4(uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0, 0.0, 1.0);
}`;
    BABYLON.Effect.ShadersStore[
      "pieceBump0FragmentShader"
    ] = `precision mediump float;
varying vec2 vUV;
uniform sampler2D iChannel0;
uniform vec2 step;
uniform float blurRadius;
uniform float blurSizeC1;
uniform float blurSizeC2;
float mixra(vec4 color) {
  return mix(1.0, color.r, color.a);
}
void main(void) {
  // gaussian horizontal blur
  float dCol = texture2D(iChannel0, vUV).r * blurSizeC2;
  for (int i = 1; i < 128; i++) {
    float p = exp(-0.5 * float(i * i) * blurSizeC1) * blurSizeC2;
    dCol += mixra(texture2D(iChannel0, vec2(vUV.x - float(i) * step.x, vUV.y))) * p;
    dCol += mixra(texture2D(iChannel0, vec2(vUV.x + float(i) * step.x, vUV.y))) * p;
    if (i > int(blurRadius)) { break; }
  }
  // output
  gl_FragColor = vec4(vec3(dCol), 1.0);
}`;
    BABYLON.Effect.ShadersStore[
      "pieceBump1FragmentShader"
    ] = `precision mediump float;
varying vec2 vUV;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 step;
uniform float blurRadius;
uniform float blurSizeC1;
uniform float blurSizeC2;
uniform float heightStrength;
uniform float noiseZoom;
uniform float noiseStrength;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float mixra(vec4 color) {
  return mix(1.0, color.r, color.a);
}
void main(void) {
  // gaussian vertical blur
  float dCol = texture2D(iChannel1, vUV).r * blurSizeC2;
  for (int i = 1; i < 128; i++) {
    float p = exp(-0.5 * float(i * i) * blurSizeC1) * blurSizeC2;
    dCol += texture2D(iChannel1, vec2(vUV.x, vUV.y - float(i) * step.y)).r * p;
    dCol += texture2D(iChannel1, vec2(vUV.x, vUV.y + float(i) * step.y)).r * p;
    if (i > int(blurRadius)) { break; }
  }
  // clip original image
  dCol = max(dCol, mixra(texture2D(iChannel0, vUV)));
  // output
  gl_FragColor = vec4(vec3(dCol * heightStrength + snoise(vUV * noiseZoom) * noiseStrength), 1.0);
}`;
    BABYLON.Effect.ShadersStore[
      "pieceBump2FragmentShader"
    ] = `precision mediump float;
varying vec2 vUV;
uniform sampler2D iChannel1;
uniform vec2 step;
void main(void) {
  // height to normal map
  float tl = texture2D(iChannel1, vUV + vec2(-step.x, -step.y)).r;
  float l  = texture2D(iChannel1, vUV + vec2(-step.x, 0      )).r;
  float bl = texture2D(iChannel1, vUV + vec2(-step.x, +step.y)).r;
  float t  = texture2D(iChannel1, vUV + vec2(0      , -step.y)).r;
  float b  = texture2D(iChannel1, vUV + vec2(0      , +step.y)).r;
  float tr = texture2D(iChannel1, vUV + vec2(+step.x, -step.y)).r;
  float r  = texture2D(iChannel1, vUV + vec2(+step.x, 0      )).r;
  float br = texture2D(iChannel1, vUV + vec2(+step.x, +step.y)).r;
  float dX = ((tr - tl) + 2.0 * (r - l) + (br - bl));
  float dY = ((bl - tl) + 2.0 * (b - t) + (br - tr));
  vec3 normal = normalize(vec3(vec2(-dX, dY), 1.0));
  // output
  gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
}`;
    BABYLON.Effect.ShadersStore[
      "pieceColorFragmentShader"
    ] = `precision mediump float;
varying vec2 vUV;
uniform sampler2D iChannel0;
uniform vec3 pieceColor;
uniform vec3 normalCharColor;
uniform vec3 promotedCharColor;
float mixra(vec4 color) {
  return mix(1.0, color.r, color.a);
}
void main(void) {
  // rewrite color
  float tP = mixra(texture2D(iChannel0, vUV));
  vec2 pUV = mod(vUV * 3.0, 1.0);
  vec3 charColor = (pUV.x <= 0.5 || pUV.y >= 0.6) ?
    normalCharColor : promotedCharColor;
  vec3 dCol = mix(charColor, pieceColor, tP);
  // output
  gl_FragColor = vec4(dCol, 1.0);
}`;
    this.shaderInit = true;
  }
  params: Partial<IPieceMaterialParams> = {};
  stBump0?: ShaderTexture;
  stBump1?: ShaderTexture;
  stBump2?: ShaderTexture;
  stAlbedo?: ShaderTexture;
  stMetallic?: ShaderTexture;
  baseTexture?: BABYLON.Texture;
  constructor(
    name: string,
    scene: BABYLON.Scene,
    params: Partial<IPieceMaterialParams> = {}
  ) {
    super(name, scene);
    PieceMaterial.init();
    this.params = assign(this.params, params);
    this.useRoughnessFromMetallicTextureGreen = true;
    this.useRoughnessFromMetallicTextureAlpha = false;
    this.enableSpecularAntiAliasing = true;
    this.onDisposeObservable.add(() => {
      this.disposeList.push(
        this.stBump0,
        this.stBump1,
        this.stBump2,
        this.stAlbedo,
        this.stMetallic,
        this.baseTexture
      );
      this.stBump0 = undefined;
      this.stBump1 = undefined;
      this.stBump2 = undefined;
      this.stAlbedo = undefined;
      this.stMetallic = undefined;
      this.stMetallic = undefined;
      while (this.disposeList.length > 0) {
        const d = this.disposeList.pop();
        if (d) {
          d.dispose();
        }
      }
      this.disposed = true;
    });
    this.setParams();
  }
  setParams(params: Partial<IPieceMaterialParams> = {}): void {
    const oTexturePath = this.params.texturePath;
    const oTextureSize = this.params.textureSize;
    const p = assign(this.params, params);
    if (
      oTexturePath !== p.texturePath ||
      oTextureSize !== p.textureSize ||
      !(
        p.blurSize &&
        p.colorCharN &&
        p.colorCharP &&
        p.colorPiece &&
        typeof p.heightStrength !== "undefined" &&
        p.metallicCharN &&
        p.metallicCharP &&
        p.metallicPiece &&
        p.texturePath &&
        p.textureSize
      )
    ) {
      this.disposeList.push(
        this.stBump0,
        this.stBump1,
        this.stBump2,
        this.stAlbedo,
        this.stMetallic,
        this.baseTexture
      );
      this.stBump0 = undefined;
      this.stBump1 = undefined;
      this.stBump2 = undefined;
      this.stAlbedo = undefined;
      this.stMetallic = undefined;
      this.stMetallic = undefined;
      this.baseTexture = undefined;
    }
    if (
      !(
        p.blurSize &&
        p.colorCharN &&
        p.colorCharP &&
        p.colorPiece &&
        typeof p.heightStrength !== "undefined" &&
        p.metallicCharN &&
        p.metallicCharP &&
        p.metallicPiece &&
        p.texturePath &&
        p.textureSize
      )
    )
      return;
    const engine = this.getScene().getEngine();
    if (!this.stBump0) {
      this.stBump0 = new ShaderTexture(
        engine,
        { vertex: "pieceTexture", fragment: "pieceBump0" },
        p.textureSize,
        { attributes: ["position", "uv"] },
        {
          doNotChangeAspectRatio: true,
          format: BABYLON.Engine.TEXTUREFORMAT_R,
          generateDepthBuffer: false,
          generateMipMaps: false,
          generateStencilBuffer: false,
          isCube: false,
          isMulti: false,
          samplingMode: BABYLON.Engine.TEXTURE_NEAREST_SAMPLINGMODE,
          type: BABYLON.Engine.TEXTURETYPE_HALF_FLOAT,
        }
      );
    }
    if (!this.stBump1) {
      this.stBump1 = new ShaderTexture(
        engine,
        { vertex: "pieceTexture", fragment: "pieceBump1" },
        p.textureSize,
        { attributes: ["position", "uv"] },
        {
          doNotChangeAspectRatio: true,
          format: BABYLON.Engine.TEXTUREFORMAT_R,
          generateDepthBuffer: false,
          generateMipMaps: false,
          generateStencilBuffer: false,
          isCube: false,
          isMulti: false,
          samplingMode: BABYLON.Engine.TEXTURE_NEAREST_SAMPLINGMODE,
          type: BABYLON.Engine.TEXTURETYPE_HALF_FLOAT,
        }
      );
    }
    if (!this.stBump2) {
      this.stBump2 = new ShaderTexture(
        engine,
        { vertex: "pieceTexture", fragment: "pieceBump2" },
        p.textureSize,
        { attributes: ["position", "uv"] },
        {
          doNotChangeAspectRatio: true,
          format: BABYLON.Engine.TEXTUREFORMAT_RGB,
          generateDepthBuffer: false,
          generateMipMaps: true,
          generateStencilBuffer: false,
          isCube: false,
          isMulti: false,
          samplingMode: BABYLON.Engine.TEXTURE_BILINEAR_SAMPLINGMODE,
          type: BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE,
        }
      );
    }
    if (!this.stAlbedo) {
      this.stAlbedo = new ShaderTexture(
        engine,
        { vertex: "pieceTexture", fragment: "pieceColor" },
        p.textureSize,
        { attributes: ["position", "uv"] },
        {
          doNotChangeAspectRatio: true,
          format: BABYLON.Engine.TEXTUREFORMAT_RGB,
          generateDepthBuffer: false,
          generateMipMaps: true,
          generateStencilBuffer: false,
          isCube: false,
          isMulti: false,
          samplingMode: BABYLON.Engine.TEXTURE_BILINEAR_SAMPLINGMODE,
          type: BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE,
        }
      );
    }
    if (!this.stMetallic) {
      this.stMetallic = new ShaderTexture(
        engine,
        { vertex: "pieceTexture", fragment: "pieceColor" },
        p.textureSize,
        { attributes: ["position", "uv"] },
        {
          doNotChangeAspectRatio: true,
          format: BABYLON.Engine.TEXTUREFORMAT_RG,
          generateDepthBuffer: false,
          generateMipMaps: true,
          generateStencilBuffer: false,
          isCube: false,
          isMulti: false,
          samplingMode: BABYLON.Engine.TEXTURE_BILINEAR_SAMPLINGMODE,
          type: BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE,
        }
      );
    }
    if (!this.baseTexture) {
      this.baseTexture = new BABYLON.Texture(
        p.texturePath,
        this.getScene(),
        true,
        true,
        BABYLON.Engine.TEXTURE_TRILINEAR_SAMPLINGMODE,
        () => {
          this.render();
        },
        () => {
          //
        },
        undefined,
        undefined,
        undefined
      );
    }
  }
  render(): void {
    if (this.disposed) {
      return;
    }
    const p = this.params;
    if (
      !(
        p.blurSize &&
        p.colorCharN &&
        p.colorCharP &&
        p.colorPiece &&
        p.metallicCharN &&
        p.metallicCharP &&
        p.metallicPiece &&
        p.texturePath &&
        p.textureSize &&
        typeof p.heightStrength !== "undefined" &&
        typeof p.noiseZoom !== "undefined" &&
        typeof p.noiseStrength !== "undefined" &&
        this.stBump0 &&
        this.stBump1 &&
        this.stBump2 &&
        this.stAlbedo &&
        this.stMetallic &&
        this.baseTexture
      )
    )
      return;
    const stepLength = 1 / p.textureSize;
    const step = new BABYLON.Vector2(stepLength, stepLength);
    const blurSize = p.blurSize / (1024 * stepLength);
    const blurRadius = 4 * blurSize;
    const blurSizeC1 = 1 / (blurSize * blurSize);
    const blurSizeC2 = 1 / Math.sqrt(2 * Math.PI * blurSize * blurSize);
    const heightStrength = p.heightStrength / (1024 * stepLength);
    const noiseZoom = p.noiseZoom;
    const noiseStrength = p.noiseStrength / (1024 * stepLength);
    this.stBump0.s.setTexture("iChannel0", this.baseTexture);
    this.stBump0.s.setVector2("step", step);
    this.stBump0.s.setFloat("blurRadius", blurRadius);
    this.stBump0.s.setFloat("blurSizeC1", blurSizeC1);
    this.stBump0.s.setFloat("blurSizeC2", blurSizeC2);
    this.stBump1.s.setTexture("iChannel0", this.baseTexture);
    this.stBump1.s.setTexture("iChannel1", this.stBump0.t);
    this.stBump1.s.setVector2("step", step);
    this.stBump1.s.setFloat("blurRadius", blurRadius);
    this.stBump1.s.setFloat("blurSizeC1", blurSizeC1);
    this.stBump1.s.setFloat("blurSizeC2", blurSizeC2);
    this.stBump1.s.setFloat("heightStrength", heightStrength);
    this.stBump1.s.setFloat("noiseZoom", noiseZoom);
    this.stBump1.s.setFloat("noiseStrength", noiseStrength);
    this.stBump2.s.setTexture("iChannel1", this.stBump1.t);
    this.stBump2.s.setVector2("step", step);
    this.stAlbedo.s.setTexture("iChannel0", this.baseTexture);
    this.stAlbedo.s.setColor3("pieceColor", p.colorPiece);
    this.stAlbedo.s.setColor3("normalCharColor", p.colorCharN);
    this.stAlbedo.s.setColor3("promotedCharColor", p.colorCharP);
    this.stMetallic.s.setTexture("iChannel0", this.baseTexture);
    this.stMetallic.s.setColor3("pieceColor", p.metallicPiece);
    this.stMetallic.s.setColor3("normalCharColor", p.metallicCharN);
    this.stMetallic.s.setColor3("promotedCharColor", p.metallicCharP);
    this.stBump0.t.render();
    this.stBump1.t.render();
    this.stBump2.t.render();
    this.stAlbedo.t.render();
    this.stMetallic.t.render();
    this.bumpTexture = this.stBump2.t;
    this.albedoTexture = this.stAlbedo.t;
    this.metallicTexture = this.stMetallic.t;
    if (
      !(
        this.stBump0.s.isReady() &&
        this.stBump1.s.isReady() &&
        this.stBump2.s.isReady() &&
        this.stAlbedo.s.isReady() &&
        this.stMetallic.s.isReady()
      )
    ) {
      setTimeout(() => {
        this.render();
      }, 100);
    }
    while (this.disposeList.length > 0) {
      const d = this.disposeList.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}

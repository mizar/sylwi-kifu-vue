import * as BABYLON from "@babylonjs/core";

export interface IShaderTextureTOpt {
  generateMipMaps: boolean;
  doNotChangeAspectRatio: boolean;
  type: number;
  isCube: boolean;
  samplingMode: number;
  generateDepthBuffer: boolean;
  generateStencilBuffer: boolean;
  isMulti: boolean;
  format: number;
  delayAllocation: boolean;
}

export class ShaderTexture implements BABYLON.IDisposable {
  private static _sid = 0;
  id: number;
  scene: BABYLON.Scene;
  s: BABYLON.ShaderMaterial;
  t: BABYLON.RenderTargetTexture;
  constructor(
    engine: BABYLON.Engine,
    shaderPath: { vertex: string; fragment: string },
    size: number,
    sopt: Partial<BABYLON.IShaderMaterialOptions> = {},
    topt: Partial<IShaderTextureTOpt> = {}
  ) {
    const id = (this.id = ShaderTexture.getId());
    const scene = (this.scene = new BABYLON.Scene(engine));
    new BABYLON.Camera(
      `shaderTextureCamera_${id}`,
      BABYLON.Vector3.Zero(),
      scene
    );
    const shader = (this.s = new BABYLON.ShaderMaterial(
      `shaderTextureShader_${id}`,
      scene,
      shaderPath,
      sopt
    ));
    const plane = BABYLON.Mesh.CreatePlane(
      `shaderTexturePlane_${id}`,
      1,
      scene
    );
    plane.material = shader;
    const texture = (this.t = new BABYLON.RenderTargetTexture(
      `shaderTexture_${id}`,
      size,
      scene,
      topt.generateMipMaps,
      topt.doNotChangeAspectRatio,
      topt.type,
      topt.isCube,
      topt.samplingMode,
      topt.generateDepthBuffer,
      topt.generateStencilBuffer,
      topt.isMulti,
      topt.format,
      topt.delayAllocation
    ));
    texture.renderList = [plane];
  }
  static getId(): number {
    const id = this._sid;
    this._sid += 1;
    return id;
  }
  dispose(): void {
    this.s.dispose();
    this.t.dispose();
    this.scene.dispose();
  }
}

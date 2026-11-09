// Tipos Three.js adaptados para suportar r187 sem colisões no bundler
declare namespace THREE {
  export type CanvasTexture = any;
  export type Mesh = any;
  export type Material = any;
  export type MeshStandardMaterial = any;
  export type MeshBasicMaterial = any;
}

declare const THREE: any;

export = THREE;

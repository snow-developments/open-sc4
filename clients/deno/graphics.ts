import { CanvasRenderingContext2D } from "https://deno.land/x/dwm@0.3.4/ext/canvas.ts";

import { OmitFunctions } from "./types.ts";

type Style = Partial<OmitFunctions<CanvasRenderingContext2D> & {
  background: string
}>;

let isWebGpuAvailable: boolean | GPUAdapter | null = navigator.gpu !== undefined;
if (typeof window !== 'undefined' && isWebGpuAvailable) isWebGpuAvailable = await navigator.gpu.requestAdapter({
  powerPreference: "high-performance"
}).catch(_ => null);

export default class WebGPU {
  static get isAvailable() {
    return !!isWebGpuAvailable;
  }

  static get adapter() {
    return isWebGpuAvailable instanceof GPUAdapter ? isWebGpuAvailable : null;
  }
}

export class Color {
  constructor(readonly r = 0, readonly g = 0, readonly b = 0, readonly a = 1) { }

  get hex() {
    return 1 << 32 | this.r << 24 | this.g << 16 | this.b << 8 | Math.round(255 * this.a);
  }

  get hexOpaque() {
    return 1 << 24 | this.r << 16 | this.g << 8 | this.b;
  }

  toString() {
    return "#" + (1 << 32 | this.r << 24 | this.g << 16 | this.b << 8 | Math.round(255 * this.a)).toString(16).slice(1);
  }

  toStringOpaque() {
    return "#" + (1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1);
  }

  static rgb(r: number, g: number, b: number): Color {
    return new Color(r / 255, g / 255, b / 255);
  }

  static get black() {
    return new Color();
  }
  static get white() {
    return new Color(1, 1, 1);
  }
  static get red() {
    return new Color(1);
  }
  static get green() {
    return new Color(0, 1);
  }
  static get blue() {
    return new Color(0, 0, 1);
  }
  static get cyan() {
    return new Color(0, 1, 1);
  }
  static get magenta() {
    return new Color(1, 0, 1);
  }
  static get fuschia() {
    return new Color(1, 0, 1);
  }
  static get yellow() {
    return new Color(1, 1);
  }
  static get cornflowerBlue() {
    return Color.rgb(100, 149, 237);
  }
}

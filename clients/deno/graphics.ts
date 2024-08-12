// deno-lint-ignore-file no-window
import { CanvasRenderingContext2D } from "https://deno.land/x/dwm@0.3.4/ext/canvas.ts";

import { DwmWindow } from "dwm@0.3.6";
import { assert, assertExists, unimplemented } from "jsr:@std/assert";
import { OmitFunctions } from "./types.ts";
import * as renderers from "@3d/three/renderers"
import * as GPU from "@3d/three/renderers/webgpu"
import { WebGPUBackend } from "@3d/three/renderers/webgpu"

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

  /** @asserts `WebGPU.isAvailable`, i.e. that WebGPU is supported on this device. */
  static ensureAvailability(message?: string) {
    assert(WebGPU.isAvailable, message || "WebGPU is not supported. Please update your graphics drivers.");
  }

  /** @asserts `WebGPU.adapter` exists. */
  static ensureAdapter(message?: string) {
    WebGPU.ensureAvailability(message);
    assertExists(isWebGpuAvailable, message);
    return WebGPU.adapter!;
  }

  static selectContext(contextOrBackend: Context | Backend) {
    WebGPU.ensureAvailability();
    if (contextOrBackend instanceof Backend) contextOrBackend = contextOrBackend.context;

    assert(contextOrBackend instanceof Backend === false);
    return contextOrBackend;
  }
}

declare interface DwmCanvas {
  width: number;
  height: number;
}

/**
 * @category GPU
 * @experimental
 */
declare interface Context extends GPUCanvasContext {
  canvas: DwmCanvas | null
}

type GPUParameters = Partial<{
  context: Context,
  adapter: GPUAdapter,
  device: GPUDevice,
  logarithmicDepthBuffer: boolean,
  powerPreference: GPUPowerPreference,
  alpha: boolean,
  antialias: boolean,
  sampleCount: number,
  requiredLimits: GPUSupportedLimits,
}>;

class Backend extends WebGPUBackend {
  declare parameters: GPUParameters;
  declare context: Context;
  private readonly preferredSurfaceFormat = navigator.gpu.getPreferredCanvasFormat();

  constructor(readonly window: DwmWindow, parameters: GPUParameters) {
    WebGPU.ensureAvailability();
    const context = parameters.context || window.windowSurface().getContext("webgpu") as Context;
    super({ ...parameters, context });

    assertExists(this.context = this.parameters.context as Context);
    console.log(this.context);

    // Update swap WebGPU surfaces when their sizes change
    globalThis.addEventListener("framebuffersize", (ev) => {
      if (ev.window !== window) return;
      this.configureGpuSurface();
      // TODO: Tick the scene
      // this.tick(new Tick(1 / 60, 0, this.renderLoop.startupTime!));
      // if (this.renderLoop.isRunning) this.render();
    });
  }

  [Symbol.dispose]() {
    WebGPU.selectContext(this).unconfigure();
  }

  get surfaceConfig(): GPUCanvasConfiguration {
    const { width, height } = this.window.framebufferSize;
    console.log('Resizing framebuffer: ', this.window.framebufferSize);
    const alphaMode = (this.parameters as { alpha?: boolean }).alpha ? 'premultiplied' : 'opaque';
    return {
      device: this.device,
      format: this.preferredSurfaceFormat,
      alphaMode,
      width,
      height,
    };
  }

  async init(renderer: Renderer) {
    WebGPU.ensureAvailability();
    assertExists(this.context);
    this.renderer = renderer;
    const parameters = this.parameters;
    if (!parameters.context) throw Error("Could not acquire a suitable WebGPU device.");
    assertExists(parameters.context);
    const context = WebGPU.selectContext(this);
    // FIXME: Configure the context's frame buffer
    assertExists(context.canvas = this.getDomElement(), "Could not acquire a suitable WebGPU canvas.");
    this.configureGpuSurface();

    // Create the device if it is not passed with parameters
    this.device = parameters.device ?? await (async () => {
      const adapter = WebGPU.ensureAdapter();
      const features = Object.values(GPU.Constants.GPUFeatureName) as GPUFeatureName[];
      return await adapter.requestDevice({
        requiredFeatures: features.filter(feature => adapter.features.has(feature)),
        requiredLimits: (parameters.requiredLimits ?? {}) as Record<string, number>
      });
    })();

    this.updateSize();
  }

  getDomElement() {
    const window = this.window;
    const markFramebufferDirty = this.markFramebufferDirty.bind(this);

    return {
      get width() { return window.framebufferSize.width; },
      set width(value: number) {
        window.framebufferSize.width = value;
        markFramebufferDirty();
      },
      get height() { return window.framebufferSize.height; },
      set height(value: number) {
        window.framebufferSize.height = value;
        markFramebufferDirty();
      },
      style: {
        get width() { return `${window.framebufferSize.width}px`; },
        set width(value: string) {
          window.framebufferSize.width = parseInt(value);
          markFramebufferDirty();
        },
        get height() { return `${window.framebufferSize.height}px`; },
        set height(value: string) {
          window.framebufferSize.height = parseInt(value);
          markFramebufferDirty();
        }
      }
    };
  }

  // deno-lint-ignore no-explicit-any
  beginRender(renderContext: any) {
    // if (this.framebufferDirty) this.resizeGpuSurface();
    super.beginRender(renderContext);
  }

  private framebufferDirty = false;
  private markFramebufferDirty() {
    this.framebufferDirty = true;
  }

  private configureGpuSurface() {
    console.log('Resizing framebuffer: ', this.window.framebufferSize);
    WebGPU.selectContext(this.context || this).configure(this.surfaceConfig);
  }
}

export class Renderer extends renderers.Renderer {
  readonly isWebGPURenderer = true;
  declare backend: Backend;

  constructor(window: DwmWindow, parameters: GPUParameters = {}) {
    WebGPU.ensureAvailability();
    parameters = { ...parameters, antialias: true };
    // TODO: super(new Proxy(new Backend(window, parameters), debugHandler));
    super(new Backend(window, parameters), parameters);

    this.backend.init(this).then(() => {
      assertExists(this.backend.context.canvas);
      this.setPixelRatio(window.framebufferSize.width / window.size.width);
      this.setSize(window.framebufferSize.width, window.framebufferSize.height);
    });
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

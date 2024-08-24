// deno-lint-ignore-file no-window
import { CanvasRenderingContext2D } from "https://deno.land/x/dwm@0.3.4/ext/canvas.ts";

import * as three from "@3d/three";
import * as renderers from "@3d/three/renderers";
import * as GPU from "@3d/three/renderers/webgpu";
import { WebGPUBackend } from "@3d/three/renderers/webgpu";
import { DwmWindow } from "dwm@0.3.6";
import { assert, assertExists } from "jsr:@std/assert";
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
  declare device: GPUDevice;
  readonly surface: Deno.UnsafeWindowSurface;
  declare renderer: Renderer;
  declare defaultRenderPassdescriptor: GPURenderPassDescriptor | null;
  private readonly preferredSurfaceFormat = navigator.gpu.getPreferredCanvasFormat();

  constructor(readonly window: DwmWindow, parameters: GPUParameters) {
    WebGPU.ensureAvailability();
    const surface = window.windowSurface();
    const context = surface.getContext("webgpu") as Context;
    super({ ...parameters, context });

    assertExists(this.context = this.parameters.context as Context);
    this.surface = surface;

    // Update swap WebGPU surfaces when their sizes change
    globalThis.addEventListener("framebuffersize", async (ev) => {
      if (ev.window !== window) return;
      this.configureGpuSurface();
      this.renderer.setPixelRatio(window.framebufferSize.width / window.size.width);
      // TODO: Tick the scene to reduce flickering
      // this.tick(new Tick(1 / 60, 0, this.renderLoop.startupTime!));
      // if (this.renderLoop.isRunning) this.render();
    });
  }

  [Symbol.dispose]() {
    WebGPU.selectContext(this).unconfigure();
  }

  get surfaceConfig(): GPUCanvasConfiguration {
    const { width, height } = this.window.framebufferSize;
    // FIXME: Transparent frame buffers are not supported
    // const alphaMode = (this.parameters as { alpha?: boolean }).alpha ? 'premultiplied' : 'opaque';
    return {
      device: this.device,
      format: this.preferredSurfaceFormat,
      alphaMode: 'opaque',
      width,
      height,
    };
  }

  async init(renderer: Renderer) {
    if (this.device != null && this.domElement != null) return;

    WebGPU.ensureAvailability();
    const context = WebGPU.selectContext(this);
    this.renderer = renderer;
    assertExists(context, "Could not acquire a suitable WebGPU device.");

    // Create the device if it is not passed with parameters
    const parameters = this.parameters;
    this.device = parameters.device ?? await (async () => {
      const adapter = WebGPU.ensureAdapter();
      const features = Object.values(GPU.Constants.GPUFeatureName) as GPUFeatureName[];
      return await adapter.requestDevice({
        label: "Open SimCity 4",
        requiredFeatures: features.filter(feature => adapter.features.has(feature)),
        requiredLimits: (parameters.requiredLimits ?? {}) as Record<string, number>
      });
    })();

    // Configure the context's  canvas frame buffer
    this.configureGpuSurface();
    // FIXME: const canvas = WebGPU.selectContext(this).canvas;
    // assertExists(context.canvas, "Could not acquire a suitable WebGPU canvas.");

    this.updateSize();
    this.domElement = this.getDomElement();
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

  beginRender(context: renderers.RenderContext) {
    // if (this.framebufferDirty) this.resizeGpuSurface();
    super.beginRender(context);
    for (const target of this.defaultRenderPassdescriptor?.colorAttachments.map(toRenderTarget) ?? []) {
      if (target) target.label = this.window.id;
    }
  }

  finishRender(context: renderers.RenderContext): void {
    super.finishRender(context);
    const pass = this.get(context) as GpuPass;
    const targets = isRenderPass(pass) ? pass.descriptor.colorAttachments.map(toRenderTarget).map(target => target?.label ?? null) : [];
    const isWindowRenderPass = targets.includes(this.window.id);
    // FIXME: This hacky render target detection is broken, but prevents errors when calling present
    if (hasRenderTarget(context) && isWindowRenderPass) this.surface.present();
    this.device.queue.onSubmittedWorkDone().then(() => {
      // TODO: Collate render statistics
    });
  }

  private framebufferDirty = false;
  private markFramebufferDirty() {
    this.framebufferDirty = true;
  }

  private configureGpuSurface() {
    console.info('Resizing framebuffer: ', this.window.framebufferSize);
    WebGPU.selectContext(this.context || this).configure(this.surfaceConfig);
  }
}

function toRenderTarget(target: GPURenderPassColorAttachment | null): GPUTextureView | undefined {
  return target?.resolveTarget ?? target?.view;
}

interface GpuPass {
  currentPass: GPURenderPassEncoder | GPUComputePassEncoder
  descriptor: GPURenderPassDescriptor | GPUComputePassDescriptor
  encoder: GPUCommandEncoder
}

function isRenderPass(value: GpuPass): value is Exclude<GpuPass, "currentPass" | "descriptor"> & {
  currentPass: GPURenderPassEncoder,
  descriptor: GPURenderPassDescriptor
} {
  return value.currentPass instanceof GPURenderPassEncoder;
}

function isComputePass(value: GpuPass): value is Exclude<GpuPass, "currentPass" | "descriptor"> & {
  currentPass: GPUComputePassEncoder,
  descriptor: GPUComputePassDescriptor
} {
  return value.currentPass instanceof GPUComputePassEncoder;
}

function hasRenderTarget(context: renderers.RenderContext) {
  return (context.textures as three.Texture[] | null)?.some(tex => tex.isRenderTargetTexture) ?? false;
}

export class Renderer extends renderers.Renderer {
  readonly isWebGPURenderer = true;
  declare backend: Backend;

  constructor(window: DwmWindow, parameters: GPUParameters = {}) {
    WebGPU.ensureAvailability();
    parameters = { ...parameters, antialias: true };
    // TODO: super(new Proxy(new Backend(window, parameters), debugHandler));
    super(new Backend(window, parameters), parameters);
    this.setPixelRatio(window.framebufferSize.width / window.size.width);
  }

  get aspectRatio() {
    const { width, height } = this.backend.window.framebufferSize;
    return width / height;
  }
}

export class Color extends three.Color {
  constructor(readonly r = 0, readonly g = 0, readonly b = 0, readonly a = 1) {
    super(r, g, b);
  }

  get hex() {
    return 1 << 32 | this.r << 24 | this.g << 16 | this.b << 8 | Math.round(255 * this.a);
  }

  get hexOpaque() {
    return this.getHex();
  }

  toString() {
    return "#" + (1 << 32 | this.r << 24 | this.g << 16 | this.b << 8 | Math.round(255 * this.a)).toString(16).slice(1);
  }

  toStringOpaque() {
    return this.getHexString();
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

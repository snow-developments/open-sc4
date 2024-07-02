import { assert } from "jsr:@std/assert";
import * as async from "jsr:@std/async";
import RenderLoop, { RealTimeApp, Tick } from "jsr:@chances/render-loop@0.9.0";
import {
  createWindow,
  DwmWindow,
  getPrimaryMonitor,
  pollEvents,
} from "https://deno.land/x/dwm@0.3.6/mod.ts";
import { type Camera, PerspectiveCamera, Scene } from "@3d/three"
import * as renderers from "@3d/three/renderers"
import * as GPU from "@3d/three/renderers/webgpu"
import { WebGPUBackend } from "@3d/three/renderers/webgpu"

import WebGPU, { Color } from "./graphics.ts";

type GPUParameters = Partial<{
  context: GPUCanvasContext,
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
  declare context: GPUCanvasContext | undefined;
  private readonly preferredSurfaceFormat = navigator.gpu.getPreferredCanvasFormat();

  constructor(readonly window: DwmWindow, parameters: GPUParameters) {
    super({
      ...parameters,
      // deno-lint-ignore no-window
      context: window.windowSurface().getContext("webgpu")
    });

    // Update swap WebGPU surfaces when their sizes change
    globalThis.addEventListener("framebuffersize", (ev) => {
      if (ev.window !== window) return;
      this.resizeGpuSurface();
      // TODO: Tick the scene
      // this.tick(new Tick(1 / 60, 0, this.renderLoop.startupTime!));
      // if (this.renderLoop.isRunning) this.render();
    });
  }

  async init(renderer: Renderer) {
    this.renderer = renderer;

    const parameters = this.parameters;

    // Create the device if it is not passed with parameters
    const device = parameters.device ?? await (async () => {
      const adapter = WebGPU.adapter!;

      const features = Object.values(GPU.Constants.GPUFeatureName) as GPUFeatureName[];
      return await adapter.requestDevice({
        requiredFeatures: features.filter(feature => adapter.features.has(feature)),
        requiredLimits: (parameters.requiredLimits ?? {}) as Record<string, number>
      });
    })();

    this.device = device;
    this.context = parameters.context;

    this.resizeGpuSurface();
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

  private resizeGpuSurface() {
    const { width, height } = this.window.framebufferSize;
    console.log('Resizing framebuffer: ', this.window.framebufferSize);
    const alphaMode = (this.parameters as { alpha?: boolean }).alpha ? 'premultiplied' : 'opaque';
    // FIXME: Error: Surface is not configured for presentation
    this.context?.configure({
      device: this.device,
      format: this.preferredSurfaceFormat,
      alphaMode,
      width,
      height,
    });
  }
}

class Renderer extends renderers.Renderer {
  readonly isWebGPURenderer = true;

  constructor(window: DwmWindow, parameters: GPUParameters = {}) {
    assert(WebGPU.isAvailable, "WebGPU is not supported. Please update your graphics drivers.");
    parameters = { ...parameters, antialias: true };
    // TODO: super(new Proxy(new Backend(window, parameters), debugHandler));
    super(new Backend(window, parameters), parameters);

    this.setPixelRatio(window.framebufferSize.width / window.size.width);
    this.setSize(window.framebufferSize.width, window.framebufferSize.height);
  }
}

export default class Game {
  public clearColor: Color = Color.cornflowerBlue;

  private _renderers = new Map<string, Renderer>();
  private _scenes = new Map<string, Scene>();
  private _cameras = new Map<string, Camera>();
  private renderLoop = new RenderLoop(60, {
    tick: this.tick.bind(this),
    render: this.render.bind(this),
  } as RealTimeApp);
  // TODO: private world = new World();
  limitFrameRate = false;
  private _windows: DwmWindow[] = [];
  private _mainWindow: DwmWindow | null = null;

  constructor(public readonly locale: string = "en-US") {
    assert(WebGPU.isAvailable, "WebGPU is not supported.");
  }

  /** @rejects When the GPU adapter is unavailable. */
  get gpuInfo() {
    // Unmask GPU device info
    // See https://github.com/denoland/deno/blob/main/ext/webgpu/01_webgpu.js#L507
    // TODO: Assert we get some info back, e.g. these keys: ["vendor", "device", "description"]
    return WebGPU.adapter?.requestAdapterInfo() ?? Promise.reject(
      new Error("GPU adapter information is not available.")
    );
  }

  run() {
    const adapter = WebGPU.adapter!;
    assert(adapter, "Could not acquire a suitable WebGPU adapter.");

    // TODO: Remove this event listener when the render loop finishes
    globalThis.addEventListener("unhandledrejection", this.unhandledRejection);

    const window = this._mainWindow = this.createWindow("Open SimCity 4", 640, 480);
    const surface = window.windowSurface();
    const context = surface.getContext("webgpu");
    this._renderers.set(window.id, new Renderer(window, {
      adapter,
      requiredLimits: {
        ...adapter.limits,
        // Don't require GPU storage buffers
        maxDynamicStorageBuffersPerPipelineLayout: 0,
        maxStorageBuffersPerShaderStage: 0,
        maxStorageBufferBindingSize: 0,
        maxStorageTexturesPerShaderStage: 0,
        // Don't require general purpose GPU compute
        maxComputeInvocationsPerWorkgroup: 0,
        maxComputeWorkgroupStorageSize: 0,
        maxComputeWorkgroupsPerDimension: 0,
        maxComputeWorkgroupSizeX: 0,
        maxComputeWorkgroupSizeY: 0,
        maxComputeWorkgroupSizeZ: 0,
      },
    }));
    if (!this._device) throw Error("Could not acquire a suitable WebGPU device.");
    this._windows.push(window);

    return this.renderLoop.start().finished;
  }

  createWindow(title: string, width: number, height: number) {
    const window = createWindow({
      title: title,
      width,
      height,
      resizable: true,
      vsync: true,
    });
    const monitor = getPrimaryMonitor();
    window.setSizeLimits(
      width,
      height,
      monitor.workArea.width,
      monitor.workArea.height,
    );
    // TODO: this._inputMaps.set(window.id, new Input());
    return window;
  }

  private unhandledRejection = (e: PromiseRejectionEvent) => {
    e.preventDefault();
    console.error(
      `${new Date().toUTCString()}: Unhandled Promise Rejection: ${e.reason}`,
    );
    if (e.reason instanceof Error && !!e.reason.stack) console.error(e.reason.stack);
    Deno.exit(1);
  };

  private async tick(tick: Tick): Promise<void> {
    /** Time allowed to GLFW to poll window events, in milliseconds. */
    const POLL_TIMEOUT = 5;
    const glfwTimeout = AbortSignal.timeout(POLL_TIMEOUT);
    // Make sure it doesn't take too long to poll window events
    await Promise.race([
      async.abortable(new Promise<void>((resolve) => {
        pollEvents(false);
        resolve();
      }), glfwTimeout).then(() => glfwTimeout.throwIfAborted()),
      async.delay(POLL_TIMEOUT, { signal: glfwTimeout }).then(
        () => Promise.reject("GLFW is taking too long to poll window events.")
      )
    ])

    for (const renderer of this._renderers.values()) renderer.setClearColor(this.clearColor.hexOpaque);
    for (const scene of this._scenes.values()) {
      // TODO: Update the current game scenes
    }
  }

  private render() {
    // Render the scene in each window
    this._windows.map((window) =>
      this._renderers.get(window.id)?.renderAsync(
        this._scenes.get(window.id),
        this._cameras.get(window.id),
      )
    );
  }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await new Game().run();
}

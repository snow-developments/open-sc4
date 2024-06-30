import * as async from "jsr:@std/async";
import RenderLoop, { RealTimeApp, Tick } from "jsr:@chances/render-loop@0.9.0";
import {
  createWindow,
  DwmWindow,
  getPrimaryMonitor,
  pollEvents,
} from "https://deno.land/x/dwm@0.3.6/mod.ts";

import { Color } from "./graphics.ts";

export default class Game {
  public clearColor: Color = Color.cornflowerBlue;

  private _adapter: GPUAdapter | null = null;
  private _device: GPUDevice | null = null;
  private _surfaces = new Map<string, Deno.UnsafeWindowSurface>();
  private _contexts = new Map<string, GPUCanvasContext>();
  private _pipelines = new Map<string, GPUPipelineBase>();
  private renderLoop = new RenderLoop(60, {
    tick: this.tick.bind(this),
    render: this.render.bind(this),
  } as RealTimeApp);
  // TODO: private world = new World();
  limitFrameRate = false;
  private _windows: DwmWindow[] = [];
  private _mainWindow: DwmWindow | null = null;
  private readonly preferredSurfaceFormat = navigator.gpu
    .getPreferredCanvasFormat();

  constructor(public readonly locale: string = "en-US") {}

  get adapter() {
    return this._adapter;
  }

  get device() {
    return this._device;
  }

  /** @rejects When the GPU adapter is unavailable. */
  get gpuInfo() {
    // Unmask GPU device info
    // See https://github.com/denoland/deno/blob/main/ext/webgpu/01_webgpu.js#L507
    // TODO: Assert we get some info back, e.g. these keys: ["vendor", "device", "description"]
    return this._adapter?.requestAdapterInfo() ?? Promise.reject(
      new Error(
        "GPU adapter is not available.",
      ),
    );
  }

  async run() {
    // TODO: Remove this event listener when the render loop finishes
    globalThis.addEventListener("unhandledrejection", this.unhandledRejection);

    this._adapter = await navigator.gpu.requestAdapter({
      powerPreference: "low-power",
    });
    if (!this._adapter) {
      throw Error("Could not acquire a suitable WebGPU adapter.");
    }
    this._device = await this._adapter!.requestDevice({
      label: "Teraflop GPU Device",
      requiredLimits: {
        ...this._adapter.limits,
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
    });
    if (!this._device) throw Error("Could not acquire a suitable WebGPU device.");

    const window = this._mainWindow = this.createWindow("Open SimCity 4", 800, 450);
    const surface = window.windowSurface();
    this._surfaces.set(window.id, surface);
    const context = surface.getContext("webgpu");
    this._contexts.set(window.id, context);
    this._windows.push(window);
    this.resizeGpuSurface(window, this.device!);

    // Update swap WebGPU surfaces when their sizes change
    globalThis.addEventListener("framebuffersize", (ev) => {
      this.resizeGpuSurface(ev.window, this.device!);
      this.tick(new Tick(1 / 60, 0, this.renderLoop.startupTime));
      if (this.renderLoop.isRunning) this.render();
    });

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
    console.error(
      `${new Date().toUTCString()}: Unhandled Promise Rejection: ${e.reason}`,
    );
    e.preventDefault();
  };

  private tick(tick: Tick): void {
    // TODO: Update the current game scenes
  }

  private render() {
    // Render the scene in each window
    this._windows.forEach((window) => {
      const getFrameBuffer = () =>
        this._contexts.get(window.id)!.getCurrentTexture().createView();
      const clearFrameBuffer = () => {
        const commandEncoder = this.device!.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
          colorAttachments: [{
            view: getFrameBuffer(),
            clearValue: this.clearColor,
            loadOp: "clear" as GPULoadOp,
            storeOp: "store" as GPUStoreOp,
          }],
        });
        passEncoder.end();
        return commandEncoder.finish();
      };
      const commandBuffers: GPUCommandBuffer[] = [clearFrameBuffer()];
      this.device!.pushErrorScope("validation");

      // TODO: Render the scene for this window

      // Submit the aggregated command buffers
      this.device!.queue.submit(commandBuffers);
      // Swap frame buffers
      this._surfaces.get(window.id)!.present();
      // Handle validation errors
      this.device!.popErrorScope()?.then((err) => {
        const errorMessage = "Unexpected GPU validation error!";

        if (err == null) throw new Error(errorMessage);
        if (err instanceof Error) throw new Error(err.message, { cause: err });
        throw new GPUValidationError(
          err.message ?? `${errorMessage}\n\n\tDetails: ${err}`,
        );
      });
    });
  }

  private resizeGpuSurface(window: DwmWindow, device: GPUDevice) {
    const { width, height } = window.framebufferSize;
    const format = this.preferredSurfaceFormat;
    this._contexts.get(window.id)?.configure({ device, format, width, height });
  }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await new Game().run();
}

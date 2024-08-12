import { assert } from "jsr:@std/assert";
import * as async from "jsr:@std/async";
import RenderLoop, { RealTimeApp, Tick } from "jsr:@chances/render-loop@0.9.0";
import {
  createWindow,
  DwmWindow,
  getPrimaryMonitor,
  pollEvents,
} from "dwm@0.3.6";
import { type Camera, PerspectiveCamera, Scene } from "@3d/three"

import WebGPU, { Color, Renderer } from "./graphics.ts";

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
    WebGPU.ensureAvailability("WebGPU is not supported.");
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

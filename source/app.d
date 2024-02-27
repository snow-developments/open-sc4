import std.stdio;

import wgpu.api;
import sc4.window;

void main() {
  auto app = new App();

  auto adapter = app.instance.requestAdapter(app.surface, PowerPreference.lowPower);
  assert(adapter.ready, "Adapter instance was not initialized");

  auto device = adapter.requestDevice(adapter.limits);
  assert(device.ready, "Device is not ready");

  app.runEventLoop(device);
  app.destroy();
}

class App : Window {
  package Instance instance;
  private Pipeline pipeline;

  this() {
    this.instance = Instance.create();
    assert(instance.id, "Could not create WebGPU instance.");

    auto title = "Open SimCity 4";
    title.writeln;

    const width = 640;
    const height = 480;
    super(title, width, height, instance);
  }

  override void initialize(const Device device) {
    import std.process : environment;
    import wgpu.utils : valid;
    assert(device.valid);

    // Enable stack traces from Rust-land
    debug environment["RUST_BACKTRACE"] = "1";

    auto swapChainFormat = this.surface.preferredFormat(device.adapter);
  }

  override void resizeRenderTarget(const Device device, const int width, const int height) {
    import wgpu.utils : resize;
    assert(device.ready);
    if (width == 0 && height == 0) return;

    this.surface.resize(width, height);
  }

  override void render(const Device device) {
    import wgpu.utils : wrap;
    import std.conv : text;
    import std.typecons : Yes;

    auto swapChain = this.surface.getCurrentTexture();
    // TODO: Validate the texture descriptor is correct
    auto swapChainTexture = swapChain.texture.wrap(this.surface.descriptor);
    final switch (swapChain.status) {
      case SurfaceTextureStatus.success:
        // All good, could check for `swapChain.suboptimal` here.
        break;
      case SurfaceTextureStatus.outOfMemory:
        throw new Error("GPU device is out of memory!");
      case SurfaceTextureStatus.deviceLost:
        throw new Error("GPU device was lost!");
      case SurfaceTextureStatus.force32:
        throw new Error("Could not get swap chain texture: " ~ swapChain.status.text);
      case SurfaceTextureStatus.timeout:
      case SurfaceTextureStatus.outdated:
      case SurfaceTextureStatus.lost:
        // Skip this frame, and re-configure surface.
        if (swapChain.texture !is null) swapChainTexture.destroy();
        auto size = this.size;
        this.resizeRenderTarget(device, size.width, size.height);
        return;
    }

    auto encoder = device.createCommandEncoder();
    auto renderPass = encoder.beginRenderPass(
      RenderPass.colorAttachment(swapChainTexture.defaultView, /* Black */ Color(0, 0, 0, 1))
    );
    //renderPass.setPipeline(pipeline.to!RenderPipeline);
    //renderPass.draw(3, 1);
    renderPass.end();

    auto commandBuffer = encoder.finish();
    device.queue.submit(commandBuffer);
    device.poll(Yes.forceWait);
    this.surface.present();
  }
}

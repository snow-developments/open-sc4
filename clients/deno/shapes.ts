// TODO: import { createCanvas } from "jsr:@gfx/canvas@0.5.6";
import {
  mainloop,
  WindowCanvas,
} from "https://deno.land/x/dwm@0.3.4/ext/canvas.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const canvas = new WindowCanvas({
    title: "Skia Canvas",
    width: 800,
    height: 600,
    resizable: true
  });
  globalThis.addEventListener("framebuffersize", (ev) => canvas.draw());

  canvas.onDraw = (ctx) => {
    // TODO: Run visual shape tests
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textBaseline = "top";
    ctx.fillText("Hello World", 10, 10);
  };

  await mainloop(() => {
    // TODO: Update the scene
    canvas.draw();
  });
}

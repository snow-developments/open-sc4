import "luxe: render" for Render, RenderLayerDesc, PassLayerDesc, LoadAction
import "luxe: render" for SortType, ImageDesc, ImageType, PixelFormat

class Renderer {

  construct new() {
    Log.print("game / render / init / ok")
  }

  ready() {}

  tick(delta) {}

  render_path(ctx) {
    if(ctx.path == "game") game(ctx)
    else if(ctx.path == "ui") gui(ctx)
  }

  game(ctx) {
    var layer = RenderLayerDesc.new()
        layer.dest.color[0].clear_color = ctx.get("clear_color", [0,0,0,0])
        layer.dest.color[0].load_action = LoadAction.clear
        layer.dest.depth.load_action = LoadAction.clear

    ctx.layer_render("default", layer)
  }

  gui(ctx) {
    var layer = RenderLayerDesc.new()
        layer.dest.color[0].load_action = LoadAction.dont_care
        layer.dest.depth.load_action = LoadAction.clear

    ctx.layer_render("default", layer)
  }
}

import "luxe: world" for World, Camera, Entity, Transform
import "luxe: render" for Render
import "luxe: input" for Input
import "luxe: game" for Frame, Ready as Main

class Ready is Main {
  world     { _world }
  ui        { _ui_world }

  camera    { _camera }
  cameraUi  { _ui_camera }

  color     { _color }
  color=(v) { _color = v }

  mouse     { _mouse }
  mouse3D   { _mouse3d }

  width     { Render.window_w() }
  height    { Render.window_h() }
  scale     { Render.drawable_ratio() }

  construct ready(message: String) {
    super(message)

    _color = [1,1,1,1]
    _mouse = [0, 0]
    _ui_mouse = [0, 0]

    _world = World.create("game")
    _ui_world = World.create("ui")

    _camera = Entity.create(_world, "app.camera")
    Transform.create(_camera)
    Camera.create(_camera)
    Camera.set_default(_world, _camera)

    _ui_camera = Entity.create(ui, "app.camera.ui")
    Transform.create(cameraUi)
    Camera.create(cameraUi)
    Camera.set_default(ui, cameraUi)

    // Default simulation loop
    Frame.on(Frame.sim) {|delta|
      _mouse3d = Camera.screen_point_to_world(camera, Input.mouse_x(), Input.mouse_y())
      _mouse = Camera.screen_point_to_world(cameraUi, Input.mouse_x(), Input.mouse_y())
      World.tick(_world, delta)
      World.tick(ui, delta)
    }

    // Default render loop
    Frame.on(Frame.visual) {|delta|
      World.render(world, camera, "game", { "clear_color":_color })
      World.render(ui, cameraUi, "ui")
    }
  }
}

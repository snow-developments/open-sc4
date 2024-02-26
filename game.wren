import "luxe: world" for World, Entity, Transform, Sprite, Values, Tags, Camera
import "luxe: draw" for Draw, PathStyle
import "luxe: input" for Input, Key
import "luxe: assets" for Assets
import "luxe: asset" for Asset
import "luxe: math" for Math
import "luxe: io" for IO

import "outline/ready" for Ready

class Game is Ready {
  var logo = Entity.none

  fov { _fov }

  construct ready() {
    super("ready! %(width) x %(height) @ %(scale)x")

    _fov = Math.radians(90)
    Camera.perspective(camera, fov, width / height, 0.5, 2000)

    logo = Entity.create(ui)
    Transform.create(logo)
    Sprite.create(logo, Assets.material("luxe: material/logo"), 128, 128)
  }

  tick(delta: Num) {
    Transform.set_pos(logo, mouse.x, mouse.y)

    if(Input.key_state_released(Key.escape)) IO.shutdown()

    color.r = color.g = color.b = (IO.timestamp()/40 % 0.15)
  }
}

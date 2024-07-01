export class Color {
  constructor(readonly r = 0, readonly g = 0, readonly b = 0, readonly a = 1) { }

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

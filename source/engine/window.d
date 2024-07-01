/// Windowing utilities for Open SimCity 4.
///
/// Authors: Chance Snow
/// Copyright: Copyright © 2024 Chance Snow. All rights reserved.
/// License: AGPLv3 License
module sc4.engine.window;

import std.conv : to;
import std.typecons : Tuple;

///
alias Size = Tuple!(uint, "width", uint, "height");

///
abstract class Window {
  import std.math : floor;
  import std.string : toStringz;
  import std.typecons : Yes;

  private string _title;
  private Size _size;

  ///
  this(const string title, const uint width = 640, const uint height = 480) {
    import std.exception : enforce;

    _title = title;
    _size = Size(width, height);
  }

  /// Title of this window.
  string title() @property const {
    return _title;
  }

  /// Size of this window's framebuffer, in pixels.
  Size size() @trusted {
    return _size;
  }
}

package:

/// Convert `value`, in seconds, to milliseconds.
/// Returns: `value` converted to milliseconds, rounded down to to the nearest positive integer.
/// If the conversion overflows, zero is returned.
ulong ms(T)(T value) nothrow if (isImplicitlyConvertible!(T, real)) {
  import std.conv : ConvOverflowException;
  import std.exception : assumeWontThrow, ifThrown;
  import std.math : floor;

  return (value / 1000).floor.to!ulong.ifThrown!ConvOverflowException(0).assumeWontThrow;
}

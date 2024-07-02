module sc4;

import dbpf;
import std.stdio;

enum title = "Open SimCity 4";

static this() {
  title.writeln;
}

/// The SimCity 4 installation directory, or `null` if not found.
string gameDir() {
  import std.algorithm : filter;
  import std.file : exists;
  import std.path : asAbsolutePath, isValidPath, pathSeparator;

  private static immutable knownGameDirs = [
    "/Applications/SimCity 4 Deluxe.app",
    // TODO: Add known Steam paths
  ];

  foreach (knownDir; knownGameDirs.filter!(dir => dir.isValidPath)) {
    const dir = knownDir.asAbsolutePath;
    if (dir.exists) return dir;
  }

  return null;
}

///
class Game {
  ///
  Archive* currentCity = null;
  ///
  private bool paused = false;
}

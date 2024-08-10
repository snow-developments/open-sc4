module sc4;

static import dbpf;
import std.array : array;
import std.conv : to;
import std.file : exists;
import std.stdio;

static import sc4.paths;

alias Archive = dbpf.SimCity4Archive;

///
enum title = "Open SimCity 4";

static this() {
  title.writeln;
}

///
static immutable knownGameDirs = [
  "/Applications/SimCity 4 Deluxe.app",
  // TODO: Add known Steam paths
];

/// The SimCity 4 installation directory, or `null` if not found.
string findGameDir() {
  import std.algorithm : filter;
  import std.path : asAbsolutePath, isValidPath, pathSeparator;

  foreach (knownDir; knownGameDirs.filter!(dir => dir.isValidPath)) {
    string dir = knownDir.asAbsolutePath.array;
    if (dir.exists) return dir;
  }

  return null;
}

struct Package {
  string name;
  string path;
  shared bool loaded = false;
  Archive* archive = null;
}

///
class Game {
  import std.exception : enforce;

  private string gameDir = null;
  ///
  Archive* currentCity = null;
  private bool paused = false;

  ///
  void boot() {
    import std.algorithm : all, map, joiner;
    import std.parallelism : parallel;
    import std.path : absolutePath, dirSeparator;

    // TODO: Save gameDir in sc4.cfg
    const gameDir = findGameDir();
    // TODO: Prompt the user for their SC4 installation
    if (gameDir is null) throw new Error("Could not find SimCity 4 installation.");
    else this.gameDir = gameDir;

    // Ensure required assets exist
    enforce(
      (sc4.paths.ini ~ sc4.paths.data).map!(file => file.absolutePath(gameDir)).all!exists,
      "Could not find required SimCity 4 assets."
    );

    // Load game data archives in parallel
    auto packages = sc4.paths.data.map!((file) {
      import std.path : baseName;
      return new Package(file.baseName, file.absolutePath(gameDir));
    });
    foreach (i, pkg; packages.parallel) {
      pkg.archive = new Archive(pkg.path);
      pkg.loaded = true;
    }
  }
}

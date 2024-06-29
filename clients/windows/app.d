import core.sys.windows.windows;
import std.stdio;

import windows;

extern (C) int _d_run_main(int argc, char **argv, MainFunc mainFunc);

extern (Windows) int WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
  import std.algorithm : map;
  import std.array : array, join;
  import std.conv : castFrom, to;
  // QUESTION: Do more type introspection?
  //import std.traits : fullyQualifiedName;

  auto cmdLine = castFrom!(char*).to!(const(wchar)*)(lpCmdLine);

  int argc;
  wchar*[] argv = (CommandLineToArgvW(cmdLine, &argc))[0 .. argc];
  string[] args = argv.map!(to!wstring).array.map!(to!(string)).array;
  assert(argc > 0, args.join("\n"));
  return _d_run_main(argc, castFrom!(immutable(char)**).to!(char**)(args.map!(x => x.ptr).array.ptr), &entryPoint);
}

extern(C) int entryPoint(string[] args) nothrow {
  import std.exception : assumeWontThrow;
  import std.utf : toUTF16z;

  MessageBoxW(null, assumeWontThrow(args.mallocJoin("\n").toUTF16z), "D Windows Application"w.ptr, MB_OK);
  return 0;
}

// TODO: Investigate Windows DLLs: https://wiki.dlang.org/Win32_DLLs_in_D#DLLs_with_a_C_Interface
//import core.sys.windows.dll;
//mixin SimpleDllMain;

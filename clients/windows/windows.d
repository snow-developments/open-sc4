module windows;

import core.sys.windows.windows;
import std.conv : castFrom, to;

alias nothrow @system extern(C) int function(string[] args) MainFunc;

string mallocConcat(string lhs, string rhs) @nogc {
  import core.stdc.stdlib : malloc;
  import std.algorithm : copy;
  import std.string : fromStringz;

  immutable size = lhs.length + rhs.length;
  auto result = castFrom!(void*).to!(char*)(malloc(size))[0 .. size];
  auto remainder = lhs.copy(result);
  assert(rhs.copy(remainder).length == 0, "Resulting string is unfilled!");
  return castFrom!(char[]).to!string(result.ptr.fromStringz);
}

string mallocJoin(string[] strings, string joiner) @nogc {
  import core.stdc.stdlib : free, malloc;
  import core.stdc.string : strcat, strcpy, strlen;

  // Join the strings together
  char* result = null;
  for (int i = 1; i < strings.length; i += 1) {
    if (result == null) {
      result = castFrom!(void*).to!(char*)(malloc(strings[i - 1].length + joiner.length + strings[i].length));
      strcpy(result, strings[i - 1].ptr);
      int joinerOffset = castFrom!ulong.to!int(strings[i - 1].length);
      strcpy(result[joinerOffset .. (joinerOffset + joiner.length)].ptr, joiner.ptr);
      strcpy(result[(joinerOffset + joiner.length) .. (joinerOffset + joiner.length + strings[i].length)].ptr, strings[i].ptr);
    } else {
      auto oldResult = result;
      result = castFrom!(void*).to!(char*)(malloc(result.strlen + joiner.length + strings[i].length));
      strcpy(result, oldResult);
      free(oldResult);
    }
  }

  assert(result is null ? true : result.strlen > 0, "Invalid length of joined strings!");
  return result is null ? (strings.length > 0 ? strings[0] : "") : (castFrom!(char[]).to!string(result[0 .. result.strlen]));
}

unittest {
  import std.algorithm : equals;

  string[] strings;
  strings ~= "foo";

  assert(strings.mallocJoin(",").equals("foo"));

  strings ~= "bar";
  assert(strings.mallocJoin(",").equals("foo,bar"));
}

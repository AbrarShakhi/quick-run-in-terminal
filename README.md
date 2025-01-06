# Quick Run in Terminal

This is a `vscode` extension to run `C`, `C++`, `python` files in vscode terminal.
It just `cd` into the file directory. then clears the terminal. Then runs the program.

## how to run?

Install this extension.
First open a `C`, `C++`, `python` files.

1. use shortcut `Ctrl+Alt+C` to run the file
2. right click the Text Editor and then click `Compile and run` in editor context menu
3. click `Quick Run` button in title menu
4. Open `command palette` and search `Quick Run` abd hit enter.

---

## Demo

![demo](res/demo/tutorial.gif)

## Features

- compile and run `C/C++` file
- compile and run `python` file
  <!-- - compile and run `java` file -->
  <!-- - compile and run `rust` file -->

---

## Requirements

A compiler/interpreter for your favorite language.

> **❗️ Important**: default C/C++ compiler is set to `gcc`/`g++`, For python it is set to `python`. If you want to use deferent compiler/interpreter see [configurations example](#example).

---

## Configurations

### default

```json
{
  "quickRunInTerminal.binaryOutputName": "",
  "quickRunInTerminal.C_compilerPath": "gcc",
  "quickRunInTerminal.clearBeforeRun": true,
  "quickRunInTerminal.Cpp_compilerPath": "g++",
  "quickRunInTerminal.Python_interpreterPath": "python",
  "quickRunInTerminal.saveAllFilesBeforeRun": false
}
```

Lets say you want to use `python3` then go to settings search `quick run in terminal`
Find the section where says `Quick Run In Terminal: Python_interpreter Path`
set that to `python3`
For C/c++ find `Quick Run In Terminal: C_compiler Path` or `Quick Run In Terminal: C_compiler Path`

### Examples

```json
{
  "quickRunInTerminal.Python_interpreterPath": "/home/user/bin/python3",
  "quickRunInTerminal.Python_interpreterPath": "python3",
  "quickRunInTerminal.Cpp_compilerPath": "/usr/g++",
  "quickRunInTerminal.C_compilerPath": "clang"
}
```

> NOTE: It says `path` but if interpreter is accessable from anywhere then you can just put program name.

---

report bugs/issues here [github](https://github.com/AbrarShakhi/runccpp-vsce/issues)

<a href="https://www.flaticon.com/free-icons/coding" title="coding icons">Coding icons created by iconsmind - Flaticon</a>

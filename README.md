# Quick Run in Terminal

## what is this?
This is a `vscode` extension to run `C`, `C++`, `python` files in vscode terminal

## how to run?
First open a `C`, `C++`, `python` files.
1. use shortcut `Ctrl+Alt+C` to run the file
<!-- 1. right click the Text Editor and then click `Compile and run` in editor context menu -->
1. click `Quick Run` button in editor title menu

----

<!-- ## Demo -->

<!-- ![demo](media/screenshots/demo.gif) -->

----

## Features

- compile and run `C/C++` file
- compile and run `python` file

----

## Requirements

- `C/C++` compiler
- `python` interpreter

----
## Configurations

### default
```json
{
    "quickRunInTerminal.binaryOutputName": "",
    "quickRunInTerminal.C_compilerPath": "gcc",
    "quickRunInTerminal.clearBeforeRun": true,
    "quickRunInTerminal.Cpp_compilerPath": "g++",
    "quickRunInTerminal.Python_interpreterPath": "python",
    "quickRunInTerminal.saveAllFilesBeforeRun": false,
}
```
### Example
```json
{
    "quickRunInTerminal.Python_interpreterPath": "/home/user/bin/python3",
}
```
----

report bugs/issues here [github](https://github.com/AbrarShakhi/runccpp-vsce/issues)

<a href="https://www.flaticon.com/free-icons/coding" title="coding icons">Coding icons created by iconsmind - Flaticon</a>
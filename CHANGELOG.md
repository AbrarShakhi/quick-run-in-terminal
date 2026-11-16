# Quick run in Terminal Change Log

## Version [0.1.6]: Nov 16, 2026

- shows an error with an Open Settings button when a compiler or interpreter setting is empty.
- warns when the compiler or interpreter is not found, with Open Settings and Run anyway options.
- new setting stopPreviousRun: presses Ctrl+C in the Quick-Run terminal before a new run.
- Java now compiles into the source root and runs the main class by its full name.
- binaryOutputName no longer doubles the extension (app.exe stays app.exe).
- run from the Explorer or editor menu now runs the clicked file.
- commands are now built per shell (PowerShell, cmd, bash).
- files are fully saved before the run starts.
- renamed res/snapshorts to res/snapshots.
- updated package description and license.

## Version [0.1.5]: Jan 15, 2025

- fixed #14 run button missing for js, java and rust files
- fixed #13

## Version [0.1.4]: Jan 12, 2025

- new Rust and Java and JavaScript runner.
- fixed #10 typos in README.
- fixed #11 invalid issue link on README.

## Version [0.1.3]: Jan 06, 2025

- demo added in readme

## Version [0.1.2]: Jan 06, 2025

- fixed #7 shows unsuppoerted for `.c++` and `.c++` files
- `Quick run` button is now inside the run menu.

## Version [0.1.1]: Dec 26, 2025

- fixed #2 Not working for C on powershell and terminal not clear for bash on windows
- fixed when file starts with `(dot)` says language not supported.

## Version [0.1.0]: Dec 25, 2024

- Run button only shows when C/C++/Python file is open.

## Version [0.0.2]: Dec 25, 2024

- fixed #1 C/C++ file not running on windows powershell

## Version [0.0.1]: Dec 25, 2024

- Initial release

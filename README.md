# Embedd Project Manager

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/embedd-team.embedd-project-manager.svg)](https://marketplace.visualstudio.com/items?itemName=embedd-team.embedd-project-manager)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-Published-green)](https://open-vsx.org/extension/embedd-team/embedd-project-manager)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=embedd-team.embedd-project-manager)

VS Code extension for managing embedded projects. Simplifies setup and development of microcontroller projects.

- Automatic project setup for STM32 microcontrollers
- Debug configuration file generation (launch.json)
- Build tasks generation (tasks.json)
- C/C++ settings configuration (c_cpp_properties.json)
- CubeMX integration for STM32 projects
- OpenOCD support for debugging
- Management via VS Code sidebar

## Key Features

## Installation
The extension is installed via a vsix file.

## Usage

## Settings
1. Open the project folder in VS Code
2. Open the "Embedd Project Manager" sidebar
3. Click "Init current project" or use the command `Ctrl+Shift+P` and select "Embedd Project Manager: Init project"
4. Follow the instructions in the dialogs to configure the project

The extension provides the following settings:

- `EPMVSCodeExtension.CLT.path` - Path to the command line tools
- `EPMVSCodeExtension.CLT.findIocFiles` - Search for .ioc files in project folders (default true)
- `EPMVSCodeExtension.CLT.GenerateOpenOCD` - Use OpenOCD for project debugging (default false)

## Requirements
- VS Code version 1.106.1 or higher
- For STM32 projects: STM32CubeMX installed
- For debugging: OpenOCD (optional)

## License
The extension is distributed under the MIT license. See [LICENSE](LICENSE) for details.

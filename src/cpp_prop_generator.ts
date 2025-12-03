export function CreateCppPropertiesContent() {
    const data = {
        "version": 4,
        "configurations": [
            {
                "name": "EmbeddedProject",
                "includePath": [
                    "${default}",
                    "${workspaceFolder}/**"
                ],
                "configurationProvider": "ms-vscode.cmake-tools",
                "intelliSenseMode": "${default}",
                "compileCommands": "build/compile_commands.json"
            }
        ]
    };

    return data;
}
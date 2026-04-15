
export enum SettingsType {
    Project,
    CortexDebug,
    All
}

export function CreateSettingsContent(type: SettingsType = SettingsType.Project)
{
    let settings_data: any = {};

    switch (type) {
        case SettingsType.Project:
        default:
            settings_data = {
                "cmake.copyCompileCommands": "${workspaceFolder}/build/compile_commands.json",
                "C_Cpp.files.exclude": {
                    "build/**": true,
                },
                "files.watcherExclude": {
                    "build/**": true,
                },
                "search.exclude": {
                    "build/**": true,
                },
            };
            break;
        case SettingsType.CortexDebug:
            settings_data = {
                "cortex-debug.variableUseNaturalFormat": true,
            };
            break;
        case SettingsType.All:
            settings_data = {
                "cortex-debug.variableUseNaturalFormat": true,
                "cmake.copyCompileCommands": "${workspaceFolder}/build/compile_commands.json",
                "C_Cpp.files.exclude": {
                    "build/**": true,
                },
                "files.watcherExclude": {
                    "build/**": true,
                },
                "search.exclude": {
                    "build/**": true,
                },
            };
            break;
    }

    return settings_data;
}
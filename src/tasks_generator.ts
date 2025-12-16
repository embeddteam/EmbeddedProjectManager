import * as path from 'path';

import { findFiles } from './cubemx_handler';

interface TaskItem {
    type: string;
    label: string;
    command: string;
    args: string[];
    options?: {
        cwd: string;
    };
    problemMatcher?: string[];
    detail?: string;
    icon?: {
        id: string,
        color: string
    }
}

export function CreateTasksContent(workspaceFolder: string, isNeedAddCubeMx: boolean): object {
    let tasks_data = {
        version: '2.0.0',
        windows: {
            options: {
                shell: {
                    executable: "cmd.exe",
                    args: ["/d", "/c"]
                }
            }
        },
        tasks: [
            {
                type: "shell",
                label: "Build project",
                command: "cmake",
                args: ["--build", "${command:cmake.buildDirectory}", "--target", "${command:cmake.buildTargetName}"],
                options: {
                    cwd: "${workspaceFolder}"
                },
                problemMatcher: ["$gcc"],
                group: {
                    kind: "build",
                    isDefault: true
                },
                icon: {
                    id: "tools",
                    color: "terminal.ansiGreen"
                }
            },
            {
                type: "shell",
                label: "Clean project",
                command: "cmake",
                args: ["--build", "${command:cmake.buildDirectory}", "--target", "clean"],
                options: {
                    cwd: "${workspaceFolder}"
                },
                problemMatcher: [],
                icon: {
                    id: "trash",
                    color: "terminal.ansiRed"
                }
            },
            {
                type: "shell",
                label: "CubeProg: Flash project (SWD)",
                command: "STM32_Programmer_CLI",
                args: [
                    "--connect",
                    "port=swd",
                    "--download",
                    "${command:cmake.launchTargetPath}",
                    // Let CMake extension decide executable: "${command:cmake.launchTargetPath}",
                    "-hardRst", // Hardware reset - if rst pin is connected
                    "-rst", // Software reset (backup)
                    "--start" // Start execution
                ],
                options: {
                    "cwd": "${workspaceFolder}"
                },
                problemMatcher: [],
                icon: {
                    id: "flame",
                    color: "terminal.ansiRed"
                }
            },
            {
                label: "Build + Flash",
                dependsOrder: "sequence",
                dependsOn: [
                    "CMake: clean rebuild",
                    "CubeProg: Flash project (SWD)",
                ],
                icon: {
                    id: "flame",
                    color: "terminal.ansiRed"
                }
            },
            {
                type: "cmake",
                label: "CMake: clean rebuild",
                command: "cleanRebuild",
                targets: [
                    "all"
                ],
                preset: "${command:cmake.activeBuildPresetName}",
                group: "build",
                problemMatcher: [],
                detail: "CMake template clean rebuild task",
                icon: {
                    id: "sync",
                    color: "terminal.ansiGreen"
                }
            },
            {
                type: "shell",
                label: "CubeProg: List all available communication interfaces",
                command: "STM32_Programmer_CLI",
                args: ["--list"],
                options: {
                    cwd: "${workspaceFolder}"
                },
                problemMatcher: []
            }
        ] as TaskItem[],
        presentation: {
            clear: true
        }
    };


    if (isNeedAddCubeMx)
    {
        const iocFiles:string[] = findFiles(workspaceFolder, '.ioc');
        console.log(iocFiles);
        for (const item of iocFiles) {
            const cube_mx_task: TaskItem = {
                type: "shell",
                label: `Open STM32CubeMX for ${path.basename(item)}`,
                command: "start",
                args: [
                    `${item.replace('\\', '/')}`
                ],
                problemMatcher: [],
                detail: "Open STM32CubeMX for project",
                icon: {
                    id: "chip",
                    color: "terminal.ansiBlue"
                }
            };

            tasks_data.tasks.push(cube_mx_task);
        }
    }

    return tasks_data;
}
interface LaunchItem {
    name: string;
    cwd: string;
    type: string;
    executable: string;
    request: string;
    servertype: string;
    device?: string;
    interface?: string;
    serialNumber?: string;
    runToEntryPoint: string;
    svdFile: string;
    v1?: boolean;
    serverpath?: string;
    stm32cubeprogrammer?: string;
    stlinkPath?: string;
    armToolchainPath?: string;
    gdbPath?: string;
    serverArgs?: string[];
    preLaunchTask?: string;
    liveWatch?: {
        enabled: boolean;
        samplesPerSecond: number;
    };
    configFiles?: string[];
}


export function CreateLaunchContent(devices: string[], isStm32Device: boolean, isGenerateOpenOcd: boolean): object {
    let configurations: LaunchItem[] = [];

    let ready: boolean = false;

    if (isStm32Device) {
        if (devices.length > 0) {
            for (const device of devices) {
                // Парсим базовую часть: STM32 + серия (например, F429, H743, L476)
                // Поддерживаем шаблоны: STM32F429, STM32H743V, STM32MP157 (11 символов)
                const svd_name = device.match(
                    /^(STM32(?:MP\d{3}|WL\d{2}|[A-Z]\d{2,4}))/i
                );

                const stlinkConfig: LaunchItem = {
                    "name": `Cortex Debug for ${device} (ST-Link)`,
                    "cwd": "${workspaceFolder}",
                    "type": "cortex-debug",
                    "executable": "${command:cmake.launchTargetPath}",
                    "request": "launch",
                    "servertype": "stlink",
                    "device": device, //MCU used
                    "interface": "swd",
                    "serialNumber": "",        //Set ST-Link ID if you use multiple at the same time
                    "runToEntryPoint": "main",
                    "svdFile": `${svd_name ? `\${config:EPMVSCodeExtension.CLT.path}/STMicroelectronics_CMSIS_SVD/${svd_name[1]}.svd` : `\${config:EPMVSCodeExtension.CLT.path}/PathToSVD`}`,
                    "v1": false,               //Change it depending on ST Link version
                    "serverpath": "${config:EPMVSCodeExtension.CLT.path}/STLink-gdb-server/bin/ST-LINK_gdbserver",
                    "stm32cubeprogrammer": "${config:EPMVSCodeExtension.CLT.path}/STM32CubeProgrammer/bin",
                    "stlinkPath": "${config:EPMVSCodeExtension.CLT.path}/STLink-gdb-server/bin/ST-LINK_gdbserver",
                    "armToolchainPath": "${config:EPMVSCodeExtension.CLT.path}/GNU-tools-for-STM32/bin",
                    "gdbPath": "${config:EPMVSCodeExtension.CLT.path}/GNU-tools-for-STM32/bin/arm-none-eabi-gdb",
                    "serverArgs": [
                        "-m", "0",
                    ],
                    "liveWatch": {
                        "enabled": true,
                        "samplesPerSecond": 4
                    }
                };

                configurations.push(stlinkConfig);


                // Add OpenOCD support if needed
                if (isGenerateOpenOcd) {
                    const OpenOCDConfig: LaunchItem = {
                        "name": `Cortex Debug for ${device} (OpenOCD)`,
                        "cwd": "${workspaceFolder}",
                        "type": "cortex-debug",
                        "executable": "${command:cmake.launchTargetPath}",
                        "request": "launch",
                        "servertype": "openocd",
                        "device": device, //MCU used
                        "runToEntryPoint": "main",
                        "svdFile": `${svd_name ? `\${config:EPMVSCodeExtension.CLT.path}/STMicroelectronics_CMSIS_SVD/${svd_name[1]}.svd` : '\${config:EPMVSCodeExtension.CLT.path}/PathToSVD'}`,
                        "liveWatch": {
                            "enabled": true,
                            "samplesPerSecond": 4
                        },
                        "configFiles": []
                    };

                    configurations.push(OpenOCDConfig);
                }
            }
            ready = true;
        }

    }


    if (!ready) {
        const stlinkConfig: LaunchItem = {
            "name": `Cortex Debug (ST-Link)`,
            "cwd": "${workspaceFolder}",
            "type": "cortex-debug",
            "executable": "${command:cmake.launchTargetPath}",
            "request": "launch",
            "servertype": "stlink",
            "device": "Device Name", //MCU used
            "interface": "swd",
            "serialNumber": "",        //Set ST-Link ID if you use multiple at the same time
            "runToEntryPoint": "main",
            "svdFile": '\${config:EPMVSCodeExtension.CLT.path}/PathToSVD',
            "v1": false,               //Change it depending on ST Link version
            "serverpath": "${config:EPMVSCodeExtension.CLT.path}/STLink-gdb-server/bin/ST-LINK_gdbserver",
            "stm32cubeprogrammer": "${config:EPMVSCodeExtension.CLT.path}/STM32CubeProgrammer/bin",
            "stlinkPath": "${config:EPMVSCodeExtension.CLT.path}/STLink-gdb-server/bin/ST-LINK_gdbserver",
            "armToolchainPath": "${config:EPMVSCodeExtension.CLT.path}/GNU-tools-for-STM32/bin",
            "gdbPath": "${config:EPMVSCodeExtension.CLT.path}/GNU-tools-for-STM32/bin/arm-none-eabi-gdb",
            "serverArgs": [
                "-m", "0",
            ],
            "liveWatch": {
                "enabled": true,
                "samplesPerSecond": 4
            }
        };

        configurations.push(stlinkConfig);


        // Add OpenOCD support if needed
        if (isGenerateOpenOcd) {
            const OpenOCDConfig: LaunchItem = {
                "name": `Cortex Debug (OpenOCD)`,
                "cwd": "${workspaceFolder}",
                "type": "cortex-debug",
                "executable": "${command:cmake.launchTargetPath}",
                "request": "launch",
                "servertype": "openocd",
                "device": "Device Name", //MCU used
                "runToEntryPoint": "main",
                "svdFile": '\${config:EPMVSCodeExtension.CLT.path}/PathToSVD',
                "liveWatch": {
                    "enabled": true,
                    "samplesPerSecond": 4
                },
                "configFiles": []
            };

            configurations.push(OpenOCDConfig);
        }


    }
    return {
        version: "0.2.0",
        configurations: configurations
    };
}
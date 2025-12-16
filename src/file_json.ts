import * as vscode from 'vscode';

import * as fs from 'fs';

import * as path from 'path';

// Function to write JSON to file (overwrites if file exists)
export async function writeJsonFileSync(filePath: string, data: any): Promise<boolean> {
    try {
        const jsonContent = JSON.stringify(data, null, 2); // with indentation for readability
        if (!fs.existsSync(filePath)) {
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            fs.writeFileSync(filePath, jsonContent, 'utf8');
            vscode.window.showInformationMessage(`File created: ${filePath}`);
            console.log(`✅ File successfully written: ${filePath}`);
            return true;
        }
        else {
            const confirm = 'Yes';
            const cancel = 'No';

            const result = await vscode.window.showWarningMessage(
                `File ${path.basename(filePath)} already exists. Overwrite?`,
                { modal: true },
                confirm,
                cancel
            );


            console.log(result);
            if (result === confirm) {
                fs.writeFileSync(filePath, jsonContent, 'utf8');
                vscode.window.showInformationMessage(`File created: ${filePath}`);
                return true;
            }
            else if (result === cancel) {
                return false;
            }

        }

    } catch (error) {
        console.error('❌ Error writing file:', error);
        return false;
    }

    return false;
}
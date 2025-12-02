import * as vscode from 'vscode';

import * as fs from 'fs';

import * as path from 'path';

// Функция для записи JSON в файл (перезаписывает, если файл существует)
export async function writeJsonFileSync(filePath: string, data: any): Promise<boolean> {
    try {
        const jsonContent = JSON.stringify(data, null, 2); // с отступами для читаемости
        if (!fs.existsSync(filePath)) {
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            fs.writeFileSync(filePath, jsonContent, 'utf8');
            vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
            console.log(`✅ Файл успешно записан: ${filePath}`);
            return true;
        }
        else {
            const confirm = 'Да';
            const cancel = 'Нет';

            const result = await vscode.window.showWarningMessage(
                `Файл ${path.basename(filePath)}  уже существуют. Перезаписать?`,
                { modal: true },
                confirm,
                cancel
            );


            console.log(result);
            if (result === confirm) {
                fs.writeFileSync(filePath, jsonContent, 'utf8');
                vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
                return true;
            }
            else if (result === cancel) {
                return false;
            }

        }

    } catch (error) {
        console.error('❌ Ошибка записи файла:', error);
        return false;
    }

    return false;
}
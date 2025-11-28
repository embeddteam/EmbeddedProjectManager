// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';

import * as path from 'path';



// Функция для записи JSON в файл (перезаписывает, если файл существует)
function writeJsonFileSync(filePath: string, data: any): void {
	try {
		const jsonContent = JSON.stringify(data, null, 2); // с отступами для читаемости
		fs.writeFileSync(filePath, jsonContent, 'utf8');
		console.log(`✅ Файл успешно записан: ${filePath}`);
	} catch (error) {
		console.error('❌ Ошибка записи файла:', error);
	}
}

// Асинхронная версия (рекомендуется для production)
async function writeJsonFileAsync(filePath: string, data: any): Promise<void> {
	try {
		const jsonContent = JSON.stringify(data, null, 2);
		await fs.promises.writeFile(filePath, jsonContent, 'utf8');
		console.log(`✅ Файл успешно записан (async): ${filePath}`);
	} catch (error) {
		console.error('❌ Ошибка записи файла:', error);
	}
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('embeddedprojectmanager.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from HelloWorld!');
	});


	const generate_file = vscode.commands.registerCommand('embeddedprojectmanager.generateFile', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// Данные, которые нужно записать в JSON
		const data = {
			param1: 'Test',
			param2: 32,
		};

		// Проверяем, что есть открытая рабочая область
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Рабочая папка не открыта. Откройте папку в VS Code.');
			return;
		}

		// Берём корень первой рабочей папки
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;


		// Путь к файлу
		const filePath = path.join(workspaceRoot, '.vscode', 'test.json');


		try {
			// Убедимся, что папка .vscode существует
			if (!fs.existsSync(path.dirname(filePath))) {
				fs.mkdirSync(path.dirname(filePath), { recursive: true });
				// Записываем файл
				writeJsonFileSync(filePath, data);
				vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
			}
			else {
				console.log(`Папка .vscode уже существует`);

				const confirm = 'Да';
				const cancel = 'Нет';

				const result = vscode.window.showWarningMessage(
					'Файлы уже существуют. Перезаписать?',
					{ modal: true },
					confirm,
					cancel
				).then((result) => {
					console.log(result);
					if (result === confirm) {
						// Записываем файл
						writeJsonFileSync(filePath, data);
						vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
					}
					else if (result === cancel) {
						return;
					}
				});

			}

		} catch (err) {
			vscode.window.showErrorMessage(`Ошибка записи файла`);
			console.error(err);
		}

	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(generate_file);


	// Регистрируем TreeDataProvider
	const treeDataProvider = new MyTreeDataProvider(context);

	// Регистрируем TreeView
	const treeView = vscode.window.createTreeView('epmTreeView', {
		treeDataProvider,
		showCollapseAll: true
	});

	context.subscriptions.push(treeView);

}

// This method is called when your extension is deactivated
export function deactivate() { }


// Пример простого TreeDataProvider
class MyTreeDataProvider implements vscode.TreeDataProvider<MyTreeNode> {

	constructor(private context: vscode.ExtensionContext) { }

	getTreeItem(element: MyTreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: MyTreeNode): Thenable<MyTreeNode[]> {
		if (!element) {
			// Корневые элементы
			return Promise.resolve([
				new MyTreeNode('Init current project', vscode.TreeItemCollapsibleState.None, this.context, true),
			]);
		} else {
			// Дочерние элементы (если collapsible)
			return Promise.resolve([

			]);
		}
	}
}

class MyTreeNode extends vscode.TreeItem {
	constructor(
		public readonly label_text: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		context: vscode.ExtensionContext,
		isEnabled: boolean
	) {
		let descriptionText: string = '';

		if (!isEnabled) {
			descriptionText = label_text;
			label_text = '';
		}

		super(label_text, collapsibleState);

		this.description = descriptionText;

		this.tooltip = `${this.label}`;

		if (isEnabled) {
			this.command = {
				command: 'embeddedprojectmanager.generateFile',
				title: '',
				arguments: [this.label]
			};
		}
		else {
			this.command = undefined;
		}

		// Иконки из коллекции VS Code
		this.iconPath = new vscode.ThemeIcon('symbol-property');
	}
}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as path from 'path';

import { writeJsonFileSync } from './file_json';

import { CreateTasksContent } from './tasks_generator';

import { findIocFiles, extractSTM32BaseDeviceIdFromFile } from './cubemx_handler';

import { CreateLaunchContent } from './launch_generator';


async function ShowQyuickPick() {
	const items: vscode.QuickPickItem[] = [
		{ label: 'Создать файл', description: 'Создаёт новый файл' },
		{ label: 'Переименовать', description: 'Переименовывает текущий файл' },
		{ label: 'Запустить анализ', description: 'Запускает статический анализ' },
		{ label: 'Отмена', description: 'Ничего не делать' }
	];

	const selection = await vscode.window.showQuickPick(items, {
		placeHolder: 'Выберите действие...',
		title: 'Мои действия',
		canPickMany: false // или true, если нужно мультиселект
	});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const init_project = vscode.commands.registerCommand('embeddedprojectmanager.init_project', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		// Проверяем, что есть открытая рабочая область
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Рабочая папка не открыта. Откройте папку в VS Code.');
			return;
		}

		let isSTM32_Project: boolean = false;

		let STM32_Devices: string[] = [];

		// Берём корень первой рабочей папки
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

		const config = vscode.workspace.getConfiguration('EPMVSCodeExtension');

		const isNeedTofindIocFiles = config.get<boolean>('CLT.findIocFiles', true);

		const isNeedToGenerateOpenOCD = config.get<boolean>('CLT.GenerateOpenOCD', false);


		if (isNeedTofindIocFiles) {
			const ioc_files = findIocFiles(workspaceRoot);

			if (ioc_files.length > 0) {
				isSTM32_Project = true;

				for (const item of ioc_files) {
					const device = extractSTM32BaseDeviceIdFromFile(path.join(workspaceRoot, item));
					console.log(device);
					if (device !== null) {
						STM32_Devices.push(device);
					}
				}
			}

			console.log(STM32_Devices);
		}

		const launch_data = CreateLaunchContent(STM32_Devices, isSTM32_Project, isNeedToGenerateOpenOCD);

		const launchfilePath = path.join(workspaceRoot, '.vscode', 'launch.json');

		try {
			writeJsonFileSync(launchfilePath, launch_data);

		} catch (err) {
			vscode.window.showErrorMessage(`Ошибка записи файла ${launchfilePath}`);
			console.error(err);
		}

		const tasks_data = CreateTasksContent(workspaceRoot, isNeedTofindIocFiles);

		const tasksfilePath = path.join(workspaceRoot, '.vscode', 'tasks.json');

		try {
			writeJsonFileSync(tasksfilePath, tasks_data);

		} catch (err) {
			vscode.window.showErrorMessage(`Ошибка записи файла ${tasksfilePath}`);
			console.error(err);
		}

	});

	context.subscriptions.push(init_project);


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
class MyTreeDataProvider implements vscode.TreeDataProvider<ActionTreeNode> {

	constructor(private context: vscode.ExtensionContext) { }

	getTreeItem(element: ActionTreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ActionTreeNode): Thenable<ActionTreeNode[]> {
		if (!element) {
			// Корневые элементы
			return Promise.resolve([
				new ActionTreeNode('Init current project', vscode.TreeItemCollapsibleState.None, this.context, true),
			]);
		} else {
			// Дочерние элементы (если collapsible)
			return Promise.resolve([

			]);
		}
	}
}

class ActionTreeNode extends vscode.TreeItem {
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
				command: 'embeddedprojectmanager.init_project',
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
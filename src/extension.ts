// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';

import * as path from 'path';



// Функция для записи JSON в файл (перезаписывает, если файл существует)
function writeJsonFileSync(filePath: string, data: any): void {
	try {
		const jsonContent = JSON.stringify(data, null, 2); // с отступами для читаемости
		if (!fs.existsSync(filePath)) {
			if (!fs.existsSync(path.dirname(filePath))) {
				fs.mkdirSync(path.dirname(filePath), { recursive: true });
			}

			fs.writeFileSync(filePath, jsonContent, 'utf8');
			vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
			console.log(`✅ Файл успешно записан: ${filePath}`);
		}
		else {
			const confirm = 'Да';
			const cancel = 'Нет';

			vscode.window.showWarningMessage(
				`Файл ${path.basename(filePath)}  уже существуют. Перезаписать?`,
				{ modal: true },
				confirm,
				cancel
			).then((result) => {
				console.log(result);
				if (result === confirm) {
					fs.writeFileSync(filePath, jsonContent, 'utf8');
					vscode.window.showInformationMessage(`Файл создан: ${filePath}`);
				}
				else if (result === cancel) {
					return;
				}
			});
		}

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


	const generate_file = vscode.commands.registerCommand('embeddedprojectmanager.generateFile', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// Данные, которые нужно записать в JSON

		interface TaskItem
		{
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

		const cube_mx_task: TaskItem = {
			type: "shell",
			label: "Открыть STM32CubeMX для проекта",
			command: "start",
			args: [
				"RGB_WiFi_MatrixLamp_CPP.ioc"
			],
			problemMatcher: [],
			detail: "Открыть STM32CubeMX для проекта",
			icon: {
				id: "chip",
				color: "terminal.ansiBlue"
			}
		};



		tasks_data.tasks.push(cube_mx_task);



		// Проверяем, что есть открытая рабочая область
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Рабочая папка не открыта. Откройте папку в VS Code.');
			return;
		}

		// Берём корень первой рабочей папки
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;


		// Путь к файлу
		const filePath = path.join(workspaceRoot, '.vscode', 'tasks.json');


		try {
			writeJsonFileSync(filePath, tasks_data);

		} catch (err) {
			vscode.window.showErrorMessage(`Ошибка записи файла`);
			console.error(err);
		}

	});

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
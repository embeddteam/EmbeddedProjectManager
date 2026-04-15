// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as path from 'path';

import * as fs from 'fs';

import { writeJsonFileSync } from './file_json';

import { CreateTasksContent } from './tasks_generator';

import { findFiles, extractSTM32BaseDeviceIdFromFile } from './cubemx_handler';

import { CreateLaunchContent } from './launch_generator';

import { CreateWorkspaceContent } from './workspace_generator';

import { CreateSettingsContent, SettingsType } from './settings_generator';

import { CreateCppPropertiesContent } from './cpp_prop_generator';

import { CreateGitignoreContent } from './gitignore_generator';

import { checkForUpdates, scheduleAutoUpdateCheck } from './updater';


enum SettingsPlacementType {
	Workspace = 'workspace',
	Settings = 'settings',
	Cancel = 'cancel'
}


async function ChooseSettingsPlacement(): Promise<SettingsPlacementType> {

	const item_workspace = 'Save settings to workspace file';
	const item_settings = 'Save settings to project settings file';
	const item_cancel = 'Do not create settings';

	const items: vscode.QuickPickItem[] = [
		{ label: item_workspace, description: 'Save settings to .code-workspace file' },
		{ label: item_settings, description: 'Save settings to .vscode/settings.json file' },
		{ label: item_cancel, description: 'Do not create settings' }
	];

	// Add await to wait for the result
	const selection = await vscode.window.showQuickPick(items, {
		placeHolder: 'Select action...',
		title: 'Actions',
		canPickMany: false // or true if multi-select is needed
	});

	if (selection) {
		switch (selection.label) {
			case item_workspace:
				return SettingsPlacementType.Workspace;
			case item_settings:
				return SettingsPlacementType.Settings;
			case item_cancel:
				return SettingsPlacementType.Cancel;
		}
	}

	return SettingsPlacementType.Cancel;
}


async function InitWorkspace(workspaceRoot: string): Promise<string | undefined> {
	const result_files = findFiles(workspaceRoot, '.code-workspace');
	if (result_files.length === 1) {
		return result_files[0];
	}
	else {
		const confirm = 'Yes';

		const cancel = 'No';

		const filename = `${path.basename(workspaceRoot)}.code-workspace`;

		path.basename(workspaceRoot);

		const selection = await vscode.window.showInformationMessage(
			`Create workspace file ${filename}?`,
			{ modal: true },
			confirm,
			cancel
		);

		switch (selection) {
			case confirm:
				return filename;
			case cancel:
				return undefined;
		}
	}

	return undefined;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const init_project = vscode.commands.registerCommand('embedd-project-manager.init_project', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		// Check if a workspace is open
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder is open. Open a folder in VS Code.');
			return;
		}

		let isSTM32_Project: boolean = false;

		let STM32_Devices: string[] = [];

		// Берём корень первой рабочей папки
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

		const config = vscode.workspace.getConfiguration('EPMVSCodeExtension');

		const isNeedTofindIocFiles = config.get<boolean>('findIocFiles', true);

		const isNeedToGenerateOpenOCD = config.get<boolean>('GenerateOpenOCD', false);

		const workspaceFile = await InitWorkspace(workspaceRoot);

		let IsNeedToAddSettingsToGitignore = false;

		if (workspaceFile) {
			const settings_placement = await ChooseSettingsPlacement();

			switch (settings_placement) {
				case SettingsPlacementType.Workspace:
					{
						const settings = CreateSettingsContent(SettingsType.Project);
						const settings_json = CreateSettingsContent(SettingsType.CortexDebug);
						const workspace_json = CreateWorkspaceContent(settings);
						writeJsonFileSync(path.join(workspaceRoot, path.basename(workspaceFile)), workspace_json);
						writeJsonFileSync(path.join(workspaceRoot, '.vscode', 'settings.json'), settings_json);
						IsNeedToAddSettingsToGitignore = true;
					}
					break;

				case SettingsPlacementType.Settings:
					{
						const settings_json = CreateSettingsContent(SettingsType.All);
						const workspace_json = CreateWorkspaceContent(undefined);
						writeJsonFileSync(path.join(workspaceRoot, path.basename(workspaceFile)), workspace_json);
						writeJsonFileSync(path.join(workspaceRoot, '.vscode', 'settings.json'), settings_json);
					}

					break;
				case undefined:
				case SettingsPlacementType.Cancel:
					{
						const workspace_json = CreateWorkspaceContent(undefined);
						writeJsonFileSync(path.join(workspaceRoot, path.basename(workspaceFile)), workspace_json);
					}
					break;
			}
		}
		else {
			const confirm = 'Yes';

			const cancel = 'No';

			path.basename(workspaceRoot);

			const selection = await vscode.window.showInformationMessage(
				`Create settings file .vscode/settings.json?`,
				{ modal: true },
				confirm,
				cancel
			);

			switch (selection) {
				case confirm:
					const settings_json = CreateSettingsContent(SettingsType.All);
					writeJsonFileSync(path.join(workspaceRoot, '.vscode', 'settings.json'), settings_json);
					break;
				case cancel:

					break;
			}
		}


		if (isNeedTofindIocFiles) {
			const ioc_files = findFiles(workspaceRoot, '.ioc');

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

		writeJsonFileSync(launchfilePath, launch_data);

		const tasks_data = CreateTasksContent(workspaceRoot, isNeedTofindIocFiles);

		const tasksfilePath = path.join(workspaceRoot, '.vscode', 'tasks.json');

		writeJsonFileSync(tasksfilePath, tasks_data);

		const cpp_prop_data = CreateCppPropertiesContent();

		writeJsonFileSync(path.join(workspaceRoot, '.vscode', 'c_cpp_properties.json'), cpp_prop_data);

		let gitIgnoreAddons: string[] = [];

		if (fs.existsSync(path.join(workspaceRoot, '.vscode', 'settings.json')) && IsNeedToAddSettingsToGitignore) {
			const confirm = 'Yes';
			const cancel = 'No';

			const result = await vscode.window.showInformationMessage(
				`Add .vscode/settings.json to .gitignore?`,
				{ modal: true },
				confirm,
				cancel
			);

			if (result === confirm) {
				gitIgnoreAddons.push('.vscode/settings.json');
			}
		}


		const gitignore_data = CreateGitignoreContent(gitIgnoreAddons);

		fs.writeFileSync(path.join(workspaceRoot, '.gitignore'), gitignore_data, 'utf8');

		if (workspaceFile) {
			const workspaceUri = vscode.Uri.file(path.join(workspaceRoot, workspaceFile));

			const OpenCurrent = 'Open in current window';
			const OpenNew = 'Open in new window'; 
			// Offer to open workspace
			vscode.window.showInformationMessage(
				'Workspace created. Open it?',
				OpenCurrent,
				OpenNew
			).then(selection => {
				if (selection === OpenCurrent) {
					// true — open in current window (will reload window)
					vscode.commands.executeCommand('vscode.openFolder', workspaceUri, false);
				}
				if (selection === OpenNew) {
					// false — open in new window (don't reload window)
					vscode.commands.executeCommand('vscode.openFolder', workspaceUri, true);
				}
			});
		}

	});

	context.subscriptions.push(init_project);

	// Register check for updates command
	const checkUpdatesCmd = vscode.commands.registerCommand(
		'embedd-project-manager.check_updates',
		() => checkForUpdates(false)
	);
	context.subscriptions.push(checkUpdatesCmd);

	// Schedule automatic update check on startup
	scheduleAutoUpdateCheck(context);

	// Register TreeDataProvider
	const treeDataProvider = new MyTreeDataProvider(context);

	// Register TreeView
	const treeView = vscode.window.createTreeView('epmTreeView', {
		treeDataProvider,
		showCollapseAll: true
	});

	context.subscriptions.push(treeView);

}

// This method is called when your extension is deactivated
export function deactivate() { }


// Simple TreeDataProvider implementation
class MyTreeDataProvider implements vscode.TreeDataProvider<ActionTreeNode> {

	constructor(private context: vscode.ExtensionContext) { }

	getTreeItem(element: ActionTreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ActionTreeNode): Thenable<ActionTreeNode[]> {
		if (!element) {
			// Root elements
			return Promise.resolve([
				new ActionTreeNode('Init current project', vscode.TreeItemCollapsibleState.None, this.context, true, 'embedd-project-manager.init_project'),
				new ActionTreeNode('Check for updates', vscode.TreeItemCollapsibleState.None, this.context, true, 'embedd-project-manager.check_updates'),
			]);
		} else {
			// Child elements (if collapsible)
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
		isEnabled: boolean,
		commandId?: string
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
				command: commandId ?? 'embedd-project-manager.init_project',
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
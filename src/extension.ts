import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml'

export function activate(context: vscode.ExtensionContext) {
	const workspaceRoot =
  		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	let disposable = vscode.commands.registerCommand(
		'dart-copy-as-import.copy', 
		(fileUri: vscode.Uri) => {
			if (!workspaceRoot) {
				vscode.window.showErrorMessage('Unable to find pubspec.yaml, cannot copy file as import.');
				return;
			}

			const pubspecPath = path.join(workspaceRoot, 'pubspec.yaml');
			const pubspecStr: {[key: string]: any} = parse(fs.readFileSync(pubspecPath, 'utf-8'));

			if (pubspecStr.name == null) {
				vscode.window.showErrorMessage('Pubspec is missing name field, unable to locate package name and copy as import.');
				return;
			}

			const packageName: string = pubspecStr.name;
			
			const filePath = fileUri.path;
			const relPath = filePath.substring(workspaceRoot.length+1);

			if (!relPath.startsWith('lib/')) {
				vscode.window.showErrorMessage('File is not within the lib directory, unable to copy as package import.');
				return;
			}

			const importPath = `package:${packageName}/${relPath.substring('lib/'.length)}`

			vscode.env.clipboard.writeText(`import '${importPath}';`)
		}
	);

	context.subscriptions.push(disposable);
}
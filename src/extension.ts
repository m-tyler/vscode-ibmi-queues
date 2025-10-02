// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import ObjectProvider from './objectProvider';
import { Code4i } from './tools';
import { initializeSpooledFileBrowser } from './SpooledFileBrowser';
import { initializeSpooledFileSearchView } from './SpooledFileSearchResults';
import { initializeMessageQueueBrowser } from './messageQueueBrowser';
import { initializeMessageQueueSearchView } from './messageQueueSearchResults';
import { initializeUserJobBrowser } from './userJobsBrowser';
import { TempFileManager } from './tools/tempFileManager'; // Adjust path as 

let tempFileManager: TempFileManager;
// let globalContext: vscode.ExtensionContext;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	tempFileManager = new TempFileManager();
	await Code4i.initialize(context);
	initializeSpooledFileBrowser(context, tempFileManager);
	await initializeSpooledFileSearchView(context);
	initializeMessageQueueBrowser(context);
	await initializeMessageQueueSearchView(context);
	initializeUserJobBrowser(context);
	console.log(`Congratulations, extension "${context.extension.packageJSON.description}", "Version" :"${context.extension.packageJSON.version}" is now active!`);

}

// this method is called when your extension is deactivated
export function deactivate() {
	// Clean up temporary files when the extension deactivates
	if (tempFileManager) {
		tempFileManager.cleanUpTempFiles();
	}
}
// export function getGlobalContext(): vscode.ExtensionContext {
// 	return globalContext;
// }
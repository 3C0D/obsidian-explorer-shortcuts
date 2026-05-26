import type ExplorerShortcuts from './main.ts';
import { getElPath, getHoveredElement } from './utils.ts';
import * as path from 'path';

export async function showInOsExplorer(
	plugin: ExplorerShortcuts,
	isOverExplorerNavContainer = false
): Promise<void> {
	if (!isOverExplorerNavContainer) return;

	let path = '/';
	const hoveredElement = getHoveredElement(plugin);
	if (hoveredElement) {
		path = getElPath(hoveredElement);
	}

	openDirectoryInFileManager(plugin, path);
}

async function openDirectoryInFileManager(
	plugin: ExplorerShortcuts,
	filePath: string
): Promise<void> {
	const shell = window.electron.shell;
	if (path.extname(filePath) !== '') {
		filePath = path.dirname(filePath);
	}
	const vaultPath = plugin.app.vault.adapter.basePath;
	const dirPath = path.join(vaultPath, filePath);
	try {
		shell.showItemInFolder(dirPath);
	} catch (err) {
		console.log(err);
	}
}

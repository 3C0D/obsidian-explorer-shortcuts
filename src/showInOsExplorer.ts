import type ExplorerShortcuts from './main.ts';
import { getElPath, getHoveredElement } from './utils.ts';
import * as path from 'path';

export async function showInOsExplorer(
	plugin: ExplorerShortcuts,
	isOverExplorerNavContainer = false
): Promise<void> {
	if (!isOverExplorerNavContainer) return;

	let filePath = '/';
	const hoveredElement = getHoveredElement(plugin);
	if (hoveredElement) {
		filePath = getElPath(hoveredElement);
	}

	openDirectoryInFileManager(plugin, filePath);
}

async function openDirectoryInFileManager(
	plugin: ExplorerShortcuts,
	filePath: string
): Promise<void> {
	const shell = window.electron.shell;
	const vaultPath = plugin.app.vault.adapter.basePath;

	const targetDir = path.extname(filePath) !== ''
		? path.join(vaultPath, path.dirname(filePath)) // file → open its parent dir
		: path.join(vaultPath, filePath);               // folder → open it directly

	try {
		shell.openPath(targetDir);
	} catch (err) {
		console.error('[ExplorerShortcuts] openDirectoryInFileManager:', err);
	}
}

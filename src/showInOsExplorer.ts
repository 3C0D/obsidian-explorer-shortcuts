import type ExplorerShortcuts from './main.ts';
import { TFolder } from 'obsidian';
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

	// Use Obsidian's vault metadata instead of path.extname, which gives false
	// positives for folders whose names contain a dot (e.g. "v1.2", "my.project").
	const isFolder =
		filePath === '/' ||
		plugin.app.vault.getAbstractFileByPath(filePath) instanceof TFolder;

	const targetDir = isFolder
		? path.join(vaultPath, filePath)               // folder → open it directly
		: path.join(vaultPath, path.dirname(filePath)); // file → open its parent dir

	try {
		await shell.openPath(targetDir);
	} catch (err) {
		console.error('[ExplorerShortcuts] openDirectoryInFileManager:', err);
	}
}

import { exec } from 'child_process';
import type ExplorerShortcuts from './main.js';
import { getElPath, getHoveredElement } from './utils.js';
import * as path from 'path';
import { Platform } from 'obsidian';

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
		if (Platform.isWin) {
			exec(`explorer.exe /select,"${dirPath.replace(/\//g, '\\')}"`);
		} else {
			shell.showItemInFolder(dirPath);
		}
	} catch (err) {
		console.log(err);
	}
}

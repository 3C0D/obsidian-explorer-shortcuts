import { type App, Notice, TFile, TFolder } from 'obsidian';
import type ExplorerShortcuts from './main.ts';
import { confirmation } from './modals/confirmation.ts';
import { getExplorerView, getHoveredElement, getElPath, triggerMouseMove } from './utils.ts';

export async function deleteItem(
	plugin: ExplorerShortcuts,
	e: KeyboardEvent
): Promise<boolean> {
	let confirmed = true;
	const view = getExplorerView(plugin);
	const tree = view?.tree;
	if (!tree) return false;

	const hovered = getHoveredElement(plugin);
	const path = getElPath(hovered) || '/';
	const hoveredItem = view.fileItems[path];
	if (!hoveredItem) return false;

	const itemFile = hoveredItem.file;
	if (
		itemFile instanceof TFile &&
		hoveredItem.el.children[0].classList.contains('has-focus')
	)
		return false; // to allow default obsidian delete

	if (plugin.settings.delConfirmFile && itemFile instanceof TFile) {
		confirmed = await getConfirmed(plugin.app, itemFile);
	} else if (plugin.settings.delConfirmFolder && itemFile instanceof TFolder) {
		const isFolderEmpty = itemFile.children.length === 0;
		if (!isFolderEmpty) {
			confirmed = await getConfirmed(plugin.app, itemFile);
		}
	}

	if (!confirmed) return false;

	tree.selectItem(hoveredItem);
	tree.handleDeleteSelectedItems(e);
	let text = 'Folder';
	if (itemFile instanceof TFile) {
		text = 'File';
	} else if ((itemFile as TFolder).children.length === 0) {
		text = 'Empty folder';
	}
	new Notice(`${text} removed: ` + itemFile.name, 3500);
	return true;
}

async function getConfirmed(app: App, itemFile: TFile | TFolder): Promise<boolean> {
	return confirmation(app, 'Are you sure you want to delete ' + itemFile.name + '?');
}

export function triggerDelete(plugin: ExplorerShortcuts): void {
	// Refresh selected elements after deletion
	triggerMouseMove(plugin);
	// Uses the same timer slot cleaned up in onunload()
	plugin.mouseMoveDebounceTimer = setTimeout(() => {
		triggerMouseMove(plugin);
		plugin.mouseMoveDebounceTimer = null;
	}, 150);
}

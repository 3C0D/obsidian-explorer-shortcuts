import { copy, cut, resetOperations } from './cut-copy.ts';
import { deleteItem, triggerDelete } from './delete.ts';
import { navigateOverExplorer } from './navigateOverExplorer.ts';
import { createNewItem } from './newFileFolder.ts';
import { paste } from './paste.ts';
import { rename } from './rename.ts';
import { reveal, toggleCollapse } from './toggleCollapse.ts';
import { isOverExplorerNavContainer, getHoveredElement, getElPath } from './utils.ts';
import type ExplorerShortcuts from './main.ts';
import { showExplorerShortcutsModal } from './modals/modal.ts';
import { showInOsExplorer } from './showInOsExplorer.ts';
import { Notice, TFile } from 'obsidian';

const SPACE_COMBOS = [
	'n',
	'f',
	'r',
	'v',
	'w',
	'h',
	'o',
	'x',
	'c',
	'Delete',
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight'
];

function resetSpaceState(plugin: ExplorerShortcuts): void {
	plugin.spacePressed = false;
	plugin.pendingSpaceCombos = {};
	plugin.blockedKeys = {};
}

// Map space combinations to their action handlers
const spaceComboHandlers: Record<
	string,
	(plugin: ExplorerShortcuts, e: KeyboardEvent) => void | Promise<void>
> = {
	ArrowLeft: (p) => toggleCollapse(p),
	ArrowRight: (p) => {
		const file = p.app.workspace.getActiveFile();
		if (file) reveal(p, file);
	},
	ArrowUp: (p) => navigateOverExplorer(p, 'up'),
	ArrowDown: (p) => navigateOverExplorer(p, 'down'),
	n: (p) => createNewItem(p, 'file'),
	f: (p) => createNewItem(p, 'folder'),
	o: (p) => showInOsExplorer(p, true),
	h: (p) => showExplorerShortcutsModal(p.app),
	x: (p) => cut(p),
	c: (p) => copy(p),
	v: (p) => paste(p),
	Delete: async (p, e) => {
		const deleted = await deleteItem(p, e);
		if (deleted) {
			triggerDelete(p);
		}
	},
	r: async (p, e) => {
		p.renaming = true;
		await rename(p, e);
	},
	w: (p) => openInNewWindow(p)
};

export async function keyUp(this: ExplorerShortcuts, e: KeyboardEvent): Promise<void> {
	// Clear pending Space combinations when not over explorer
	if (!isOverExplorerNavContainer(this)) {
		resetSpaceState(this);
	}

	if (!this.shouldProcessKeyUp || !isOverExplorerNavContainer(this)) {
		return;
	}

	const beingRenamed = this.elementFromPoint?.closest('.is-being-renamed');

	if (beingRenamed) {
		if (this.blockedKeys[e.key]) {
			delete this.blockedKeys[e.key];
		}
	}

	if (e.key === 'Escape') {
		resetOperations(this);
		// Clear pending Space combinations
		resetSpaceState(this);
	}

	if (this.renaming || this.isEditingNewItem) {
		resetSpaceState(this);
		return;
	}

	// Handle Space combinations - only if we're over explorer
	if (isOverExplorerNavContainer(this)) {
		if (e.key === 'F2') {
			this.renaming = true;
			await rename(this, e);
		} else {
			const handler = spaceComboHandlers[e.key];
			if (handler && this.pendingSpaceCombos[e.key]) {
				this.pendingSpaceCombos[e.key] = false;
				await handler(this, e);
			}
		}
	}

	// Reset space state when space is released
	if (e.key === ' ') {
		this.spacePressed = false;
	}
}

export function keyDown(this: ExplorerShortcuts, e: KeyboardEvent): void {
	if (!isOverExplorerNavContainer(this)) return;

	// Check if any modal is open
	const isModalOpen = document.querySelector('.modal');
	if (isModalOpen) return;

	// During renaming or creating new items, prevent all shortcuts from working
	if (this.renaming || this.isEditingNewItem) {
		resetSpaceState(this);
		return;
	}

	// Track space key state
	if (e.key === ' ') {
		this.spacePressed = true;
	}

	// Detect Space combinations and mark them as pending
	if (this.spacePressed && SPACE_COMBOS.includes(e.key)) {
		this.pendingSpaceCombos[e.key] = true;
	}

	if (keysToBlock(e.key, this.spacePressed)) {
		e.preventDefault();
		this.blockedKeys[e.key] = true;
		this.shouldProcessKeyUp = true;
	} else {
		this.shouldProcessKeyUp = false;
		return;
	}
}

function keysToBlock(key: string, spacePressed: boolean): boolean {
	// F2 and Escape still work alone for compatibility
	const alwaysBlockedKeys = ['F2', 'Escape', ' '];

	return (
		alwaysBlockedKeys.includes(key) || (spacePressed && SPACE_COMBOS.includes(key))
	);
}

async function openInNewWindow(plugin: ExplorerShortcuts): Promise<void> {
	const hoveredElement = getHoveredElement(plugin);
	if (!hoveredElement) return;

	const path = getElPath(hoveredElement);
	if (!path) return;

	const file = plugin.app.vault.getAbstractFileByPath(path);
	if (!(file instanceof TFile)) return;

	// Create a new window
	const newLeaf = plugin.app.workspace.getLeaf('window');
	if (!newLeaf) return;

	// Open the file in the new window
	try {
		await newLeaf.openFile(file);
	} catch {
		new Notice('Failed to open file in new window');
	}
}

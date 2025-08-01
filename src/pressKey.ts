import { copy, cut, resetOperations } from "./cut-copy.js";
import { deleteItem, triggerDelete } from "./delete.js";
import { navigateOverExplorer } from "./navigateOverExplorer.js";
import { createNewItem } from "./newFileFolder.js";
import { paste } from "./paste.js";
import { rename } from "./rename.js";
import { reveal, toggleCollapse } from "./toggleCollapse.js";
import { isOverExplorerNavContainer, getHoveredElement, getElPath } from "./utils.js";
import ExplorerShortcuts from "./main.js";
import { showExplorerShortcutsModal } from "./modal.js";
import { showInOsExplorer } from "./showInOsExplorer.js";
import { Notice, TFile } from "obsidian";

let goToUp = false; // don't run up if not good key

export async function keyUp(this: ExplorerShortcuts, e: KeyboardEvent): Promise<void> {
    // Clear pending Space combinations when not over explorer
    if (!isOverExplorerNavContainer(this)) {
        this.pendingSpaceCombos = {};
        this.spacePressed = false;
    }

    if (!goToUp || !isOverExplorerNavContainer(this)) {
        return;
    }

    const beingRenamed = this.elementFromPoint?.closest(".is-being-renamed");

    if (beingRenamed) {
        if (this.blockedKeys[e.key]) {
            delete this.blockedKeys[e.key];
        }
    }

    if (e.key === 'Escape') {
        resetOperations(this);
        // Clear pending Space combinations
        this.pendingSpaceCombos = {};
        this.spacePressed = false;
    }

    if (this.renaming || this.isEditingNewItem) {
        this.blockedKeys = {};
        this.pendingSpaceCombos = {};
        this.spacePressed = false;
        return;
    }

    if (e.key === 'ArrowLeft') {
        toggleCollapse(this);
    }
    if (e.key === 'ArrowRight') {
        reveal(this);
    }
    if (e.key === 'ArrowUp') {
        await navigateOverExplorer(this, "up");
    }
    if (e.key === 'ArrowDown') {
        await navigateOverExplorer(this, "down");
    }
    // Handle Space combinations - only if we're over explorer
    if (isOverExplorerNavContainer(this)) {
        if (e.key === 'n' && this.pendingSpaceCombos['n']) {
            this.pendingSpaceCombos['n'] = false;
            await createNewItem(this, "file");
        }
        if (e.key === 'f' && this.pendingSpaceCombos['f']) {
            this.pendingSpaceCombos['f'] = false;
            await createNewItem(this, "folder");
        }
        if (e.key === 'o' && this.pendingSpaceCombos['o']) {
            this.pendingSpaceCombos['o'] = false;
            await showInOsExplorer(this, true);
        }
        if (e.key === 'h' && this.pendingSpaceCombos['h']) {
            this.pendingSpaceCombos['h'] = false;
            showExplorerShortcutsModal(this.app);
        }
    }
    if (!this.elementFromPoint?.closest(".tree-item")) return;

    // Handle Space combinations that require tree-item - only if we're over explorer
    if (isOverExplorerNavContainer(this)) {
        if ((e.key === 'r' && this.pendingSpaceCombos['r']) || e.key === 'F2') {
            if (e.key === 'r') this.pendingSpaceCombos['r'] = false;
            this.renaming = true;
            await rename(this, e);
        }
        if (e.key === 'x') {
            cut(this);
        }
        if (e.key === 'c') {
            copy(this);
        }
        if (e.key === 'v' && this.pendingSpaceCombos['v']) {
            this.pendingSpaceCombos['v'] = false;
            await paste(this);
        }
        if (e.key === 'w' && this.pendingSpaceCombos['w']) {
            this.pendingSpaceCombos['w'] = false;
            await openInNewWindow(this);
        }
    }
    if (e.key === 'Delete') {
        await deleteItem(this, e);
        triggerDelete(this, e);
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

    if (this.renaming || this.isEditingNewItem) return;

    // Track space key state
    if (e.key === ' ') {
        this.spacePressed = true;
    }

    // Detect Space combinations and mark them as pending
    if (this.spacePressed && ['n', 'f', 'r', 'v', 'w', 'h', 'o'].includes(e.key)) {
        this.pendingSpaceCombos[e.key] = true;
    }

    if (keysToBlock(e.key, this.spacePressed)) {
        e.preventDefault();
        this.blockedKeys[e.key] = true;
        goToUp = true;
    } else {
        goToUp = false;
        return;
    }
}

function keysToBlock(key: string, spacePressed: boolean): boolean {
    // Keys that always block (no Space needed)
    const alwaysBlockedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F2', 'Escape', 'Delete', 'x', 'c', ' '];

    // Keys that only block when Space is pressed
    const spaceBlockedKeys = ['n', 'r', 'v', 'f', 'w', 'h', 'o'];

    return alwaysBlockedKeys.includes(key) || (spacePressed && spaceBlockedKeys.includes(key));
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
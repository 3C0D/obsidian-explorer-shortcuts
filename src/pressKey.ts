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
    if (!goToUp || !isOverExplorerNavContainer(this)) return;

    const beingRenamed = this.elementFromPoint?.closest(".is-being-renamed");

    if (beingRenamed) {
        if (this.blockedKeys[e.key]) {
            delete this.blockedKeys[e.key];
        }
    }

    if (e.key === 'Escape') {
        resetOperations(this);
    }

    if (this.renaming || this.isEditingNewItem) {
        this.blockedKeys = {};
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
    if (e.key === 'n') {
        await createNewItem(this, "file");
    }
    if (e.key === 'f') {
        await createNewItem(this, "folder");
    }
    if (e.key === 'o') {
        await showInOsExplorer(this, true);
    }
    if (e.key === 'h') {
        showExplorerShortcutsModal(this.app);
    }
    if (!this.elementFromPoint?.closest(".tree-item")) return;
    if (e.key === 'r' || e.key === 'F2') {
        this.renaming = true;
        await rename(this, e);
    }
    if (e.key === 'x') {
        cut(this);
    }
    if (e.key === 'c') {
        copy(this);
    }
    if (e.key === 'v') {
        await paste(this);
    }
    if (e.key === 'Delete') {
        await deleteItem(this, e);
        triggerDelete(this, e);
    }
    if (e.key === 'w') {
        await openInNewWindow(this);
    }
}

export function keyDown(this: ExplorerShortcuts, e: KeyboardEvent): void {
    if (!isOverExplorerNavContainer(this)) return;

    // Check if any modal is open
    const isModalOpen = document.querySelector('.modal');
    if (isModalOpen) return;

    if (this.renaming || this.isEditingNewItem) return;

    if (keysToBlock(e.key)) {
        e.preventDefault();
        this.blockedKeys[e.key] = true;
        goToUp = true;
    } else {
        goToUp = false;
        return;
    }
}

function keysToBlock(key: string): boolean {
    const blockedKeysList = ['n', 'r', 'x', 'c', 'q', 'v', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'f', 'F2', 'Escape', 'Delete', 'w', 'h', 'o'];
    return blockedKeysList.includes(key);
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
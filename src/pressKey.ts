import { copy, cut, resetOperations } from "./cut-copy";
import { deleteItem, triggerDelete } from "./delete";
import { navigateOverExplorer } from "./navigateOverExplorer";
import { createNewItem } from "./newFileFolder";
import { paste } from "./paste";
import { rename } from "./rename"
import { reveal, toggleCollapse } from "./toggleCollapse";
import { isOverExplorerNavContainer, getHoveredElement, getElPath } from "./utils";
import ExplorerShortcuts from "./main";
import { showExplorerShortcutsModal } from "./modal";
import { showInOsExplorer } from "./showInOsExplorer";
import { Notice, TFile } from "obsidian";

let goToUp = false // don't run up if not good key

export async function keyUp(e: KeyboardEvent) {
    if (!goToUp || !isOverExplorerNavContainer(this)) return;

    const beingRenamed = this.elementFromPoint?.closest(".is-being-renamed")

    if (beingRenamed) {
        if (this.blockedKeys[e.key]) {
            delete this.blockedKeys[e.key];
        }
    }

    if (e.key === 'Escape') {
        resetOperations(this)
    }

    if (this.renaming || this.isEditingNewItem) {
        this.blockedKeys = {}
        return
    }

    if (e.key === 'ArrowLeft') {
        toggleCollapse()
    }
    if (e.key === 'ArrowRight') {
        reveal(this)
    }
    if (e.key === 'ArrowUp') {
        await navigateOverExplorer(this, "up");
    }
    if (e.key === 'ArrowDown') {
        await navigateOverExplorer(this, "down");
    }
    if (e.key === 'n') {
        await createNewItem(this, "file")
    }
    if (e.key === 'f') {
        await createNewItem(this, "folder")
    }
    if (e.key === 'o') {
        await showInOsExplorer(this, true)
    }
    if (e.key === 'h') {
        showExplorerShortcutsModal(this.app);
    }

    if (!this.elementFromPoint?.closest(".tree-item")) return
    if (e.key === 'r' || e.key === 'F2') {
        this.renaming = true
        await rename(this, e)
    }
    if (e.key === 'x') {
        cut(this)
    }
    if (e.key === 'c') {
        copy(this)
    }
    if (e.key === 'v') {
        await paste(this)
    }
    if (e.key === 'Delete') {
        await deleteItem(this, e)
        triggerDelete(this, e)
    }
    if (e.key === 'w') {
        await openInNewWindow(this);
    }
}

export function keyDown(e: KeyboardEvent) {
    if (!isOverExplorerNavContainer(this)) return;

    // Check if any modal is open
    const isModalOpen = document.querySelector('.modal');
    if (isModalOpen) return;

    if (this.renaming || this.isEditingNewItem) return

    if (keysToBlock(e.key)) {
        e.preventDefault();
        this.blockedKeys[e.key] = true;
        goToUp = true;
    } else {
        goToUp = false;
        return
    }
}

function keysToBlock(key: string) {
    const blockedKeysList = ['n', 'r', 'x', 'c', 'q', 'v', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'f', 'F2', 'Escape', 'Delete', 'w', 'h', 'o'];
    return blockedKeysList.includes(key);
}


async function openInNewWindow(plugin: ExplorerShortcuts) {
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
    } catch (error) {
        new Notice('Failed to open file in new window');
    }
}
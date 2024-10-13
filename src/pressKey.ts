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

export async function keyUp(e: KeyboardEvent) {
    if (!isOverExplorerNavContainer(this)) return;

    const beingRenamed = this.elementFromPoint?.closest(".is-being-renamed")

    if (beingRenamed) {
        if (this.blockedKeys[e.key]) {
            delete this.blockedKeys[e.key];
        }
    }

    if (e.key === 'Escape') {
        resetOperations(this)
    }

    if (this.renaming) {
        this.blockedKeys = {}
        return
    }

    if (e.key === 'ArrowLeft') {
        toggleCollapse()
    }
    if (e.key === 'ArrowRight') {
        reveal(this)
    }

    if (!this.elementFromPoint?.closest(".nav-files-container")) return;

    if (e.key === 'ArrowUp') {
        await navigateOverExplorer(this, "up");
    }
    if (e.key === 'ArrowDown') {
        await navigateOverExplorer(this, "down");
    }

    if (!this.elementFromPoint?.closest(".tree-item")) return

    if (e.key === 'r' || e.key === 'F2') {
        this.renaming = true
        await rename(this, e)
    }
    if (e.key === 'n') {
        await createNewItem(this, "file")
    }
    if (e.key === 'f') {
        await createNewItem(this, "folder")
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
        const hoveredElement = getHoveredElement(this);
        await openInNewWindow(this, hoveredElement);
    }
    if (e.key === 'h') {
        showExplorerShortcutsModal(this.app);
    }

}

export function keyDown(e: KeyboardEvent) {
    if (!isOverExplorerNavContainer(this)) return;

    if (this.renaming) return
    if (keysToBlock(e.key)) {
        e.preventDefault();
        this.blockedKeys[e.key] = true;
    }
}

function keysToBlock(key: string) {
    const blockedKeysList = ['n', 'r', 'x', 'c', 'q', 'v', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'f', 'F2', 'Escape', 'Delete', 'w', 'h'];
    return blockedKeysList.includes(key);
}


async function openInNewWindow(
    plugin: ExplorerShortcuts,
    next: Element | null
) {
    const path = getElPath(next);
    if (!path) return;

    const item = plugin.app.vault.getFileByPath(path);
    if (!item) return;

    const newLeaf = plugin.app.workspace.getLeaf('window');
    if (!newLeaf) return;

    await newLeaf.openFile(item);
}
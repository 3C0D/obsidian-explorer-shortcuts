import { Notice, TFile, TFolder } from "obsidian"
import ExplorerShortcuts from "./main"
import { getElPath, getExplorerView, getHoveredElement } from "./utils"
import { confirmation } from "./modal";

export async function deleteItem(plugin: ExplorerShortcuts, e: KeyboardEvent) {
    let confirmed = true
    const view = getExplorerView(plugin);
    const tree = view?.tree;
    if (!tree) return;

    const hovered = getHoveredElement(plugin)
    const path = getElPath(hovered) || '/'
    const hoveredItem = view.fileItems[path]
    if (!hoveredItem) return

    const itemFile = hoveredItem.file
    if (itemFile instanceof TFile && hoveredItem.el.children[0].classList.contains("has-focus")) return // to allow default obsidian delete

    if (plugin.settings.delConfirmFile && itemFile instanceof TFile) {
        confirmed = await getConfirmed(itemFile)
    } else if (plugin.settings.delConfirmFolder && itemFile instanceof TFolder) {
        const isFolderEmpty = itemFile.children.length === 0;
        if (!isFolderEmpty) {
            confirmed = await getConfirmed(itemFile);
        }
    }

    if (!confirmed) return

    tree.selectItem(hoveredItem);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tree.handleDeleteSelectedItems(e);
    const text = itemFile instanceof TFile ? "File" : "Folder"
    new Notice(`${text} removed: ` + itemFile.name, 3500)
    return
}

async function getConfirmed(itemFile: TFile | TFolder) {
    return confirmation(" Are you sure you want to delete " + itemFile.name + "?")
}

export function triggerDelete(plugin: ExplorerShortcuts, evt: KeyboardEvent) {
    // trigger a mouse move event to refresh the selectedElements
    const e = new MouseEvent('mousemove', { clientX: plugin.mousePosition.x + 1, clientY: plugin.mousePosition.y + 1 });
    setTimeout(() => {
        document.dispatchEvent(e);
    }, 70);
}

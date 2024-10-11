import { TFile, TFolder } from "obsidian";
import ExplorerShortcuts from "./main";
import { getElPath, getExplorerView, getHoveredElement } from "./utils";

export async function createNewItem(plugin: ExplorerShortcuts, type: 'file' | 'folder') {
    const view = getExplorerView(plugin);
    if (!view) return
    const hovered = getHoveredElement(plugin)
    const path = getElPath(hovered) || '/'
    const hoveredItem = view.fileItems[path]
    let file = hoveredItem.file
    const kind = file instanceof TFile ? "file" : "folder";
    if (kind === "file") {
        const parentPath = file.parent?.path ?? "/"
        file = this.app.vault.getAbstractFileByPath(parentPath)
    }
    view.createAbstractFile(type, file as TFolder, true);
}
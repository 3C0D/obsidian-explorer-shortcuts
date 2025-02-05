import { TFile, TFolder } from "obsidian";
import ExplorerShortcuts from "./main";
import { getElPath, getExplorerView, getHoveredElement } from "./utils";

export async function createNewItem(plugin: ExplorerShortcuts, type: 'file' | 'folder') {
    const view = getExplorerView(plugin);
    if (!view) return;

    const hovered = getHoveredElement(plugin);
    const path = getElPath(hovered) || '/';

    let targetFolder: TFolder;

    if (path === '/') {
        targetFolder = plugin.app.vault.getRoot();
    } else {
        const hoveredItem = view.fileItems[path];
        const file = hoveredItem.file;

        if (file instanceof TFile) {
            targetFolder = file.parent || plugin.app.vault.getRoot();
        } else if (file instanceof TFolder) {
            targetFolder = file;
        } else {
            targetFolder = plugin.app.vault.getRoot();
        }
    }
    
    view.createAbstractFile(type, targetFolder, true);
}
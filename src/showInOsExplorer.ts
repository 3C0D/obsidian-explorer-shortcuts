import { FileView } from "obsidian";
import ExplorerShortcuts from "./main.js";
import { getElPath, getHoveredElement, isOverEditor } from "./utils.js";
import * as path from "path";

export async function showInOsExplorer(plugin: ExplorerShortcuts, isOverExplorerNavContainer = false): Promise<void> {
    let path = "/";
    if (isOverExplorerNavContainer) {
        const hoveredElement = getHoveredElement(plugin);
        if (hoveredElement) {
            path = getElPath(hoveredElement);
        }
    } else if (isOverEditor(plugin)) {
        const activeLeaf = plugin.app.workspace.getLeaf(false);
        if (activeLeaf) {
            path = (activeLeaf.view as FileView).file?.path || "/";
        }
    } else return;
    openDirectoryInFileManager.call(plugin, path);
}

async function openDirectoryInFileManager(filePath: string): Promise<void> {
    const shell = window.electron.shell;
    if (path.extname(filePath) !== "") {
        filePath = path.dirname(filePath);
    }
    let dirPath = filePath;
    const vaultPath = this.app.vault.adapter.basePath;
    dirPath = path.join(vaultPath, filePath);

    try {
        await shell.openPath(dirPath);
    } catch (err) {
        console.log(err);
    }
}

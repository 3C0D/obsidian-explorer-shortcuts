import ExplorerShortcuts from "./main.js";
import { getElPath, getHoveredElement } from "./utils.js";
import * as path from "path";

export async function showInOsExplorer(plugin: ExplorerShortcuts, isOverExplorerNavContainer = false): Promise<void> {
    if (!isOverExplorerNavContainer) return;

    let path = "/";
    const hoveredElement = getHoveredElement(plugin);
    if (hoveredElement) {
        path = getElPath(hoveredElement);
    }

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

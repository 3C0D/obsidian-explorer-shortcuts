import { normalizePath, TFile, TFolder, Notice } from "obsidian";
import * as path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getExplorerFileItems, getHoveredElement, getPathEls } from "./utils";
import { FileTreeItem, TreeItem } from "obsidian-typings";
import { confirm } from "./modal";

export async function paste(plugin: ExplorerShortcuts) {
    const items = getExplorerFileItems(plugin);
    const copyItems = items.filter(item => item[1].el.classList.contains("copy"));
    const cutItems = items.filter(item => item[1].el.classList.contains("cut"));
    if (!copyItems.length && !cutItems.length) return;

    const destDir = getDestination(plugin) ?? "./";

    try {
        for (const item of copyItems) {
            await processItem(plugin, item, destDir, "copy");
        }
        for (const item of cutItems) {
            await processItem(plugin, item, destDir, "cut");
        }
    } catch (error) {
        console.error("Operation cancelled due to error:", error);
        new Notice("Operation failed. Check console for details.");
    }
}

async function processItem(plugin: ExplorerShortcuts, item: [string, TreeItem<FileTreeItem>], destDir: string, operation: "copy" | "cut") {
    const itemPath = item[0];
    let newPath = path.join(destDir, path.basename(itemPath));

    if (itemPath === newPath) {
        new Notice("Same path", 2000);
        return;
    }

    if (isSubPath(destDir, itemPath)) {
        new Notice("Cannot paste into a subpath", 2000);
        return;
    }

    const itemFileExists = await plugin.app.vault.adapter.exists(newPath);
    if (itemFileExists) {
        const confirmed = await confirm("File or Folder already exists. Increment name or cancel");
        if (!confirmed) return;
        const incrementedPath = incrementName(plugin, item[1].file instanceof TFile ? 'file' : 'folder', newPath);
        newPath = incrementedPath;
    }

    if (operation === "copy") {
        await safeCopy(plugin, item, newPath);
    } else {
        await safeCut(plugin, item, newPath);
    }

    item[1].el.classList.remove(operation);
}

function isSubPath(destDir: string, itemPath: string): boolean {
    const destDirParts = destDir.split('/');
    const itemPathParts = itemPath.split('/');
    if (destDirParts.length < itemPathParts.length) return false;
    return destDirParts.slice(0, itemPathParts.length).join('/') === itemPath;
}

async function safeCopy(plugin: ExplorerShortcuts, item: [string, TreeItem<FileTreeItem>], newPath: string) {
    if (item[1].file instanceof TFile) {
        await plugin.app.vault.copy(item[1].file, newPath);
    } else {
        await safeCopyFolder(plugin, item[1].file as TFolder, newPath);
    }
}

async function safeCopyFolder(plugin: ExplorerShortcuts, itemFile: TFolder, newPath: string) {
    await plugin.app.vault.createFolder(newPath);
    for (const child of itemFile.children) {
        const childNewPath = normalizePath(path.join(newPath, child.name));
        if (child instanceof TFile) {
            await plugin.app.vault.copy(child, childNewPath);
        } else {
            await safeCopyFolder(plugin, child as TFolder, childNewPath);
        }
    }
}

async function safeCut(plugin: ExplorerShortcuts, item: [string, TreeItem<FileTreeItem>], newPath: string) {
    if (item[1].file instanceof TFile) {
        await plugin.app.fileManager.renameFile(item[1].file, newPath);
    } else {
        await plugin.app.vault.rename(item[1].file as TFolder, newPath);
    }
}

export function getDestination(plugin: ExplorerShortcuts, dir = false): string | undefined {
    const hovered = getHoveredElement(plugin);
    if (!hovered) return;
    const _path = getElPath(hovered);
    return path.extname(_path) ? path.dirname(_path) : _path;
}

function incrementName(plugin: ExplorerShortcuts, type: 'file' | 'folder', destPath: string): string {
    const { dir, name, ext } = getPathEls(destPath);
    const basePath = dir === "." ? "" : dir + "/";
    const baseNewName = name || "Untitled";
    const newExt = type === 'file' ? (ext || ".md") : "";

    let counter = -1;// to start without number
    let newName = baseNewName;
    let newPath = normalizePath(basePath + newName + newExt);

    const untitledRegex = /^(Untitled)(\s*(\d+))?$/;
    const  isUntitled = baseNewName.match(untitledRegex);

    while (plugin.app.vault.getAbstractFileByPath(newPath)) {
        counter++;
        
        if (isUntitled) {
            newName = counter === 0 ? "Untitled" : `Untitled ${counter}`;
        } else {
            newName = counter === 0 ? baseNewName : `${baseNewName} (${counter})`;
        }

        newPath = normalizePath(basePath + newName + newExt);
    }

    return newPath;
}
import { normalizePath, TFile, TFolder, Notice, Modal, Setting, App } from "obsidian";
import * as path from "path";
import ExplorerShortcuts from "./main.js";
import { getElPath, getExplorerFileItems, getHoveredElement, getPathEls } from "./utils.js";

import { ConflictAction } from "./types/variables.js";
import type { FileTreeItem, FolderTreeItem } from "obsidian-typings";

let applyToAll = false;

export async function paste(plugin: ExplorerShortcuts): Promise<void> {
    const items = getExplorerFileItems(plugin);
    let selectedItems = items.filter(item => item[1].el.classList.contains("copy") || item[1].el.classList.contains("cut"));

    if (!selectedItems.length) {
        new Notice("No items selected for paste operation");
        return;
    }

    // Filter out parent folders that contain selected files (same logic as in cut-copy.ts)
    if (selectedItems.length > 1) {
        const selectedFilePaths = selectedItems
            .filter(item => !item[1].el.classList.contains("nav-folder"))
            .map(item => item[0]);

        if (selectedFilePaths.length > 0) {
            selectedItems = selectedItems.filter(item => {
                const isFolder = item[1].el.classList.contains("nav-folder");
                if (isFolder) {
                    // Only include folders that don't contain selected files
                    const hasSelectedFilesInside = selectedFilePaths.some(filePath =>
                        filePath.startsWith(item[0] + "/")
                    );
                    return !hasSelectedFilesInside;
                }
                return true; // Always include files
            });
        }
    }

    const destDir = getDestination(plugin) ?? "/";

    try {
        applyToAll = false;
        const conflictingItems = await getConflictingItems(plugin, selectedItems, destDir);

        let globalAction: ConflictAction | null = null;

        for (const item of selectedItems) {
            const itemPath = item[0];
            const newPath = path.join(destDir, path.basename(itemPath));
            const operation = item[1].el.classList.contains("copy") ? "copy" : "cut";

            let shouldReplace = false;
            if (conflictingItems.includes(itemPath)) {
                if (!applyToAll || globalAction === null) {
                    const action = await chooseAction(plugin.app, path.basename(itemPath), conflictingItems.length);
                    if (action === ConflictAction.Cancel) continue;

                    if (applyToAll) {
                        globalAction = action;
                    }

                    shouldReplace = action === ConflictAction.Replace;
                } else {
                    // Use the stored global action
                    shouldReplace = globalAction === ConflictAction.Replace;
                }
            }

            await processItem(plugin, item, newPath, operation, shouldReplace);
        }

        // Clear the tagged items after successful paste operation
        if (plugin.taggedItems) {
            plugin.taggedItems.clear();
        }
        plugin.operation = null;
    } catch (error) {
        console.error("Paste operation failed:", error);
        new Notice("Paste operation failed. Check console for details.");
    }
}

async function getConflictingItems(plugin: ExplorerShortcuts, items: [string, FileTreeItem | FolderTreeItem][], destDir: string): Promise<string[]> {
    const conflictingItems: string[] = [];
    for (const item of items) {
        const newPath = path.join(destDir, path.basename(item[0]));
        if (await plugin.app.vault.adapter.exists(newPath)) {
            conflictingItems.push(item[0]);
        }
    }
    return conflictingItems;
}

async function chooseAction(app: App, filename: string, conflictCount: number): Promise<ConflictAction> {
    return new Promise((resolve): void => {
        const modal = new Modal(app);
        modal.titleEl.textContent = `File "${filename}" already exists`;

        let selectedAction = ConflictAction.Increment;

        new Setting(modal.contentEl)
            .setName("Choose Action")
            .addDropdown((dropdown) => {
                dropdown
                    .addOption(ConflictAction.Increment, "Increment name")
                    .addOption(ConflictAction.Replace, "Replace existing")
                    .setValue(ConflictAction.Increment)
                    .onChange((value: string): void => {
                        selectedAction = value as ConflictAction;
                    });
            });

        if (conflictCount > 1) {
            new Setting(modal.contentEl)
                .setName("Apply to all remaining files")
                .addToggle((toggle) => {
                    toggle
                        .setValue(applyToAll)
                        .onChange((value): void => {
                            applyToAll = value;
                        });
                });
        }

        new Setting(modal.contentEl)
            .addButton((btn) => {
                btn
                    .setButtonText("OK")
                    .setCta()
                    .onClick((): void => {
                        resolve(selectedAction);
                        modal.close();
                    });
            })
            .addButton((btn) => {
                btn
                    .setButtonText("Cancel")
                    .onClick((): void => {
                        resolve(ConflictAction.Cancel);
                        modal.close();
                    });
            });

        modal.open();
    });
}

async function processItem(
    plugin: ExplorerShortcuts,
    item: [string, FileTreeItem | FolderTreeItem],
    newPath: string,
    operation: "copy" | "cut",
    replace: boolean
): Promise<void> {
    const itemPath = item[0];

    if (normalizePath(itemPath) === normalizePath(newPath)) {
        new Notice("Cannot paste to the same location", 2000);
        return;
    }

    if (!replace) {
        newPath = incrementName(plugin, item[1].file instanceof TFile ? 'file' : 'folder', newPath);
    }

    try {
        if (operation === "copy") {
            await safeCopy(plugin, item, newPath, replace);
        } else {
            await safeCut(plugin, item, newPath, replace);
        }
        item[1].el.classList.remove(operation);
    } catch (error) {
        console.error(`Failed to ${operation} item:`, error);
        new Notice(`Failed to ${operation} item. Check console for details.`);
    }
}

async function safeCopy(plugin: ExplorerShortcuts, item: [string, FileTreeItem | FolderTreeItem], newPath: string, replace: boolean): Promise<void> {
    const file = item[1].file;
    if (file instanceof TFile) {
        if (replace) {
            const content = await plugin.app.vault.adapter.read(file.path);
            await plugin.app.vault.adapter.write(newPath, content);
        } else {
            await plugin.app.vault.copy(file, newPath);
        }
    } else {
        // It's a folder - use the file as TFolder
        const folder = file as TFolder;
        await safeCopyFolder(plugin, folder, newPath, replace);
    }
}

async function safeCopyFolder(plugin: ExplorerShortcuts, itemFile: TFolder, newPath: string, replace: boolean): Promise<void> {
    if (replace) {
        await plugin.app.vault.adapter.rmdir(newPath, true);
    }
    await plugin.app.vault.createFolder(newPath);

    for (const child of itemFile.children) {
        const childNewPath = normalizePath(path.join(newPath, child.name));
        if (child instanceof TFile) {
            await plugin.app.vault.copy(child, childNewPath);
        } else if (child instanceof TFolder) {
            await safeCopyFolder(plugin, child, childNewPath, replace);
        }
    }
}

async function safeCut(plugin: ExplorerShortcuts, item: [string, FileTreeItem | FolderTreeItem], newPath: string, replace: boolean): Promise<void> {
    if (item[1].file instanceof TFile) {
        if (replace) {
            await plugin.app.vault.adapter.remove(newPath);
        }
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

    // Fix the basePath construction - handle root directory properly
    let basePath = "";
    if (dir && dir !== "." && dir !== "/") {
        basePath = dir.endsWith("/") ? dir : dir + "/";
    }

    const baseNewName = name || "Untitled";
    const newExt = type === 'file' ? (ext || ".md") : "";

    let counter = -1;// to start without number
    let newName = baseNewName;
    let newPath = normalizePath(basePath + newName + newExt);

    const untitledRegex = /^(Untitled)(\s*(\d+))?$/;
    const isUntitled = baseNewName.match(untitledRegex);

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

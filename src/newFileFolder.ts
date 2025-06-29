import { TFile, TFolder } from "obsidian";
import ExplorerShortcuts from "./main.js";
import { getElPath, getExplorerView, getHoveredElement } from "./utils.js";

export async function createNewItem(plugin: ExplorerShortcuts, type: 'file' | 'folder'): Promise<void> {
    const view = getExplorerView(plugin);
    if (!view) return;

    const hovered = getHoveredElement(plugin);
    const path = getElPath(hovered) || '/';

    let targetFolder: TFolder;

    if (path === '/') {
        targetFolder = plugin.app.vault.getRoot();
    } else {
        const hoveredItem = view.fileItems[path];
        const file = hoveredItem.file as TFile | TFolder;

        if (file instanceof TFile) {
            targetFolder = file.parent || plugin.app.vault.getRoot();
        } else if (file instanceof TFolder) {
            targetFolder = file;
        } else {
            targetFolder = plugin.app.vault.getRoot();
        }
    }

    plugin.isEditingNewItem = true;

    view.createAbstractFile(type, targetFolder, true);

    if (type === 'file') {
        // Watch for the inline title element to appear
        const checkForInlineTitle = setInterval((): void => {
            const inlineTitleEl = document.querySelector('.inline-title');
            if (inlineTitleEl) {
                clearInterval(checkForInlineTitle);

                // Add blur handler to reset the flag
                inlineTitleEl.addEventListener('blur', (): void => {
                    plugin.isEditingNewItem = false;
                    setTimeout((): void => {
                        const fileExplorer = plugin.app.workspace.getLeavesOfType("file-explorer")[0];
                        if (fileExplorer) {
                            plugin.app.workspace.setActiveLeaf(fileExplorer, { focus: true });
                        }
                    }, 100);
                }, { once: true });

                inlineTitleEl.addEventListener('keydown', (e: Event): void => {
                    if ((e as KeyboardEvent).key === 'Enter') {
                        e.preventDefault();
                        (inlineTitleEl as HTMLElement).blur();
                    }
                });
            }
        }, 50);
    } else {
        // For folders, watch for the editable element in explorer
        const checkForEditableFolder = setInterval((): void => {
            const editableFolder = view.containerEl.querySelector('[contenteditable="true"]');
            if (editableFolder) {
                clearInterval(checkForEditableFolder);

                // Add blur handler to reset the flag
                editableFolder.addEventListener('blur', (): void => {
                    plugin.isEditingNewItem = false;
                    // Remove has-focus from all items in explorer
                    view.containerEl.querySelectorAll('.has-focus').forEach(el => {
                        el.classList.remove('has-focus');
                    });
                }, { once: true });
            }
        }, 50);
    }

    // Safety timeout to reset the flag after 10 seconds if something goes wrong
    setTimeout((): void => {
        plugin.isEditingNewItem = false;
        // Also clean up any lingering has-focus classes
        view.containerEl.querySelectorAll('.has-focus').forEach(el => {
            el.classList.remove('has-focus');
        });
    }, 10000);
}
import type ExplorerShortcuts from "./main.ts";
import { Operation } from "./types/variables.ts";
import { getHoveredElement, getNavFilesContainerItems } from "./utils.ts";


/**
 * Function to perform the copy or cut operation on the selected items
 */
export function performOperation(plugin: ExplorerShortcuts, operation: Operation): void {
    plugin.operation = operation;

    const selectedItems = getSelectedExplorerItems(plugin);

    if (!plugin.taggedItems) {
        plugin.taggedItems = new Set<Element>();
    }

    const hovered = getHoveredElement(plugin);

    // Check if we're hovering over an item that's already tagged
    if (hovered && plugin.taggedItems && plugin.taggedItems.has(hovered)) {
        // Remove the item from tagged items if it's already there
        plugin.taggedItems.delete(hovered);
        hovered.classList.remove('copy', 'cut');
    } else if (selectedItems.length > 1) {
        // Add all selected items if there are multiple selections
        selectedItems.forEach(item => {
            plugin.taggedItems?.add(item);
            // Remove any existing operation classes
            item.classList.remove('copy', 'cut');
            // Add the new operation class
            item.classList.add(operation);
        });
    } else if (hovered && plugin.taggedItems) {
        // Add the hovered item if it's not already tagged
        plugin.taggedItems.add(hovered);
        // Remove any existing operation classes
        hovered.classList.remove('copy', 'cut');
        // Add the new operation class
        hovered.classList.add(operation);
    }
}

export function copy(plugin: ExplorerShortcuts): void {
    performOperation(plugin, Operation.Copy);
}

export function cut(plugin: ExplorerShortcuts): void {
    performOperation(plugin, Operation.Cut);
}

export function resetOperations(plugin: ExplorerShortcuts): void {
    const items = getNavFilesContainerItems();
    items.forEach((item) => {
        item.classList.remove('copy', 'cut');
    });
    plugin.operation = null;

    // Clear the tagged items set
    if (plugin.taggedItems) {
        plugin.taggedItems.clear();
    }
}


/**
 * Function to get all selected items in the explorer
 */
function getSelectedExplorerItems(plugin: ExplorerShortcuts): Element[] {
    const fileExplorer = plugin.app.workspace.getLeavesOfType("file-explorer")[0];
    if (!fileExplorer) return [];

    const view = fileExplorer.view as any;
    if (!view) return [];

    // Get all elements with the 'is-selected' class in the file explorer
    const selectedElements: Element[] = [];
    const fileItems = view.fileItems;
    const candidateItems: { path: string; element: Element; isFolder: boolean }[] = [];

    // First pass: collect all items that have is-selected class
    for (const path in fileItems) {
        const item = fileItems[path];
        if (!item?.el) continue;

        let isSelected = false;

        // Check if the element itself has the class
        if (item.el.classList.contains("is-selected")) {
            isSelected = true;
        } else {
            // Check if any child element has the class (especially the title element)
            const titleEl = item.el.querySelector(".nav-file-title, .nav-folder-title");
            if (titleEl && titleEl.classList.contains("is-selected")) {
                isSelected = true;
            } else {
                // As a fallback, check any child with the is-selected class
                const selectedChild = item.el.querySelector(".is-selected");
                if (selectedChild) {
                    isSelected = true;
                }
            }
        }

        if (isSelected) {
            const isFolder = item.el.classList.contains("nav-folder");
            candidateItems.push({
                path,
                element: item.el,
                isFolder
            });
        }
    }

    // If only one item is selected, return it regardless of type
    if (candidateItems.length === 1) {
        return [candidateItems[0].element];
    }

    // For multiple selections, filter out parent folders
    const selectedFilePaths = candidateItems
        .filter(item => !item.isFolder)
        .map(item => item.path);

    // If we have selected files, exclude any folders that contain them
    if (selectedFilePaths.length > 0) {
        for (const candidate of candidateItems) {
            if (candidate.isFolder) {
                // For folders, only include if no selected files are inside this folder
                const hasSelectedFilesInside = selectedFilePaths.some(filePath =>
                    filePath.startsWith(candidate.path + "/")
                );

                if (!hasSelectedFilesInside) {
                    selectedElements.push(candidate.element);
                }
            } else {
                // Always include files
                selectedElements.push(candidate.element);
            }
        }
    } else {
        // If no files are selected, include all folders
        selectedElements.push(...candidateItems.map(item => item.element));
    }

    return selectedElements;
}

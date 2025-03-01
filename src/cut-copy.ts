import ExplorerShortcuts from "./main"
import { getNavFilesContainerItems, getHoveredElement } from "./utils"
import { Operation } from "./types/variables";

/**
 * Function to perform the copy or cut operation on the selected items
 */
export function performOperation(plugin: ExplorerShortcuts, operation: Operation) {
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

export function copy(plugin: ExplorerShortcuts) {
    performOperation(plugin, Operation.Copy);
}

export function cut(plugin: ExplorerShortcuts) {
    performOperation(plugin, Operation.Cut);
}

export function resetOperations(plugin: ExplorerShortcuts) {
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

    for (const path in fileItems) {
        const item = fileItems[path];
        if (item.el) {
            // Check if the element itself has the class
            if (item.el.classList.contains("is-selected")) {
                selectedElements.push(item.el);
                continue;
            }
            
            // Check if any child element has the class (especially the title element)
            const titleEl = item.el.querySelector(".nav-file-title, .nav-folder-title");
            if (titleEl && titleEl.classList.contains("is-selected")) {
                selectedElements.push(item.el);
                continue;
            }
            
            // As a fallback, check any child with the is-selected class
            const selectedChild = item.el.querySelector(".is-selected");
            if (selectedChild) {
                selectedElements.push(item.el);
            }
        }
    }

    return selectedElements;
}

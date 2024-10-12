import ExplorerShortcuts from "./main"
import { getNavFilesContainerItems, getHoveredElement } from "./utils"
import { Operation } from "./types/variables";

export function performOperation(plugin: ExplorerShortcuts, operation: Operation) {
    plugin.operation = operation;
    const hovered = getHoveredElement(plugin);

    if (!hovered) return;

    const oppositeClass = operation === Operation.Cut ? 'copy' : 'cut';
    if (hovered.classList.contains(oppositeClass)) {
        hovered.classList.remove(oppositeClass);
    }
    hovered.classList.toggle(operation);
}

export function copy(plugin: ExplorerShortcuts) {
    performOperation(plugin, Operation.Copy);
}

export function cut(plugin: ExplorerShortcuts) {
    performOperation(plugin, Operation.Cut);
}

export function resetOperations(plugin: ExplorerShortcuts) {
    const items = getNavFilesContainerItems();
    console.log("items", items)
    items.forEach((item) => {
        item.classList.remove('copy', 'cut');
    });
    plugin.operation = null;
}

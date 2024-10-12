import ExplorerShortcuts from "./main"
import { getExplorerFileItems, getHoveredElement, getElPath } from "./utils"
import { Operation } from "./types/variables";

export function performOperation(plugin: ExplorerShortcuts, operation: Operation) {
    plugin.operation = operation;
    const hovered = getHoveredElement(plugin);

    if (!hovered) return;

    const path = getElPath(hovered);
    if (path === ".") return; // Ne rien faire si à la racine

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
    const items = getExplorerFileItems(plugin);
    items.forEach(([_, item]) => {
        item.el.classList.remove('copy', 'cut');
    });
    plugin.operation = null;
}

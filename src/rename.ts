import ExplorerShortcuts from "./main.js";
import { getElPath, getExplorerView, getHoveredElement } from "./utils.js";

export async function rename(plugin: ExplorerShortcuts, e: KeyboardEvent): Promise<void> {
    const view = getExplorerView(plugin);
    if (!view) return;

    const hovered = getHoveredElement(plugin);
    if (!hovered) return;

    const tree = view.tree;
    if (!tree) return;

    const path = getElPath(hovered) || '/';
    const hoveredItem = view.fileItems[path];
    if (!hoveredItem) return;

    tree.setFocusedItem(hoveredItem);
    //@ts-ignore
    tree.handleRenameFocusedItem(e);

    // Wait a little for the editable element to be created
    setTimeout((): void => {
        const input = view.containerEl.querySelector('[contenteditable="true"]') as HTMLElement | null;
        if (!input) return;

        input.addEventListener('blur', (): void => {
            plugin.renaming = false;
            hovered.firstElementChild?.classList.remove("has-focus");
        }, { once: true }); // once: true guarantees that the listener will be removed after its execution

        // Also add a listener for the Enter key
        input.addEventListener('keydown', (e: KeyboardEvent): void => {
            if (e.key === 'Enter') {
                plugin.renaming = false;
                hovered.firstElementChild?.classList.remove("has-focus");
            }
        }, { once: true });

        // Security: force the reset after a delay
        setTimeout((): void => {
            if (plugin.renaming) {
                plugin.renaming = false;
                hovered.firstElementChild?.classList.remove("has-focus");
            }
        }, 10000);
    }, 50);
}
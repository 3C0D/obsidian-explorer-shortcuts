import ExplorerShortcuts from "./main";
import { getElPath, getExplorerView, getHoveredElement } from "./utils";

export async function rename(plugin: ExplorerShortcuts, e: KeyboardEvent): Promise<void> {
    const view = getExplorerView(plugin);
    if (!view) return
    const hovered = getHoveredElement(plugin)
    if (!hovered) return
    const tree = view.tree;
    if (!tree) return;
    const path = getElPath(hovered) || '/'
    const hoveredItem = view.fileItems[path]
    if (!hoveredItem) return
    tree.setFocusedItem(hoveredItem);
    //@ts-ignore
    tree.handleRenameFocusedItem(e)
    const input = view.containerEl.querySelector('[contenteditable="true"]') as HTMLInputElement | null;
    if (!input) return
    input.onblur = function () {
        plugin.renaming = false
        hovered.firstElementChild?.classList.remove("has-focus")
    }
}
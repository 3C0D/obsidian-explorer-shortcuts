import { FileExplorerView, FileTreeItem, TreeItem } from "obsidian-typings";
import ExplorerShortcuts from "./main";
import * as path from "path";
import { ElementType } from "./types/variables";

///////// elements ////////


export function getElPath(element: Element | null): string {
    return element?.children[0]?.getAttribute("data-path") ?? element?.getAttribute("data-path") ?? "";
}

export function getHoveredElement(plugin: ExplorerShortcuts) {
    return plugin.explorerfileContainer || plugin.explorerfolderContainer || null
}

export function getEltFromMousePos(
    plugin: ExplorerShortcuts,
    event: MouseEvent
): Element | null {
    plugin.mousePosition = { x: event.clientX, y: event.clientY };
    if (plugin.mousePosition) {
        return document.elementFromPoint(plugin.mousePosition.x, plugin.mousePosition.y);
    }
    return null;
}

///////// tree items elements //////////

export function getElementByType(element: Element | null, type: ElementType): Element | null {
    return element?.closest(`.${type}`) ?? null;
}

export function hasClass(element: Element | null, className: string): boolean {
    return element?.classList.contains(className) ?? false;
}

export const isNavFile = (element: Element | null): boolean =>
    hasClass(element, ElementType.File);

export const isNavFolded = (element: Element | null): boolean =>
    hasClass(element, 'is-collapsed');

export const isNavFolder = (element: Element | null): boolean =>
    hasClass(element, ElementType.Folder);


export const isOverNavFile = (plugin: ExplorerShortcuts) => {
    return plugin.elementFromPoint?.closest(".nav-file") ?? null;
}

export const isOverNavFolder = (plugin: ExplorerShortcuts) => {
    return plugin.elementFromPoint?.closest(".nav-folder") ?? null;
}

export const isOverNavFilesContainer = (plugin: ExplorerShortcuts) => {
    return plugin.elementFromPoint?.closest(".nav-files-container") ?? null;
}

export function getNavFilesContainerItems(): NodeListOf<Element> {
    const elements = document.querySelectorAll(".nav-files-container .nav-file, .nav-files-container .nav-folder");
    return elements;
}

export async function scrollToActiveEl(plugin: ExplorerShortcuts): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const activeEl = getActiveExplorerEl(plugin);
            if (!activeEl) return resolve();
            activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
            resolve();
        }, 100);
    });
}


////////// fileItems ////////////////

export function isFileItemCollapsed(item: [string, TreeItem<FileTreeItem>]): boolean {
    const el = isNavFile(item[1].el) ? item[1].parent?.el : item[1].el;
    return el?.classList.contains("is-collapsed") ?? false;
}

export function getActiveExplorerFileItem(plugin: ExplorerShortcuts): [string, TreeItem<FileTreeItem>] | null {
    const activeItem = getExplorerFileItems(plugin).find((item) => item[1].selfEl.classList.contains("is-active")) ?? null;
    return activeItem;
}

// TODO: see the logic again.
export function unfoldFileItemParentFolder(plugin: ExplorerShortcuts, element: Element | null): void {
    const dirPath = getElPath(element)
    const items = getExplorerFileItems(plugin)
    if (!items) return
    for (const item of items) {
        if (item[0].includes(dirPath)) {
            item[1].setCollapsed(false, true)
            break
        }
    }
}

// Unused - can be commented out
// export function collapseAllExplorerFolders(plugin: ExplorerShortcuts, collapse = true): void {
//     const items = getExplorerFileItems(plugin);
//     items?.filter((item) => isNavFolder(item[1]?.el)).forEach(async (item) => await item[1].setCollapsed(collapse, true))
// }

//////////// explorer ///////////////

export const isOverExplorerNavContainer = (plugin: ExplorerShortcuts): Element | null => {
    const leafContent = plugin.elementFromPoint?.closest(".workspace-leaf-content[data-type='file-explorer'] .nav-files-container");
    return leafContent || null;
}

export function isOverEditor(plugin: ExplorerShortcuts): Element | null {
    return  plugin.elementFromPoint?.closest(".workspace-leaf.mod-active") ?? null
}

export function getExplorerView(plugin: ExplorerShortcuts): FileExplorerView {
    const { workspace } = plugin.app;
    return workspace.getLeavesOfType("file-explorer")?.first()?.view as FileExplorerView;
}

export function getExplorerFileItems(plugin: ExplorerShortcuts): [string, TreeItem<FileTreeItem>][] {
    const fileExplorerView = getExplorerView(plugin);
    if (!fileExplorerView?.fileItems) return [];
    return Object.entries(fileExplorerView.fileItems);
}

export function getActiveExplorerEl(plugin: ExplorerShortcuts): HTMLElement | null {
    const view = getExplorerView(plugin);
    return view?.containerEl.querySelector('.is-active') ?? null
}


///////////////// other ////////////////

export function getPathEls(_path: string) {
    return { dir: path.dirname(_path), name: path.basename(_path, path.extname(_path)), ext: path.extname(_path) }
}


////////////////Annexe////////////////////////

export async function blinkExplorerItem(item: [string, TreeItem<FileTreeItem>]) {
    if (!item || !isNavFile(item[1].el)) return;
    const getFileEl = item[1].el.querySelector(".tree-item-self") as HTMLElement;
    blinkElement(getFileEl, 2, 500);
}

export function blinkElement(el: HTMLElement, times: number, interval: number) {
    let counter = 0;

    const blinkInterval = setInterval(() => {
        el.classList.toggle("reveal");
        counter++;

        if (counter >= times * 2) {
            clearInterval(blinkInterval);
            el.classList.remove("reveal");
        }
    }, interval);
}

// Unused - can be commented out
// export function getExplorerItemPaths(item: [string, TreeItem<FileTreeItem>]) {
//     return item[0] || "";
// }

// Unused - can be commented out
// export function unfoldAll(plugin: ExplorerShortcuts, path: string, fold = true) {
//     let parts = path.split("/");
//     if (!(parts.length > 1)) return
//     const items = getExplorerFileItems(plugin).filter(item => isNavFolder(item[1].el))
//     if (!items) return
//     while (parts.length > 1) {
//         parts = parts.slice(0, parts.length - 1);
//         const parent = parts.join("/");
//         for (const item of items) {
//             if (item[0].includes(parent)) {
//                 item[1].setCollapsed(fold, true)
//                 break
//             }
//         }
//     }
// }

// Unused - can be commented out
// export function renameItem(plugin: ExplorerShortcuts, activePath: string) {
//     const view = getExplorerView(plugin);
//     if (!view) return
//     const hovered = getHoveredElement(plugin)
//     if (!hovered) return
//     const tree = view.tree;
//     if (!tree) return;
//     const path = activePath || '/'
//     const hoveredItem = view.fileItems[path]
//     if (!hoveredItem) return
//     tree.setFocusedItem(hoveredItem);
//     tree.handleRenameFocusedItem()
//     const input = view.containerEl.querySelector('[contenteditable="true"]') as HTMLInputElement | null;
//     if (!input) return
//     input.onblur = function () {
//         plugin.renaming = false
//         hovered.firstElementChild?.classList.remove("has-focus")
//     }
// }


// export function getActiveLeafPath(plugin: ExplorerShortcuts) {
//     const activeLeaf = plugin.app.workspace.getLeaf(false)
//     return activeLeaf?.view.file?.path
// }

// export function isExplorerActif(plugin: ExplorerShortcuts) {
//     if (!plugin.explorerContainer) return false
//     const leafContent = plugin.explorerContainer.parentElement
//     if (!leafContent) return false
//     return leafContent.parentElement!.classList.contains("mod-active")
// }

// export function isOverRibbonBar(plugin: ExplorerShortcuts) {
//     return plugin.elementFromPoint?.closest(".workspace-ribbon") ?? null;
// }
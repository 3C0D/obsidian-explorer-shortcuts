import { Notice } from "obsidian";
import ExplorerShortcuts from "./main";
import { 
    getElPath, 
    getExplorerFileItems, 
    getNavFilesContainerItems, 
    isNavFile, 
    isNavFolder, 
    isNavFolded,
    unfoldFileItemParentFolder,
    scrollToActiveEl,
    getActiveExplorerFileItem
} from "./utils";

export type NavigationDirection = 'up' | 'down';

export async function navigateOverExplorer(
    plugin: ExplorerShortcuts, 
    direction: NavigationDirection = 'down'
) {
    await ensureActiveElementVisible(plugin);

    const nextElement = getNextElement(plugin, direction);
    
    if (!nextElement) {
        new Notice("End of list", 800);
        return;
    }
    
    if (isNavFile(nextElement)) {
        await openNext(plugin, nextElement);
    }
}

async function ensureActiveElementVisible(plugin: ExplorerShortcuts): Promise<void> {
    const activeItem = getActiveExplorerFileItem(plugin);
    if (!activeItem) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [path, _] = activeItem;
    
    // Try to unfold parent folders twice to ensure visibility
    for (let i = 0; i < 2; i++) {
        const items = getExplorerFileItems(plugin);
        for (const [itemPath, item] of items) {
            if (path.startsWith(itemPath) && isNavFolded(item.el)) {
                item.setCollapsed(false,false);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    await scrollToActiveEl(plugin);
}

function getNextElement(
    plugin: ExplorerShortcuts, 
    direction: NavigationDirection
): Element | undefined {
    let filteredList = getFilteredExplorerItems();
    if (filteredList.length === 0) return undefined;

    let activeIndex = findActiveIndex(filteredList);
    if (activeIndex === -1) {
        activeIndex = handleInactiveFile(plugin, filteredList);
        if (activeIndex === -1) return undefined;
        filteredList = getFilteredExplorerItems(); // Refresh list after changes
    }

    return findNextValidElement(plugin, filteredList, activeIndex, direction);
}

function handleInactiveFile(
    plugin: ExplorerShortcuts, 
    filteredList: Element[]
): number {
    const items = getExplorerFileItems(plugin);
    const activeLeaf = plugin.app.workspace.getLeaf(false);
    
    if (!activeLeaf?.view.file) return -1;

    const activeFilePath = activeLeaf.view.file.path;
    const activeItem = items.find(item => item[0] === activeFilePath);
    
    if (!activeItem) return -1;

    unfoldFileItemParentFolder(plugin, activeItem[1].el);
    
    // Refresh the list after expanding
    const updatedList = getFilteredExplorerItems();
    return updatedList.findIndex(el => 
        el.children[0].classList.contains("is-active")
    );
}

function getFilteredExplorerItems(): Element[] {
    const elements = getNavFilesContainerItems();
    return Array.from(elements).filter(element => 
        !element.children[0].classList.contains("is-unsupported") && 
        !element.classList.contains("mod-root")
    );
}

function findActiveIndex(elements: Element[]): number {
    return elements.findIndex(el => 
        el.children[0].classList.contains("is-active")
    );
}

function getNextIndex(
    currentIndex: number, 
    listLength: number, 
    direction: NavigationDirection
): number {
    if (direction === 'down') {
        return (currentIndex + 1) % listLength;
    } else {
        return (currentIndex - 1 + listLength) % listLength;
    }
}

function findNextValidElement(
    plugin: ExplorerShortcuts,
    filteredList: Element[],
    activeIndex: number,
    direction: NavigationDirection
): Element | undefined {
    let currentList = filteredList;
    let nextIndex = getNextIndex(activeIndex, currentList.length, direction);
    let nextElement = currentList[nextIndex];

    while (isNavFolder(nextElement)) {
        if (isNavFolded(nextElement)) {
            const { newIndex, newList } = handleFoldedFolder(
                plugin, 
                nextElement, 
                currentList, 
                nextIndex, 
                direction
            );
            nextIndex = newIndex;
            currentList = newList;
        } else {
            nextIndex = getNextIndex(nextIndex, currentList.length, direction);
        }
        nextElement = currentList[nextIndex];
    }

    return nextElement;
}

function handleFoldedFolder(
    plugin: ExplorerShortcuts,
    folderElement: Element,
    filteredList: Element[],
    currentIndex: number,
    direction: NavigationDirection
): { newIndex: number; newList: Element[] } {
    const initialLength = filteredList.length;
    unfoldFileItemParentFolder(plugin, folderElement);
    const newList = getFilteredExplorerItems();
    const newLength = newList.length;
    const added = newLength - initialLength;
    const folderIndex = newList.indexOf(folderElement);

    let newIndex: number;
    if (direction === 'down') {
        newIndex = added === 0 ? 
            getNextIndex(currentIndex, newList.length, direction) : 
            folderIndex + 1;
    } else {
        newIndex = added === 0 ? 
            getNextIndex(currentIndex, newList.length, direction) : 
            folderIndex + added;
    }

    return { newIndex, newList };
}

export async function openNext(
    plugin: ExplorerShortcuts, 
    next: Element | null
) {
    const path = getElPath(next);
    if (!path) return;

    const item = plugin.app.vault.getFileByPath(path);
    if (!item) return;

    const activeLeaf = plugin.app.workspace.getLeaf(false);
    if (!activeLeaf) return;

    await activeLeaf.openFile(item, { active: true });
    await scrollToActiveEl(plugin);
}
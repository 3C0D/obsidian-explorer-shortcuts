import { FileView, Notice } from "obsidian";
import ExplorerShortcuts from "./main.ts";
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
} from "./utils.ts";

export type NavigationDirection = 'up' | 'down';

// Throttling for smooth navigation
let lastNavigationTime = 0;
const NAVIGATION_THROTTLE = 200; // 200ms minimum between navigations

// Debounce for mouse movement simulation
let mouseMoveDebounceTimer: NodeJS.Timeout | null = null;
const MOUSE_MOVE_DEBOUNCE = 500; // Wait 500ms after last navigation before triggering mouse move

/**
 * Trigger a mouse move event to refresh the hover state with debounce
 * Only triggers after navigation has stopped for a while
 */
function triggerMouseMoveForNavigation(plugin: ExplorerShortcuts): void {
    // Clear existing timer
    if (mouseMoveDebounceTimer) {
        clearTimeout(mouseMoveDebounceTimer);
    }

    // Set new timer to trigger mouse move after debounce period
    mouseMoveDebounceTimer = setTimeout(() => {
        const e = new MouseEvent('mousemove', {
            clientX: plugin.mousePosition.x + 1,
            clientY: plugin.mousePosition.y + 1
        });
        document.dispatchEvent(e);
        mouseMoveDebounceTimer = null;
    }, MOUSE_MOVE_DEBOUNCE);
}

export async function navigateOverExplorer(
    plugin: ExplorerShortcuts,
    direction: NavigationDirection = 'down'
): Promise<void> {
    // Throttle navigation for smooth experience
    const currentTime = Date.now();
    if (currentTime - lastNavigationTime < NAVIGATION_THROTTLE) {
        return; // Skip if too soon after last navigation
    }
    lastNavigationTime = currentTime;

    await ensureActiveElementVisible(plugin);

    const nextElement = getNextElement(plugin, direction);

    if (!nextElement) {
        new Notice("End of list", 800);
        return;
    }

    if (isNavFile(nextElement)) {
        await openNext(plugin, nextElement);
    } else {
        // Si c'est un dossier, on ne fait rien de plus
        // Cela empêche le focus de passer à l'éditeur
        await scrollToActiveEl(plugin);
    }

    // Trigger mouse move to refresh hover state and prevent navigation from "cutting out"
    triggerMouseMoveForNavigation(plugin);
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
                // Only folders can be collapsed
                if ('setCollapsed' in item) {
                    item.setCollapsed(false, true);
                }
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
        activeIndex = handleInactiveFile(plugin);
        if (activeIndex === -1) return undefined;
        filteredList = getFilteredExplorerItems(); // Refresh list after changes
    }

    return findNextValidElement(plugin, filteredList, activeIndex, direction);
}

function handleInactiveFile(
    plugin: ExplorerShortcuts,
): number {
    const items = getExplorerFileItems(plugin);
    const activeLeaf = plugin.app.workspace.getLeaf(false);

    const file = (activeLeaf?.view as FileView).file;
    if (!file) return -1;

    const activeFilePath = file.path;
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

/**
 * Remove the focus (has-focus class) from all elements in the explorer
 * This removes the annoying selection circle/rectangle
 */
function removeFocusFromExplorer(): void {
    const focusedElements = document.querySelectorAll('.nav-file-title.has-focus, .nav-folder-title.has-focus');
    focusedElements.forEach(el => {
        el.classList.remove('has-focus');
    });
}

/**
 * Reveal the active file in the explorer (like the reveal function but without focus change)
 */
async function revealActiveFile(plugin: ExplorerShortcuts): Promise<void> {
    try {
        // Run the reveal command twice to ensure it works on long trees
        plugin.app.commands.executeCommandById("file-explorer:reveal-active-file");
        plugin.app.commands.executeCommandById("file-explorer:reveal-active-file");

        // Wait a bit for the reveal to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
        console.error("Failed to reveal active file:", error);
    }
}

export async function openNext(
    plugin: ExplorerShortcuts,
    next: Element | null
): Promise<void> {
    const path = getElPath(next);
    if (!path) return;

    const item = plugin.app.vault.getFileByPath(path);
    if (!item) return;

    const activeLeaf = plugin.app.workspace.getLeaf(false);
    if (!activeLeaf) return;

    // Remove any existing focus before opening
    removeFocusFromExplorer();

    // Start scrolling early for smoother experience
    scrollToActiveEl(plugin);

    // Open the file
    await activeLeaf.openFile(item);

    // Shorter wait for faster response
    await new Promise(resolve => setTimeout(resolve, 100));

    // Reveal the file in explorer to sync the selection
    await revealActiveFile(plugin);

    // Scroll again after reveal to ensure proper positioning
    await scrollToActiveEl(plugin);

    // Remettre le focus sur l'explorateur de fichiers
    const fileExplorer = plugin.app.workspace.getLeavesOfType("file-explorer")[0];
    if (fileExplorer) {
        plugin.app.workspace.setActiveLeaf(fileExplorer, { focus: true });
    }
}

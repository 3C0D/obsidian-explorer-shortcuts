import type { FileExplorerView, FileTreeItem, FolderTreeItem } from 'obsidian-typings';
import type ExplorerShortcuts from './main.ts';
import * as path from 'path';
import { ElementType } from './types/variables.ts';
import type { PathElements } from './types/global.ts';
import type { TFile } from 'obsidian';

///////// elements ////////

/**
 * Extracts the file or folder vault path from the given DOM element.
 */
export function getElPath(element: Element | null): string {
	return (
		element?.children[0]?.getAttribute('data-path') ??
		element?.getAttribute('data-path') ??
		''
	);
}

/**
 * Returns the currently hovered explorer file or folder DOM element.
 */
export function getHoveredElement(plugin: ExplorerShortcuts): Element | null {
	return plugin.explorerfileContainer || plugin.explorerfolderContainer || null;
}

/**
 * Updates mouse coordinates and returns the DOM element directly beneath the cursor.
 */
export function getEltFromMousePos(
	plugin: ExplorerShortcuts,
	event: MouseEvent
): Element | null {
	plugin.mousePosition = { x: event.clientX, y: event.clientY };
	return document.elementFromPoint(plugin.mousePosition.x, plugin.mousePosition.y);
}

///////// tree items elements //////////

/**
 * Retrieves the closest ancestor matching the specific element type class.
 */
export function getElementByType(
	element: Element | null,
	type: ElementType
): Element | null {
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

export const isOverNavFile = (plugin: ExplorerShortcuts): Element | null => {
	return plugin.elementFromPoint?.closest('.nav-file') ?? null;
};

export const isOverNavFolder = (plugin: ExplorerShortcuts): Element | null => {
	return plugin.elementFromPoint?.closest('.nav-folder') ?? null;
};

export const isOverNavFilesContainer = (plugin: ExplorerShortcuts): Element | null => {
	return plugin.elementFromPoint?.closest('.nav-files-container') ?? null;
};

export function getNavFilesContainerItems(plugin: ExplorerShortcuts): Element[] {
	const view = getExplorerView(plugin);
	const container = view?.containerEl?.querySelector('.nav-files-container');
	if (!container) return [];
	return Array.from(container.querySelectorAll('.nav-file, .nav-folder'));
}

export async function scrollToActiveEl(plugin: ExplorerShortcuts): Promise<void> {
	return new Promise<void>((resolve): void => {
		setTimeout((): void => {
			const activeEl = getActiveExplorerEl(plugin);
			if (!activeEl) return resolve();
			activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			resolve();
		}, 100);
	});
}

////////// fileItems ////////////////

export function isFileItemCollapsed(item: [string, FileTreeItem]): boolean {
	const el = isNavFile(item[1].el) ? item[1].parent?.el : item[1].el;
	return el?.classList.contains('is-collapsed') ?? false;
}

export function getActiveExplorerFileItem(
	plugin: ExplorerShortcuts
): [string, FileTreeItem | FolderTreeItem] | null {
	const activeItem =
		getExplorerFileItems(plugin).find((item) =>
			item[1].selfEl.classList.contains('is-active')
		) ?? null;
	return activeItem;
}

/**
 * Expands (uncollapses) the folder item whose vault path exactly matches the given element's path.
 */
export function unfoldFolderAtPath(
	plugin: ExplorerShortcuts,
	element: Element | null
): void {
	const dirPath = getElPath(element);
	const items = getExplorerFileItems(plugin);
	if (!items) return;
	for (const item of items) {
		if (item[0] === dirPath) {
			// Only folders can be collapsed
			if ('setCollapsed' in item[1]) {
				item[1].setCollapsed(false, true);
			}
			break;
		}
	}
}

//////////// explorer ///////////////

export const isOverExplorerNavContainer = (plugin: ExplorerShortcuts): Element | null => {
	const leafContent = plugin.elementFromPoint?.closest(
		".workspace-leaf-content[data-type='file-explorer'] .nav-files-container"
	);
	return leafContent || null;
};

export function isOverEditor(plugin: ExplorerShortcuts): Element | null {
	return plugin.elementFromPoint?.closest('.workspace-leaf.mod-active') ?? null;
}

export function getExplorerView(plugin: ExplorerShortcuts): FileExplorerView {
	const { workspace } = plugin.app;
	return workspace.getLeavesOfType('file-explorer')?.first()?.view as FileExplorerView;
}

export function getExplorerFileItems(
	plugin: ExplorerShortcuts
): [string, FileTreeItem | FolderTreeItem][] {
	const fileExplorerView = getExplorerView(plugin);
	if (!fileExplorerView?.fileItems) return [];
	return Object.entries(fileExplorerView.fileItems);
}

export function getActiveExplorerEl(plugin: ExplorerShortcuts): HTMLElement | null {
	const view = getExplorerView(plugin);
	return view?.containerEl.querySelector('.is-active') ?? null;
}

///////////////// other ////////////////

export function getPathEls(_path: string): PathElements {
	return {
		dir: path.dirname(_path),
		name: path.basename(_path, path.extname(_path)),
		ext: path.extname(_path)
	};
}

export function showExplorerNotice(
	plugin: ExplorerShortcuts,
	message: string,
	duration = 3000,
	offsetX = 60,
	offsetY = -40
): void {
	if (!plugin.mousePosition) return;

	const tooltip = document.body.createDiv({
		cls: 'explorer-notice',
		text: message
	});

	Object.assign(tooltip.style, {
		position: 'fixed',
		top: `${plugin.mousePosition.y + offsetY}px`,
		left: `${plugin.mousePosition.x + offsetX}px`,
		backgroundColor: 'var(--interactive-accent)',
		color: 'var(--text-on-accent)',
		padding: '8px 16px',
		borderRadius: '4px',
		zIndex: '9999',
		pointerEvents: 'none',
		opacity: '1',
		transition: 'opacity 0.3s ease-out',
		whiteSpace: 'nowrap'
	});

	setTimeout(() => {
		tooltip.style.opacity = '0';
		setTimeout(() => tooltip.remove(), 300);
	}, duration);
}

export function triggerMouseMove(plugin: ExplorerShortcuts): void {
	if (!plugin.mousePosition) return;
	const e = new MouseEvent('mousemove', {
		clientX: plugin.mousePosition.x + 1,
		clientY: plugin.mousePosition.y + 1
	});
	document.dispatchEvent(e);
}

/**
 * Filters a list of items to exclude parent folders if any of their descendant files are also in the list.
 * This prevents performing redundant operations (e.g. copying both a folder and a file inside it).
 */
export function filterOutParentFolders<T>(
	items: T[],
	getPath: (item: T) => string,
	isFolder: (item: T) => boolean
): T[] {
	if (items.length <= 1) return items;

	const filePaths = items
		.filter((item) => !isFolder(item))
		.map((item) => getPath(item));

	if (filePaths.length === 0) return items;

	return items.filter((item) => {
		if (isFolder(item)) {
			const itemPath = getPath(item);
			const hasSelectedFilesInside = filePaths.some((filePath) =>
				filePath.startsWith(itemPath + '/')
			);
			return !hasSelectedFilesInside;
		}
		return true;
	});
}

////////////////Annexe////////////////////////

export async function blinkExplorerItem(
	item: [string, FileTreeItem | FolderTreeItem]
): Promise<void> {
	if (!item || !isNavFile(item[1].el)) return;
	const getFileEl = item[1].el.querySelector('.tree-item-self') as HTMLElement;
	blinkElement(getFileEl, 2, 500);
}

export function blinkElement(el: HTMLElement, times: number, interval: number): void {
	let counter = 0;

	const blinkInterval = setInterval((): void => {
		el.classList.toggle('reveal');
		counter++;

		if (counter >= times * 2) {
			clearInterval(blinkInterval);
			el.classList.remove('reveal');
		}
	}, interval);
}

/**
 * Checks whether a DOM element is fully visible within its scroll container.
 * Uses viewport-relative coordinates (getBoundingClientRect) for both elements.
 * The container's rect acts as the visible "window" — anything outside it
 * is hidden by CSS overflow, even if it exists in the DOM.
 * @param el - The element to check (e.g. a file item row).
 * @param container - The scrollable container (e.g. .nav-files-container).
 */
function isElementVisible(el: HTMLElement, container: HTMLElement): boolean {
    const elRect = el.getBoundingClientRect();        // position of the file row in the viewport
    const containerRect = container.getBoundingClientRect(); // visible window of the scroll container
    return elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom;
}

/**
 * Reveals a file in the file explorer, retrying if the element is not visible in the viewport.
 * @param plugin - The plugin instance.
 * @param file - The file to reveal.
 * @param timeout - Delay in ms between each attempt.
 * @param maxRetries - Maximum number of reveal attempts.
 */
export async function revealFileInExplorer(
    plugin: ExplorerShortcuts,
    file: TFile,
    timeout = 100,
    maxRetries = 3
): Promise<void> {
    const leaf = plugin.app.workspace.getLeavesOfType('file-explorer')[0];
    const view = leaf?.view as FileExplorerView;
    if (!view) return;

    const container = view.containerEl.querySelector('.nav-files-container') as HTMLElement | null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        view.revealInFolder(file);
        await new Promise((resolve) => setTimeout(resolve, timeout));

        // If we can't locate the element or container, assume success and bail
        const fileItem = view.fileItems?.[file.path];
        if (!fileItem?.el || !container) break;

        if (isElementVisible(fileItem.el, container)) break;
    }
}

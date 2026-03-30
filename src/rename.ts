import type ExplorerShortcuts from './main.js';
import { getElPath, getExplorerView, getHoveredElement } from './utils.js';

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
	tree.handleRenameFocusedItem(e);

	// Wait a little for the editable element to be created
	setTimeout((): void => {
		const input = view.containerEl.querySelector(
			'[contenteditable="true"]'
		) as HTMLElement | null;
		if (!input) return;

		// Disable space key in explorer while renaming
		const handleKeyDown = (e: KeyboardEvent): void => {
			if (e.key === ' ') {
				e.stopPropagation();
			}
		};

		input.addEventListener('keydown', handleKeyDown, true);

		const cleanup = (): void => {
			plugin.renaming = false;
			hovered.firstElementChild?.classList.remove('has-focus');
			input.removeEventListener('keydown', handleKeyDown, true);
		};

		input.addEventListener('blur', cleanup, { once: true });

		// Also add a listener for the Enter key
		input.addEventListener(
			'keydown',
			(e: KeyboardEvent): void => {
				if (e.key === 'Enter') {
					cleanup();
				}
			},
			{ once: true }
		);

		// Security: force the reset after a delay
		setTimeout((): void => {
			if (plugin.renaming) {
				cleanup();
			}
		}, 10000);
	}, 50);
}

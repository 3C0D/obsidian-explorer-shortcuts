import type ExplorerShortcuts from './main.ts';
import { getElPath, getExplorerView, getHoveredElement } from './utils.ts';

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
		let cleaned = false;
		const cleanup = (): void => {
			if (cleaned) return;
			cleaned = true;
			plugin.renaming = false;
			hovered.firstElementChild?.classList.remove('has-focus');
			input.removeEventListener('keydown', handleKeyDown, true);
		};

		const handleKeyDown = (e: KeyboardEvent): void => {
			if (e.key === ' ') {
				e.stopPropagation();
			} else if (e.key === 'Enter') {
				cleanup();
			}
		};

		input.addEventListener('keydown', handleKeyDown, true);

		input.addEventListener('blur', cleanup, { once: true });

		// Security: force the reset after a delay
		setTimeout((): void => {
			if (plugin.renaming) {
				cleanup();
			}
		}, 10000);
	}, 50);
}

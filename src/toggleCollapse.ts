import type { TFile } from 'obsidian';
import type ExplorerShortcuts from './main.ts';
import { getExplorerView, triggerMouseMove } from './utils.ts';
import type { FileExplorerView } from 'obsidian-typings';

const REVEAL_TIMEOUT = 50;

export function toggleCollapse(plugin: ExplorerShortcuts): void {
	// Target the toggle collapse/expand button based on its visual position.
	// The last button in the nav-action-button list is the toggle collapse/expand button.
	// Note: This approach is independent of the language (aria-label) but depends on the button order.
	// If Obsidian changes the button order or adds/removes buttons, this code may break.
	const view = getExplorerView(plugin);
	if (!view) return;
	const buttons = view.containerEl.querySelectorAll('.nav-action-button');
	const button = buttons[buttons.length - 1]; // Last button (most right)

	if (button) {
		const clickEvent = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		button.dispatchEvent(clickEvent);

		// Trigger a mouse move event to refresh the hover state
		triggerMouseMove(plugin);
	} else {
		console.warn('Toggle collapse/expand button not found');
	}
}

// it also exist in the API revealInFolder. to see...
export function reveal(plugin: ExplorerShortcuts, file: TFile): void {
	try {
		const leaf = plugin.app.workspace.getLeavesOfType('file-explorer')[0];
		const view = leaf?.view as FileExplorerView;
		view?.revealInFolder(file);
		// Focus on active leaf after a short delay to ensure UI has updated
		setTimeout((): void => {
			const activeLeaf = plugin.app.workspace.getLeaf(false);
			if (activeLeaf) {
				plugin.app.workspace.setActiveLeaf(activeLeaf, { focus: true });
			} else {
				console.warn('No active leaf found');
			}
		}, REVEAL_TIMEOUT);
	} catch (error) {
		console.error('Failed to reveal active file:', error);
	}
}

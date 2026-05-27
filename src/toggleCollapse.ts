import type { TFile } from 'obsidian';
import type ExplorerShortcuts from './main.ts';
import { getExplorerView, triggerMouseMove, revealFileInExplorer } from './utils.ts';

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

export async function reveal(plugin: ExplorerShortcuts, file: TFile): Promise<void> {
	try {
		await revealFileInExplorer(plugin, file);
		const activeLeaf = plugin.app.workspace.getLeaf(false);
		if (activeLeaf) {
			plugin.app.workspace.setActiveLeaf(activeLeaf, { focus: true });
		} else {
			console.warn('No active leaf found');
		}
	} catch (error) {
		console.error('Failed to reveal active file:', error);
	}
}

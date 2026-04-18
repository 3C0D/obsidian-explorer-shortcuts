import type { App } from 'obsidian';
import { Modal } from 'obsidian';

export function showExplorerShortcutsModal(app: App): void {
	const shortcuts = [
		'Space + Up/Down Arrow: Navigate between files and folders',
		'Space + Left Arrow: Toggle collapse/expand all folders',
		'Space + Right Arrow: Reveal the active file',
		'F2 or Space + R: Rename the selected file/folder',
		'Space + N: Create a new file',
		'Space + F: Create a new folder',
		'Space + X: mark(color) the hovered file/folder as cut (Press again to unmark)',
		'Space + C: mark(color) the hovered file/folder as copy (Press again to unmark)',
		'Space + V: Paste what have been marked as cut/copy to the hovered item (parent folder if file)',
		'Esc: Cancel all cut/copy markings',
		'Space + Delete: Delete the hovered file/folder (with confirmation or not depending on settings)',
		'Space + W: Open the hovered file in a new window',
		'Space + O: Open the hovered file/folder/root in the system explorer',
		'Space + H: Show this help modal'
	];

	const modal = new Modal(app);
	modal.titleEl.textContent = 'Explorer shortcuts reminder';
	modal.contentEl.innerHTML = shortcuts
		.map((shortcut) => `<p>${shortcut}</p>`)
		.join('');
	modal.open();
}

import { TFile, TFolder } from 'obsidian';
import type ExplorerShortcuts from './main.ts';
import { getElPath, getExplorerView, getHoveredElement, triggerMouseMove } from './utils.ts';


export async function createNewItem(
	plugin: ExplorerShortcuts,
	type: 'file' | 'folder'
): Promise<void> {
	const view = getExplorerView(plugin);
	if (!view) return;

	const hovered = getHoveredElement(plugin);
	const path = getElPath(hovered) || '/';

	let targetFolder: TFolder;

	if (path === '/') {
		targetFolder = plugin.app.vault.getRoot();
	} else {
		const hoveredItem = view.fileItems[path];
		const file = hoveredItem.file as TFile | TFolder;

		if (file instanceof TFile) {
			targetFolder = file.parent || plugin.app.vault.getRoot();
		} else if (file instanceof TFolder) {
			targetFolder = file;
		} else {
			targetFolder = plugin.app.vault.getRoot();
		}
	}

	plugin.isEditingNewItem = true;

	view.createAbstractFile(
		type,
		targetFolder as unknown as Parameters<typeof view.createAbstractFile>[1],
		true
	);

	if (type === 'file') {
		let cleaned = false;
		const cleanup = (): void => {
			if (cleaned) return;
			cleaned = true;
			plugin.isEditingNewItem = false;
			document.removeEventListener('blur', handleBlur, true);
			setTimeout((): void => {
				const fileExplorer = plugin.app.workspace.getLeavesOfType('file-explorer')[0];
				if (fileExplorer) {
					plugin.app.workspace.setActiveLeaf(fileExplorer, { focus: true });
					triggerMouseMove(plugin);
				}
			}, 100);
		};

		const handleBlur = (e: FocusEvent): void => {
			const target = e.target as HTMLElement;
			if (target?.classList?.contains('inline-title')) {
				cleanup();
			}
		};

		document.addEventListener('blur', handleBlur, true);

		// Safety timeout
		setTimeout((): void => {
			if (plugin.isEditingNewItem) {
				cleanup();
			}
		}, 10000);
	} else {
		let cleaned = false;
		const cleanup = (): void => {
			if (cleaned) return;
			cleaned = true;
			plugin.isEditingNewItem = false;
			document.removeEventListener('blur', handleBlur, true);
			document.removeEventListener('keydown', handleKeyDown, true);
			view.containerEl.querySelectorAll('.has-focus').forEach((el) => {
				el.classList.remove('has-focus');
			});
			setTimeout(() => {
				triggerMouseMove(plugin);
			}, 50);
		};

		const handleBlur = (e: FocusEvent): void => {
			const target = e.target as HTMLElement;
			if (target?.getAttribute('contenteditable') === 'true') {
				cleanup();
			}
		};

		const handleKeyDown = (e: KeyboardEvent): void => {
			const target = e.target as HTMLElement;
			if (target?.getAttribute('contenteditable') === 'true') {
				if (e.key === 'Enter') {
					setTimeout(cleanup, 50);
				}
			}
		};

		document.addEventListener('blur', handleBlur, true);
		document.addEventListener('keydown', handleKeyDown, true);

		// Safety timeout to reset the flag after 10 seconds if something goes wrong
		setTimeout((): void => {
			if (plugin.isEditingNewItem) {
				cleanup();
			}
		}, 10000);
	}
}

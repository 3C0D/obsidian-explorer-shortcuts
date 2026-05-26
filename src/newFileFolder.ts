import { TFile, TFolder } from 'obsidian';
import type ExplorerShortcuts from './main.ts';
import { getElPath, getExplorerView, getHoveredElement } from './utils.ts';

function waitForElement(
	parent: HTMLElement | Document,
	selector: string,
	timeout = 10000
): Promise<HTMLElement> {
	return new Promise((resolve, reject) => {
		const existing = parent.querySelector(selector);
		if (existing) {
			return resolve(existing as HTMLElement);
		}

		const observer = new MutationObserver(() => {
			const el = parent.querySelector(selector);
			if (el) {
				observer.disconnect();
				clearTimeout(timer);
				resolve(el as HTMLElement);
			}
		});

		observer.observe(parent instanceof Document ? parent.body : parent, {
			childList: true,
			subtree: true
		});

		const timer = setTimeout(() => {
			observer.disconnect();
			reject(new Error(`Timeout waiting for element: ${selector}`));
		}, timeout);
	});
}

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
		try {
			// Watch for the inline title element to appear
			const inlineTitleEl = await waitForElement(document, '.inline-title');

			// Disable space key in explorer while editing inline title
			const handleKeyDown = (e: Event): void => {
				if ((e as KeyboardEvent).key === ' ') {
					e.stopPropagation();
				}
			};

			inlineTitleEl.addEventListener('keydown', handleKeyDown, true);

			// Add blur handler to reset the flag
			inlineTitleEl.addEventListener(
				'blur',
				(): void => {
					plugin.isEditingNewItem = false;
					inlineTitleEl.removeEventListener('keydown', handleKeyDown, true);
					setTimeout((): void => {
						const fileExplorer =
							plugin.app.workspace.getLeavesOfType('file-explorer')[0];
						if (fileExplorer) {
							plugin.app.workspace.setActiveLeaf(fileExplorer, {
								focus: true
							});
						}
					}, 100);
				},
				{ once: true }
			);

			inlineTitleEl.addEventListener('keydown', (e: Event): void => {
				if ((e as KeyboardEvent).key === 'Enter') {
					e.preventDefault();
					(inlineTitleEl as HTMLElement).blur();
				}
			});
		} catch {
			plugin.isEditingNewItem = false;
		}
	} else {
		try {
			// For folders, watch for the editable element in explorer
			const editableFolder = await waitForElement(view.containerEl, '[contenteditable="true"]');

			// Disable space key in explorer while editing folder name
			const handleKeyDown = (e: Event): void => {
				if ((e as KeyboardEvent).key === ' ') {
					e.stopPropagation();
				}
			};

			editableFolder.addEventListener('keydown', handleKeyDown, true);

			// Add blur handler to reset the flag
			editableFolder.addEventListener(
				'blur',
				(): void => {
					plugin.isEditingNewItem = false;
					editableFolder.removeEventListener(
						'keydown',
						handleKeyDown,
						true
					);
					// Remove has-focus from all items in explorer
					view.containerEl.querySelectorAll('.has-focus').forEach((el) => {
						el.classList.remove('has-focus');
					});
				},
				{ once: true }
			);
		} catch {
			plugin.isEditingNewItem = false;
			// Clean up any lingering has-focus classes on failure
			view.containerEl.querySelectorAll('.has-focus').forEach((el) => {
				el.classList.remove('has-focus');
			});
		}
	}
}

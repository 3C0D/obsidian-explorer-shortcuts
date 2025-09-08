import { App, Modal, Scope, Setting } from "obsidian";

type ConfirmCallback = (confirmed: boolean) => void;

class ConfirmModal extends Modal {
	private confirm(confirmed: boolean): void {
		this.callback(confirmed);
		this.close();
	}

	constructor(
		app: App,
		public message: string,
		public callback: ConfirmCallback,
	) {
		super(app);
		this.scope = new Scope(this.scope);
		this.scope.register([], "Enter", (): void => {
			this.confirm(true);
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("p").setText(this.message);

		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon("checkmark")
					.setCta()
					.onClick((): void => this.confirm(true));
			})
			.addExtraButton((b) =>
				b.setIcon("cross")
					.onClick((): void => this.confirm(false))
			);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

async function openConfirmModal(
	app: App,
	message: string
): Promise<boolean> {
	return await new Promise((resolve) => {
		new ConfirmModal(
			app,
			message,
			(confirmed: boolean): void => {
				resolve(confirmed);
			}
		).open();
	});
}

export async function confirmation(
	message: string,
): Promise<boolean> {
	return await openConfirmModal(
		this.app,
		message
	);
}

export function showExplorerShortcutsModal(app: App): void {
	const shortcuts = [
		"Space + Up/Down Arrow: Navigate between files and folders",
		"Space + Left Arrow: Toggle collapse/expand all folders",
		"Space + Right Arrow: Reveal the active file",
		"F2 or Space + R: Rename the selected file/folder",
		"Space + N: Create a new file",
		"Space + F: Create a new folder",
		"Space + X: mark(color) the hovered file/folder as cut (Press again to unmark)",
		"Space + C: mark(color) the hovered file/folder as copy (Press again to unmark)",
		"Space + V: Paste what have been marked as cut/copy to the hovered item (parent folder if file)",
		"Esc: Cancel all cut/copy markings",
		"Space + Delete: Delete the hovered file/folder (with confirmation or not depending on settings)",
		"Space + W: Open the hovered file in a new window",
		"Space + O: Open the hovered file/folder/root in the system explorer",
		"Space + H: Show this help modal",
	];

	const modal = new Modal(app);
	modal.titleEl.textContent = "Explorer shortcuts reminder";
	modal.contentEl.innerHTML = shortcuts.map(shortcut => `<p>${shortcut}</p>`).join('');
	modal.open();
}
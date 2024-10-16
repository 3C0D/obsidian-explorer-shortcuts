import { App, Modal, Scope, Setting } from "obsidian";

type ConfirmCallback = (confirmed: boolean) => void;

class ConfirmModal extends Modal {
    private confirm(confirmed: boolean) {
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
		this.scope.register([], "Enter", () => {
			this.confirm(true);
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("p").setText(this.message);

		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon("checkmark")
					.setCta()
					.onClick(() => this.confirm(true))
			})
			.addExtraButton((b) =>
				b.setIcon("cross")
					.onClick(() => this.confirm(false))
			);
	}

	onClose() {
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
			(confirmed: boolean) => {
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

export function showExplorerShortcutsModal(app: App) {
    const shortcuts = [
        "Up/Down Arrow: Navigate between files and folders",
        "Left Arrow: Toggle collapse/expand all folders",
        "Right Arrow: Reveal the active file",
        "F2 or R: Rename the selected file/folder",
        "N: Create a new file",
        "F: Create a new folder",
        "X: Cut the hovered file/folder",
        "C: Copy the hovered file/folder",
        "Esc: Cancel all cut/copy operations",
        "V: Paste what have been marked as cut/copy",
        "Delete: Delete the selected file/folder (with confirmation or not depending on settings)",
        "W: Open the hovered file in a new window",
		"O: Open the hovered file/folder/root in the system explorer",
		"Ctrl+O: Over the editor open file/root(empty tab) in the system explorer.",
    ];

    const modal = new Modal(app);
    modal.titleEl.textContent = "Explorer shortcuts reminder";
    modal.contentEl.innerHTML = shortcuts.map(shortcut => `<p>${shortcut}</p>`).join('');
    modal.open();
}
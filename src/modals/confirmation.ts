import type { App } from 'obsidian';
import { Modal, Scope, Setting } from 'obsidian';

type ConfirmCallback = (confirmed: boolean) => void;

class ConfirmModal extends Modal {
	private resolved = false;

	/** Guards against double-resolve (Enter + click race). */
	private confirm(confirmed: boolean): void {
		if (this.resolved) return;
		this.resolved = true;
		this.callback(confirmed);
		this.close();
	}

	constructor(
		app: App,
		public message: string,
		public callback: ConfirmCallback
	) {
		super(app);
		this.scope = new Scope(this.scope);
		this.scope.register([], 'Enter', (): void => {
			this.confirm(true);
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('p').setText(this.message);
		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon('checkmark')
					.setCta()
					.onClick((): void => this.confirm(true));
			})
			.addExtraButton((b) =>
				b.setIcon('cross').onClick((): void => this.confirm(false))
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

/** Opens a confirmation modal with the given message, returns a Promise that resolves to true/false based on user choice. */
export async function confirmation(app: App, message: string): Promise<boolean> {
	return new Promise((resolve) => {
		new ConfirmModal(app, message, resolve).open();
	});
}

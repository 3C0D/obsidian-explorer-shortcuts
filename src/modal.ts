import { App, Modal, Scope, Setting } from "obsidian";

type ConfirmCallback = (confirmed: boolean) => void;

// https://github.com/eoureo/obsidian-runjs/blob/master/src/confirm_modal.ts#L51
class ConfirmModal extends Modal {
	constructor(
		app: App,
		public message: string,
		public callback: ConfirmCallback,
	) {
		super(app);
		this.scope = new Scope(this.scope);
		this.scope.register([], "Enter", (evt, ctx) => {
			this.callback(true);
			this.close();
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
					.onClick(() => {
						this.callback(true);
						this.close();
					});
			})
			.addExtraButton((b) =>
				b.setIcon("cross").onClick(() => {
					this.callback(false);
					this.close();
				})
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

export async function confirm(
	message: string,
): Promise<boolean> {
	return await openConfirmModal(
		this.app,
		message
	);
}

import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, Operation } from "./types/variables";
import { ESSettingTab } from "./settings";
import { keyDown, keyUp } from "./pressKey";
import { getEltFromMousePos, isOverExplorerNavContainer, isOverNavFile, isOverNavFolder } from "./utils";
import { ESSettings } from "./types/global";
import { showInOsExplorer } from "./showInOsExplorer";

export default class ExplorerShortcuts extends Plugin {
	settings: ESSettings;
	mousePosition: { x: number; y: number };
	elementFromPoint: Element | null = null;
	explorerfileContainer: Element | null = null;
	explorerfolderContainer: Element | null = null;
	renaming = false;
	isEditingNewItem = false;
	blockedKeys: Record<string, boolean> = {};
	operation: Operation | null = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ESSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.registerDomEvents.bind(this));

		this.addCommand({
			id: "show-in-syst-explorer",
			name: "Show in system explorer",
			callback: async () => {
				await showInOsExplorer(this);
			},
		});
	}

	private registerDomEvents(): void {
		this.registerDomEvent(document, "mousemove", mouseMoveEvents.bind(this));
		this.registerDomEvent(document, "keydown", keyDown.bind(this), true);
		this.registerDomEvent(document, "keyup", async (e) => await keyUp.call(this, e));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


function mouseMoveEvents(e: MouseEvent) {
	this.elementFromPoint = getEltFromMousePos(this, e);
	if (!isOverExplorerNavContainer(this)) return
	this.explorerfolderContainer = isOverNavFolder(this)
	this.explorerfileContainer = isOverNavFile(this)
}

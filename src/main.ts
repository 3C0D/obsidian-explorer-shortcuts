import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, Operation } from "./types/variables.js";
import { ESSettingTab } from "./settings.js";
import { keyDown, keyUp } from "./pressKey.js";
import { getEltFromMousePos, isOverExplorerNavContainer, isOverNavFile, isOverNavFolder } from "./utils.js";
import type { ESSettings } from "./types/global.js";
import { showInOsExplorer } from "./showInOsExplorer.js";

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
	taggedItems: Set<Element> | null = null;

	async onload(): Promise<void> {
		console.log("Loading Explorer Shortcuts");
		await this.loadSettings();
		this.addSettingTab(new ESSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.registerDomEvents.bind(this));

		this.addCommand({
			id: "show-in-syst-explorer",
			name: "Show in system explorer",
			callback: async (): Promise<void> => {
				await showInOsExplorer(this);
			},
		});
	}

	private registerDomEvents(): void {
		this.registerDomEvent(document, "mousemove", mouseMoveEvents.bind(this));
		this.registerDomEvent(document, "keydown", keyDown.bind(this), true);
		this.registerDomEvent(document, "keyup", async (e): Promise<void> => await keyUp.call(this, e));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

function mouseMoveEvents(e: MouseEvent): void {
	this.elementFromPoint = getEltFromMousePos(this, e);
	if (!isOverExplorerNavContainer(this)) return;
	this.explorerfolderContainer = isOverNavFolder(this);
	this.explorerfileContainer = isOverNavFile(this);
}

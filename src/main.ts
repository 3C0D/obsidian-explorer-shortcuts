import { Plugin } from 'obsidian';
import type { Operation } from './types/variables.ts';
import { DEFAULT_SETTINGS } from './types/variables.ts';
import { ESSettingTab } from './settings.ts';
import { keyDown, keyUp } from './pressKey.ts';
import {
	getEltFromMousePos,
	isOverExplorerNavContainer,
	isOverNavFile,
	isOverNavFolder
} from './utils.ts';
import type { ESSettings } from './types/global.ts';

export default class ExplorerShortcuts extends Plugin {
	settings!: ESSettings;
	mousePosition!: { x: number; y: number };
	elementFromPoint: Element | null = null;
	explorerfileContainer: Element | null = null;
	explorerfolderContainer: Element | null = null;
	renaming = false;
	isEditingNewItem = false;
	blockedKeys: Record<string, boolean> = {};
	pendingSpaceCombos: Record<string, boolean> = {};
	spacePressed = false;
	operation: Operation | null = null;
	taggedItems: Set<Element> | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new ESSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.registerDomEvents.bind(this));
	}

	private registerDomEvents(): void {
		this.registerDomEvent(document, 'mousemove', mouseMoveEvents.bind(this));
		// true = capture phase: intercepts keydown events at document level before propagation
		this.registerDomEvent(document, 'keydown', keyDown.bind(this), true);
		this.registerDomEvent(
			document,
			'keyup',
			async (e): Promise<void> => await keyUp.call(this, e)
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

function mouseMoveEvents(this: ExplorerShortcuts, e: MouseEvent): void {
	this.elementFromPoint = getEltFromMousePos(this, e);
	if (!isOverExplorerNavContainer(this)) return;
	this.explorerfolderContainer = isOverNavFolder(this);
	this.explorerfileContainer = isOverNavFile(this);
}

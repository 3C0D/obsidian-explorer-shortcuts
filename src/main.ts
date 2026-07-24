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
import type { ESSettings, MousePosition } from './types/global.ts';

export default class ExplorerShortcuts extends Plugin {
	settings!: ESSettings;
	mousePosition!: MousePosition;
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

	// Instance-specific throttle/debounce/state variables
	lastNavigationTime = 0;
	mouseMoveDebounceTimer: NodeJS.Timeout | null = null;
	shouldProcessKeyUp = false;
	applyToAll = false;

	async onload(): Promise<void> {
		try {
			await this.loadSettings();
		} catch (err) {
			console.error('Failed to load settings:', err);
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
		}
		this.addSettingTab(new ESSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.registerDomEvents.bind(this));
	}

	onunload(): void {
		if (this.mouseMoveDebounceTimer) {
			clearTimeout(this.mouseMoveDebounceTimer);
			this.mouseMoveDebounceTimer = null;
		}
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

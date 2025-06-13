import type { ESSettings } from "./global.js";


export enum Operation {
    Copy = "copy",
    Cut = "cut",
    Paste = "paste",
}

export const DEFAULT_SETTINGS: ESSettings = {
	focusNeeded: true,
	delConfirmFile: true,
	delConfirmFolder: true,
};

export enum ElementType {
    File = 'nav-file',
    Folder = 'nav-folder',
    FilesContainer = 'nav-files-container'
}

export enum ConflictAction {
    Increment = "increment",
    Replace = "replace",
    Cancel = "cancel"
}

export type NavigationDirection = 'up' | 'down';
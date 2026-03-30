declare module 'obsidian' {
	interface DataAdapter {
		getFullPath: (normalizedPath: string) => string;
		basePath: string;
	}
}


export interface ESSettings {
	delConfirmFile: boolean;
	delConfirmFolder: boolean;
	focusNeeded: boolean;
}

export interface MousePosition {
	x: number;
	y: number;
}

export interface PathElements {
	dir: string;
	name: string;
	ext: string;
}

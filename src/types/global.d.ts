// import { FileExplorerView } from "obsidian-typings";

import { TreeNode } from "obsidian-typings";

declare module "obsidian" {
    interface View {
        file: TFile,
    }

    interface Tree {
        /**
         * Handle deletion of selected nodes
         */
        handleDeleteSelectedItems: (e: KeyboardEvent) => Promise<void | undefined>;
    }

    type TreeItem<T> = TreeNode<T> & {
        collapseEl: HTMLElement;
        collapsed: boolean;
        collapsible: boolean;
        coverEl: HTMLElement;
        innerEl: HTMLElement;
        parent: TreeNode<T> | undefined;
        selfEl: HTMLElement;
        view: View;

        /**
         * Execute collapse functionality on mouse click
         */
        onCollapseClick(event: MouseEvent): void;
        /**
         * Execute item functionality on clicking tree item
         */
        onSelfClick(event: MouseEvent): void;
        /**
         * Set clickable state of tree item 
         */
        setClickable(clickable: boolean): void;
        /**
         * Set collapsed state of tree item
         */
        setCollapsed(collapsed: boolean, check: boolean): Promise<undefined>;
        /**
         * Set collapsible state of tree item
         */
        setCollapsible(collapsible: boolean): void;
        /**
         * Toggle collapsed state of tree item
         */
        toggleCollapsed(check: boolean): Promise<undefined>;
        /**
         * @internal Update the tree item's cover element
         */
        updateCollapsed(check: boolean): Promise<undefined>;
    }

}

export interface ESSettings {
    delConfirmFile: boolean,
    delConfirmFolder: boolean,
    focusNeeded: boolean
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
import ExplorerShortcuts from "./main.js";

const REVEAL_TIMEOUT = 50;

export function toggleCollapse(plugin: ExplorerShortcuts): void {
    const collapseButton = document.querySelector('.nav-action-button[aria-label="Collapse all"]');
    const expandButton = document.querySelector('.nav-action-button[aria-label="Expand all"]');
    const button = collapseButton || expandButton;

    if (button) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        button.dispatchEvent(clickEvent);

        // Trigger a mouse move event to refresh the hover state
        triggerMouseMove(plugin);
    } else {
        console.warn("Toggle collapse/expand button not found");
    }
}

export function triggerMouseMove(plugin: ExplorerShortcuts): void {
    // Trigger a mouse move event to refresh the selectedElements
    const e = new MouseEvent('mousemove', { clientX: plugin.mousePosition.x + 1, clientY: plugin.mousePosition.y + 1 });
    setTimeout(() => {
        document.dispatchEvent(e);
    }, 70);
}

// it also exist in the API revealInFolder. to see...
export function reveal(plugin: ExplorerShortcuts): void {
    try {
        // run twice to ensure the file is revealed on long trees
        plugin.app.commands.executeCommandById(
            "file-explorer:reveal-active-file"
        );
        plugin.app.commands.executeCommandById(
            "file-explorer:reveal-active-file"
        );

        // Focus on active leaf after a short delay to ensure UI has updated
        setTimeout((): void => {
            const activeLeaf = plugin.app.workspace.getLeaf(false);
            if (activeLeaf) {
                plugin.app.workspace.setActiveLeaf(activeLeaf, { focus: true });
            } else {
                console.warn("No active leaf found");
            }
        }, REVEAL_TIMEOUT);
    } catch (error) {
        console.error("Failed to reveal active file:", error);
    }
}
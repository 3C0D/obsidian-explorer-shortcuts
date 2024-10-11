import ExplorerShortcuts from "./main";

export function toggleCollapse() {
    let button = document.querySelector('.nav-action-button[aria-label="Collapse all"]');
    if (!button) button = document.querySelector('.nav-action-button[aria-label="Expand all"]');
    if (!button) return;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    button.dispatchEvent(clickEvent);
}

export async function reveal(plugin: ExplorerShortcuts) {
    const revealPromise1 = plugin.app.commands.executeCommandById("file-explorer:reveal-active-file");
    const revealPromise2 = plugin.app.commands.executeCommandById("file-explorer:reveal-active-file");
    await Promise.all([revealPromise1, revealPromise2]);
    // focus on active leaf
    setTimeout(async () => {
        plugin.app.workspace.setActiveLeaf(plugin.app.workspace.getLeaf(false), {
            focus: true,
        });
    }
        , 50);
}
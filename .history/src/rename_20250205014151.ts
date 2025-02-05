import ExplorerShortcuts from "./main";
import { getElPath, getExplorerView, getHoveredElement } from "./utils";

export async function rename(plugin: ExplorerShortcuts, e: KeyboardEvent): Promise<void> {
    const view = getExplorerView(plugin);
    if (!view) return

    const hovered = getHoveredElement(plugin)
    if (!hovered) return

    const tree = view.tree;
    if (!tree) return;

    const path = getElPath(hovered) || '/'
    const hoveredItem = view.fileItems[path]
    if (!hoveredItem) return

    tree.setFocusedItem(hoveredItem);
    //@ts-ignore
    tree.handleRenameFocusedItem(e)

// Attend un peu que l'élément éditable soit créé
    setTimeout(() => {
        const input = view.containerEl.querySelector('[contenteditable="true"]') as HTMLElement | null;
        if (!input) return;

        // Utilise addEventListener au lieu de onblur
        input.addEventListener('blur', () => {
            plugin.renaming = false;
            hovered.firstElementChild?.classList.remove("has-focus");
        }, { once: true }); // once: true garantit que le gestionnaire sera retiré après son exécution

        // Ajoute aussi un gestionnaire pour la touche Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                plugin.renaming = false;
                hovered.firstElementChild?.classList.remove("has-focus");
            }
        }, { once: true });

        // Sécurité: force la réinitialisation après un délai
        setTimeout(() => {
            if (plugin.renaming) {
                plugin.renaming = false;
                hovered.firstElementChild?.classList.remove("has-focus");
            }
        }, 10000);
    }, 50);
}
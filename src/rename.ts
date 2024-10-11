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
    tree.handleRenameFocusedItem()
    const input = view.containerEl.querySelector('[contenteditable="true"]') as HTMLInputElement | null;
    if (!input) return
    input.onblur = function () {
        plugin.renaming = false
        hovered.firstElementChild?.classList.remove("has-focus")
    }
}

// export function renameEl(plugin: ExplorerShortcuts, element: Element) {
//     const path = getElPath(element)
//     const firstchild = element.firstElementChild
//     if (!firstchild) return
//     firstchild.classList.add("has-focus")
//     const isNavFile = element.classList.contains("nav-file")
//     const input = isNavFile ? firstchild.children[0] as HTMLInputElement : firstchild.children[1] as HTMLInputElement ?? firstchild as HTMLInputElement
//     try {
//         input.setAttribute("contenteditable", "true");
//     } catch (e) {
//     }

//     input.focus();
//     const range = document.createRange();
//     range.selectNodeContents(input);
//     const selection = window.getSelection();
//     selection?.removeAllRanges();
//     selection?.addRange(range);

//     input.onclick = function (event) {
//         event.stopPropagation();
//         event.stopImmediatePropagation();
//     }
//     // add listeners enter escape and blur
//     input.onblur = handleBlur(plugin, firstchild, input, path, isNavFile);
//     input.onkeydown = handleKeyDown(plugin, firstchild, input, path);
// }

// function handleBlur(plugin: ExplorerShortcuts, firstchild: Element, input: HTMLInputElement, path: string, isNavFile: boolean) {
//     return async () => {
//         plugin.renaming = false
//         firstchild.classList.remove("has-focus")
//         input.removeAttribute("contenteditable");
//         const pathEls = getPathEls(path)
//         const pre = pathEls.dir === "." ? "" : pathEls.dir + "/"
//         const new_path = pre + input.textContent + pathEls.ext
//         const itemFile = plugin.app.vault.getAbstractFileByPath(path);

//         try {
//             await renameFileOrFolder(plugin, itemFile, new_path);
//         } catch {
//             plugin.renaming = false
//             return
//         }
//     }
// }

// function handleKeyDown(plugin: ExplorerShortcuts, firstchild: Element, input: HTMLInputElement, path: string) {
//     return async (e: KeyboardEvent) => {
//         if (e.key === "Enter") {
//             input.blur()
//         }
//         if (e.key === "Escape") {
//             plugin.renaming = false
//             firstchild.classList.remove("has-focus")
//             input.removeAttribute("contenteditable");
//             input.blur();
//         }
//     }
// }

// async function renameFileOrFolder(plugin: ExplorerShortcuts, itemFile: TAbstractFile | null, new_path: string) {
//     if (itemFile instanceof TFile) {
//         await plugin.app.fileManager.renameFile(itemFile, new_path);
//     } else {
//         await plugin.app.vault.rename(itemFile as TFolder, new_path);
//     }
// }

// export function getPathElements(_path: string) {
//     const pathEls = getPathEls(_path)
//     const pathWithoutExt = normalizePath(path.join(path.basename(_path, path.extname(_path))))
//     return { pathEls, pathWithoutExt }
// }

// export const selectValue = (input: HTMLInputElement | null) => {
//     input?.setSelectionRange(0, input?.value.length);
// };


# 🔍 Audit complet — `src/`

---

## 1. Incohérence des extensions d'import

> [!CAUTION]
> Le projet mélange `.ts` et `.js` dans les imports. Avec `"moduleResolution": "NodeNext"` et `"verbatimModuleSyntax": true`, il faut être cohérent.

| Fichier | Import avec `.ts` | Import avec `.js` |
|---|---|---|
| [pressKey.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L10) | `./modals/modal.ts` | `./cut-copy.js`, `./delete.js`, etc. |
| [navigateOverExplorer.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L3) | `./main.ts`, `./utils.ts` | — |
| [cut-copy.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/cut-copy.ts#L2-L4) | `./main.ts`, `./types/variables.ts`, `./utils.ts` | — |
| [delete.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/delete.ts#L2-L4) | `./main.ts`, `./modals/confirmation.ts`, `./utils.ts` | — |
| [main.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/main.ts#L2-L12) | — | tout en `.js` ✅ |
| [settings.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/settings.ts#L3) | — | `./main.js` ✅ |
| [rename.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/rename.ts#L1-L2) | — | `.js` ✅ |
| [paste.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/paste.ts#L4-L13) | — | `.js` ✅ |
| [newFileFolder.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/newFileFolder.ts#L2-L3) | — | `.js` ✅ |
| [showInOsExplorer.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/showInOsExplorer.ts#L2-L3) | — | `.js` ✅ |

**Recommandation** : Standardiser sur `.js` partout (convention la plus courante avec NodeNext + esbuild). 4 fichiers à corriger (`pressKey.ts`, `navigateOverExplorer.ts`, `cut-copy.ts`, `delete.ts`).

---

## 2. Bugs & problèmes logiques

### 2.1 Code mort dans `getEltFromMousePos`

```typescript
// utils.ts L20-29
export function getEltFromMousePos(plugin, event) {
    plugin.mousePosition = { x: event.clientX, y: event.clientY };
    if (plugin.mousePosition) {  // ← toujours true, on vient de l'assigner
        return document.elementFromPoint(...);
    }
    return null;  // ← dead code
}
```

Le `if (plugin.mousePosition)` est toujours vrai puisqu'on vient de l'assigner. Le `return null` est du code mort.

### 2.2 Variable globale `goToUp` dans `pressKey.ts`

[pressKey.ts L14](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L14) : `let goToUp = false` est un état global au niveau du module. Si jamais deux instances du plugin sont chargées (improbable mais pas impossible en dev), cela crée un état partagé. De plus, le nom est peu explicite — quelque chose comme `shouldProcessKeyUp` serait plus clair.

### 2.3 Variable globale mutable `applyToAll` dans `paste.ts`

[paste.ts L16](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/paste.ts#L16) : `let applyToAll = false` est un module-level mutable. Elle est réinitialisée dans `paste()` à L54 (`applyToAll = false`), mais est aussi modifiée dans `chooseAction` via le toggle. Fonctionnellement OK, mais un paramètre passé entre fonctions serait plus propre qu'un side-effect global.

### 2.4 Variables globales mutables pour le throttle dans `navigateOverExplorer.ts`

[navigateOverExplorer.ts L20-25](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L20-L25) : `lastNavigationTime` et `mouseMoveDebounceTimer` sont des globales mutables. Le `NodeJS.Timeout` comme type pourrait causer des soucis selon le runtime.

### 2.5 `delete.ts` : `deleteItem` et `triggerDelete` appelées séquentiellement sans await

[pressKey.ts L106-108](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L106-L108) :
```typescript
await deleteItem(this, e);
triggerDelete(this, e);
```
`triggerDelete` est appelée juste après `deleteItem` mais `deleteItem` peut afficher un modal de confirmation (qui est asynchrone). Si l'utilisateur annule, `triggerDelete` est quand même appelée et déclenche un `mousemove` inutile.

### 2.6 Paramètre inutilisé `evt` dans `triggerDelete`

[delete.ts L49](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/delete.ts#L49) : Le paramètre `evt: KeyboardEvent` n'est jamais utilisé dans le corps de la fonction.

### 2.7 `NavigationDirection` déclarée en double

- [variables.ts L27](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/types/variables.ts#L27) : `export type NavigationDirection = 'up' | 'down';`
- [navigateOverExplorer.ts L17](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L17) : `export type NavigationDirection = 'up' | 'down';`

Doublon. L'un des deux devrait être supprimé (celui dans `navigateOverExplorer.ts` puisque `variables.ts` est le bon endroit).

### 2.8 `toggleCollapse` fragile — sélection par index

[toggleCollapse.ts L10-11](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/toggleCollapse.ts#L10-L11) : Le commentaire dit "last button (most left)" mais la logique sélectionne le *dernier* `.nav-action-button` globalement dans le DOM — s'il y a plusieurs panneaux d'explorateur ou d'autres plugins qui ajoutent des boutons `.nav-action-button`, ça pourrait cibler le mauvais bouton.

### 2.9 Cast redondant et `any` dans `reveal`

[toggleCollapse.ts L46](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/toggleCollapse.ts#L46) : Le deuxième appel est casté en `any` sans raison valable — le premier appel à L44 fonctionne sans cast. C'est le même appel dupliqué.

---

## 3. Interfaces & types sous-utilisés

### 3.1 `MousePosition` et `PathElements` déclarés mais non utilisés

[global.d.ts L14-23](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/types/global.d.ts#L14-L23) :
- `MousePosition` → `mousePosition` dans `main.ts` est typé `{ x: number; y: number }` en dur au lieu d'utiliser cette interface.
- `PathElements` → `getPathEls` dans `utils.ts` retourne `{ dir, name, ext }` en inline au lieu d'utiliser ce type.

### 3.2 `focusNeeded` dans `ESSettings` jamais lu

[global.d.ts L11](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/types/global.d.ts#L11) : `focusNeeded` est dans `DEFAULT_SETTINGS` et `ESSettings`, mais n'est jamais utilisé nulle part dans le code.

### 3.3 `Operation.Paste` jamais utilisé

[variables.ts L6](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/types/variables.ts#L6) : L'enum `Operation` a `Paste = 'paste'` mais le code de paste ne l'utilise pas — la logique repose sur les classes CSS `'copy'`/`'cut'`.

---

## 4. Maintenabilité & lisibilité

### 4.1 `pressKey.ts` — Chaîne de `if` au lieu d'un switch/map

[pressKey.ts L52-127](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L52-L127) : La fonction `keyUp` contient ~15 blocs `if (e.key === 'x' && this.pendingSpaceCombos['x'])` quasi identiques. Ce pattern pourrait être remplacé par un map `key → handler` :

```typescript
const spaceComboHandlers: Record<string, (plugin: ExplorerShortcuts) => void | Promise<void>> = {
    'ArrowLeft': (p) => toggleCollapse(p),
    'ArrowRight': (p) => reveal(p),
    'n': (p) => createNewItem(p, 'file'),
    // ...
};
```

### 4.2 Liste de touches dupliquée dans `keyDown` et `keysToBlock`

[pressKey.ts L155-170](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L155-L170) et [L190-205](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/pressKey.ts#L190-L205) : La liste des touches est dupliquée exactement entre les deux fonctions. Extraire dans une constante partagée.

### 4.3 Pattern de `setInterval` pour attendre un élément DOM

[newFileFolder.ts L42-82](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/newFileFolder.ts#L42-L82) : Le polling avec `setInterval` pour détecter l'apparition d'un élément dans le DOM est fragile et sans timeout max (seul le timeout de sécurité à 10s en fin de fonction). Un `MutationObserver` serait plus robuste et performant.

### 4.4 Logique de sélection dupliquée entre `cut-copy.ts` et `paste.ts`

Le filtrage des dossiers parents contenant des fichiers sélectionnés est implémenté dans [cut-copy.ts L124-148](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/cut-copy.ts#L124-L148) ET [paste.ts L31-49](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/paste.ts#L31-L49). Cette logique devrait être factorisée.

### 4.5 `triggerMouseMove` dupliquée

La fonction qui déclenche un `mousemove` synthétique existe à 3 endroits :
- [toggleCollapse.ts L28-37](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/toggleCollapse.ts#L28-L37) (`triggerMouseMove`)
- [navigateOverExplorer.ts L31-46](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L31-L46) (`triggerMouseMoveForNavigation`)
- [delete.ts L51-57](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/delete.ts#L51-L57) (inline dans `triggerDelete`)

Devrait être une seule fonction dans `utils.ts`.

### 4.6 Commentaire en français

[navigateOverExplorer.ts L71-72](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L71-L72) et [L313](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L313) : Commentaires en français dans le code source. Devrait être en anglais pour la cohérence.

---

## 5. Robustesse & sécurité

### 5.1 `showInOsExplorer` — Injection de commande potentielle

[showInOsExplorer.ts L34](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/showInOsExplorer.ts#L34) :
```typescript
exec(`explorer.exe /select,"${dirPath.replace(/\//g, '\\')}"`)
```
Utilise `child_process.exec` avec interpolation de string. Si un nom de dossier contient des guillemets ou des caractères spéciaux, cela peut causer des problèmes voire une injection de commande. Utiliser `execFile` ou `shell.showItemInFolder` partout (qui est déjà utilisé pour les autres OS).

### 5.2 `settings.ts` — `import type MyPlugin` au lieu du vrai nom

[settings.ts L3](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/settings.ts#L3) : `import type MyPlugin from './main.js'` — le plugin s'appelle `ExplorerShortcuts`, pas `MyPlugin`. C'est un vestige du template Obsidian. Fonctionne mais prête à confusion.

### 5.3 `confirmation.ts` — Le modal ne résout jamais si fermé avec Escape

[confirmation.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/modals/confirmation.ts) : Si l'utilisateur ferme le modal avec Escape (via le comportement natif d'Obsidian), la Promise ne sera jamais résolue car `onClose()` ne résout pas le callback. Le `confirmed` restera en attente indéfiniment.

**Fix** : Ajouter dans `onClose()` :
```typescript
onClose(): void {
    this.confirm(false);  // resolve as cancelled if closed without choice
    this.contentEl.empty();
}
```

### 5.4 `rename.ts` — `e.key === 'Enter'` listener ajouté en double

[rename.ts L35](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/rename.ts#L35) et [L46-53](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/rename.ts#L46-L53) : Deux listeners `keydown` sur le même input — un pour bloquer l'espace (L35, permanent) et un pour Enter (L46, `{once: true}`). Si Enter est pressé, `cleanup()` est appelé deux fois (une par le listener Enter, une par le `blur` que le Enter provoque nativement) — heureusement le deuxième appel est inoffensif ici, mais c'est un pattern fragile.

### 5.5 `modal.ts` — Usage de `innerHTML` avec du contenu utilisateur

[modal.ts L24](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/modals/modal.ts#L24) : `modal.contentEl.innerHTML = ...` avec des chaînes statiques ici, donc pas de risque XSS. Mais `innerHTML` devrait être évité par principe — utiliser `createEl('p', { text: shortcut })` (API Obsidian) serait plus safe et idiomatique.

---

## 6. Performance

### 6.1 `mousemove` écouteur sans throttle

[main.ts L35](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/main.ts#L35) : L'événement `mousemove` fire des dizaines de fois par seconde et exécute `document.elementFromPoint()` + plusieurs `closest()` à chaque fois. Un throttle (même à 16ms / 60fps) réduirait la charge.

### 6.2 `getNavFilesContainerItems` requête DOM globale

[utils.ts L66-70](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/utils.ts#L66-L70) : `document.querySelectorAll()` sur tout le document. Devrait être scopé au conteneur de l'explorateur pour être plus performant et précis.

### 6.3 `ensureActiveElementVisible` — double boucle avec double `setTimeout`

[navigateOverExplorer.ts L80-101](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L80-L101) : La boucle `for (let i = 0; i < 2; i++)` qui appelle `getExplorerFileItems`, itère sur tous les items, et attend 50ms à chaque tour, est coûteuse. Le commentaire dit "twice to ensure visibility" — fragile et potentiellement inutile.

---

## 7. Divers

### 7.1 Code commenté à supprimer

- [utils.ts L119-123](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/utils.ts#L119-L123) : `collapseAllExplorerFolders` commenté avec le commentaire "Unused - can be commented out".
- [styles.css L34-51](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/styles.css#L34-L51) : Animations `@keyframes flash` et `.reveal` commentées.

### 7.2 Variable `_` inutilisée

[navigateOverExplorer.ts L84](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L84) : `const [path, _] = activeItem;` — Le `_` n'est pas utilisé. Peut être simplifié en `const path = activeItem[0];` ou `const [path] = activeItem;`.

### 7.3 `onload` ne gère pas les erreurs de `loadSettings`

[main.ts L28-32](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/main.ts#L28-L32) : Si `loadSettings()` échoue, le plugin continuera avec un `settings` `undefined` puisque le champ est `settings!: ESSettings` (non-null assertion). Pas de try/catch.

### 7.4 Message de notice "End of list" en double

[navigateOverExplorer.ts L64](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L64) montre `new Notice('End of list', 800)` et [L177-178](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/navigateOverExplorer.ts#L177-L178) montre `showExplorerNotice(plugin, 'End of explorer tree', 1500)`. L'utilisateur voit potentiellement 2 messages différents ("End of list" puis "End/Start of explorer tree") pour le même événement.

### 7.5 Pas de méthode `onunload` dans le plugin

[main.ts](file:///c:/Users/dd200/Documents/Mes_projets/Mes%20repo%20obsidian%20new/obsidian-explorer-shortcuts/src/main.ts) : Pas de `onunload()`. Les `registerDomEvent` d'Obsidian gèrent le cleanup automatiquement, mais les timers globaux dans `navigateOverExplorer.ts` (`mouseMoveDebounceTimer`) ne seront jamais nettoyés si le plugin est désactivé.

---

## Résumé par priorité

| Priorité | Problème | Fichier(s) |
|---|---|---|
| 🔴 **Critique** | Promise jamais résolue si Escape dans confirmation modal | `confirmation.ts` |
| 🔴 **Critique** | Injection de commande potentielle avec `exec` | `showInOsExplorer.ts` |
| 🟠 **Important** | Incohérence extensions `.ts`/`.js` (4 fichiers) | `pressKey.ts`, `navigateOverExplorer.ts`, `cut-copy.ts`, `delete.ts` |
| 🟠 **Important** | `triggerDelete` appelée même si suppression annulée | `pressKey.ts` |
| 🟠 **Important** | Timers globaux non nettoyés au unload | `navigateOverExplorer.ts` |
| 🟡 **Moyen** | Code dupliqué : `triggerMouseMove` × 3 | `toggleCollapse.ts`, `navigateOverExplorer.ts`, `delete.ts` |
| 🟡 **Moyen** | Logique filtrage parents dupliquée | `cut-copy.ts`, `paste.ts` |
| 🟡 **Moyen** | `setInterval` polling au lieu de `MutationObserver` | `newFileFolder.ts` |
| 🟡 **Moyen** | Chaîne de if → map dans `keyUp`/`keysToBlock` | `pressKey.ts` |
| 🟡 **Moyen** | `mousemove` sans throttle | `main.ts` |
| 🟢 **Mineur** | Types/interfaces non utilisés (`MousePosition`, `PathElements`, `focusNeeded`) | `global.d.ts`, `variables.ts` |
| 🟢 **Mineur** | `NavigationDirection` déclaré en double | `variables.ts`, `navigateOverExplorer.ts` |
| 🟢 **Mineur** | Code mort (`getEltFromMousePos`), code commenté, `innerHTML` | `utils.ts`, `styles.css`, `modal.ts` |
| 🟢 **Mineur** | Nom d'import `MyPlugin` au lieu de `ExplorerShortcuts` | `settings.ts` |

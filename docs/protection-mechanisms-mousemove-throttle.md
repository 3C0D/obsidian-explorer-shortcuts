# Mouse Event Protection Mechanisms: mousemove, debounce, and throttle

## Overview

The plugin uses three complementary mechanisms to control the frequency and triggering of mouse and navigation events. Their shared goal is to prevent processing overloads while maintaining a smooth user experience.

```
┌─────────────────────────────────────────────────────────────┐
│               mouseMoveEvents (main.ts)                     │
│           Throttle via requestAnimationFrame                │
│      Updates elementFromPoint / explorer containers         │
└──────────────────────┬──────────────────────────────────────┘
                       │ triggered by real mouse movement
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             triggerMouseMove (utils.ts)                     │
│     Dispatches a synthetic mousemove (+1px offset)          │
│     Forces a hover state refresh after keyboard navigation  │
└──────────────────────┬──────────────────────────────────────┘
                       │ called by
                       ▼
┌─────────────────────────────────────────────────────────────┐
│      triggerMouseMoveForNavigation (navigateOverExplorer)   │
│      Debounce 500ms — fires only after navigation stops     │
└──────────────────────┬──────────────────────────────────────┘
                       │ called inside
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           navigateOverExplorer (throttle 200ms)             │
│      Limits the rate of navigation jumps                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. `mouseMoveEvents` — Native rAF throttle

**File:** `src/main.ts`

```ts
let isThrottling = false;
function mouseMoveEvents(this: ExplorerShortcuts, e: MouseEvent): void {
    if (isThrottling) return;
    isThrottling = true;
    window.requestAnimationFrame(() => {
        isThrottling = false;
    });

    this.elementFromPoint = getEltFromMousePos(this, e);
    if (!isOverExplorerNavContainer(this)) return;
    this.explorerfolderContainer = isOverNavFolder(this);
    this.explorerfileContainer = isOverNavFile(this);
}
```

**Mechanism:** `isThrottling` (closure) blocks any re-entry until `requestAnimationFrame` releases the lock, synchronizing execution with the monitor refresh rate (~16.6 ms at 60 Hz). The function runs at most once per frame regardless of mouse event frequency.

**Updates:**
- `elementFromPoint` — DOM element under the cursor
- `explorerfileContainer` / `explorerfolderContainer` — currently hovered explorer containers

---

## 2. `triggerMouseMove` — Synthetic mouse event

**File:** `src/utils.ts`

```ts
export function triggerMouseMove(plugin: ExplorerShortcuts): void {
    if (!plugin.mousePosition) return;
    const e = new MouseEvent('mousemove', {
        clientX: plugin.mousePosition.x + 1,
        clientY: plugin.mousePosition.y + 1
    });
    document.dispatchEvent(e);
}
```

**Mechanism:** Dispatches a synthetic `MouseEvent` with a +1px offset on both axes. The offset prevents some handlers from ignoring an event at an identical position. Dispatching on `document` re-triggers `mouseMoveEvents` (registered via `registerDomEvent`).

**Purpose:** Forces a hover state refresh after keyboard navigation. Without this, the hover would remain frozen on the previously active element.

**Note:** Never called in a loop; always triggered punctually from controlled call sites.

---

## 3. `triggerMouseMoveForNavigation` — Post-navigation debounce

**File:** `src/navigateOverExplorer.ts`

```ts
const MOUSE_MOVE_DEBOUNCE = 500;

function triggerMouseMoveForNavigation(plugin: ExplorerShortcuts): void {
    if (plugin.mouseMoveDebounceTimer) {
        clearTimeout(plugin.mouseMoveDebounceTimer);
    }
    plugin.mouseMoveDebounceTimer = setTimeout(() => {
        triggerMouseMove(plugin);
        plugin.mouseMoveDebounceTimer = null;
    }, MOUSE_MOVE_DEBOUNCE);
}
```

**Mechanism:** Classic debounce at 500 ms. Each call resets the timer via `clearTimeout`. `mouseMoveDebounceTimer` is stored on the plugin instance so it can be cleaned up in `onunload()` and cancelled by other call sites (e.g., `triggerDelete`).

**Purpose:** Prevents `triggerMouseMove` from firing during rapid keyboard navigation. The synthetic event is dispatched only 500 ms after the last navigation action.

---

## 4. `navigateOverExplorer` — Navigation throttle

**File:** `src/navigateOverExplorer.ts`

```ts
const NAVIGATION_THROTTLE = 200;

export async function navigateOverExplorer(
    plugin: ExplorerShortcuts,
    direction: NavigationDirection = 'down'
): Promise<void> {
    const currentTime = Date.now();
    if (currentTime - plugin.lastNavigationTime < NAVIGATION_THROTTLE) {
        return;
    }
    plugin.lastNavigationTime = currentTime;
    // ...
}
```

**Mechanism:** Timestamp-based throttle. `Date.now()` measures the real interval between two calls; `lastNavigationTime` is updated only when a navigation is allowed. Maximum rate: 5 actions/second.

**Purpose:** Prevents uncontrolled file jumps when a navigation key is held down. Protects both the UI and Obsidian's event system.

---

## Summary

| Mechanism | Type | Value | Triggered by | Guards against |
|---|---|---|---|---|
| `mouseMoveEvents` | rAF throttle | ~16 ms (1 frame) | Real mouse | DOM event flooding |
| `triggerMouseMove` | Synthetic event | — | Code (navigation, delete) | Stale hover state |
| `triggerMouseMoveForNavigation` | Debounce | 500 ms | Keyboard navigation | Redundant synthetic events |
| `navigateOverExplorer` | Throttle | 200 ms | Keyboard navigation | Excessively rapid jumps |

---

## Interaction flow

1. User navigates with keyboard → `navigateOverExplorer` (throttle 200 ms).
2. Each allowed navigation calls `triggerMouseMoveForNavigation` (debounce 500 ms).
3. After 500 ms of inactivity, `triggerMouseMove` dispatches a synthetic event.
4. `mouseMoveEvents` (rAF throttle) picks it up and updates the explorer containers.

---

## Lifecycle management

**`onunload()` in `main.ts`:**

```ts
onunload(): void {
    if (this.mouseMoveDebounceTimer) {
        clearTimeout(this.mouseMoveDebounceTimer);
        this.mouseMoveDebounceTimer = null;
    }
}
```

`mouseMoveDebounceTimer` covers both `triggerMouseMoveForNavigation` and `triggerDelete` (both write to the same slot), preventing memory leaks on plugin unload.

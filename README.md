# Obsidian Explorer Shortcuts

A plugin for Obsidian that enhances file navigation and manipulation in the explorer using keyboard shortcuts.

## Key Features

- **Efficient Copy/Cut and Paste**: Files and folders are highlighted when copied or cut, allowing you to navigate directly to the destination for pasting without dragging or using complex context menus. When pasting, you can choose to increment the name or replace the existing file/folder if a conflict occurs.
- **Explorer-Editor Synergy**: Use arrow keys to browse files in the explorer, automatically displaying them in the editor. Right/left arrows reveal or collapse folders, enhancing file structure visualization.
- **Space-Prefixed Actions**: All shortcuts require holding Space first to prevent accidental activation when hovering over the file explorer.

## Quick Help

Press **Space + H** while hovering over the file explorer to display a modal with a reminder of all available shortcuts.

## Why Use Explorer Shortcuts?

- Simplifies file management tasks
- Reduces reliance on mouse interactions
- Speeds up your Obsidian workflow
- Prevents accidental shortcut activation with Space-prefixed system

## Navigation

- **Space + Up/Down Arrow**: Navigate between files and folders in the explorer tree and view them in the editor. The plugin automatically unfolds parent folders and scrolls to the active file for effortless navigation.
- **Space + Left Arrow**: Toggle collapse/expand all folders in the explorer tree (synced with the UI button in the explorer header).
- **Space + Right Arrow**: Reveal the active file in the explorer tree and scroll to it.

## File/Folder Actions

N.B: Shortcuts are triggered when keys are released

- **Space + H**: Show a modal with a reminder of all available shortcuts.
- **F2 or Space + R**: Rename the selected file/folder.
- **Space + N**: Create a new file.
- **Space + F**: Create a new folder.
- **Space + X**: Mark(color) the hovered file/folder as Cut (Press again to unmark). You can also select multiple files/folders and press Space + X to mark them all.
- **Space + C**: Mark(color) the hovered file/folder as Copy (Press again to unmark). You can also select multiple files/folders and press Space + C to mark them all.
- **Space + V**: Paste what have been marked as cut/copy to the hovered item (parent folder if file). You can mix and paste multiple files/folders simultaneously.
- **Esc**: Unmark all cut/copy.
- **Space + Delete**: Delete the hovered file/folder. By default, a confirmation dialog is shown for folders, but not for files. You can change this behavior in the plugin settings... You can still use the default Obsidian Delete after on a focused file.
- **Space + W**: Open the hovered file in a new window.
- **Space + O**: Open the hovered file/folder/root[^1] in the system explorer.

## Commands

- Show in system explorer: Over the editor open file or root[^1](if empty tab) in the system explorer. Recommanded shortcut: **Ctrl+O**.

## Settings

- **Confirmation on Deleting**: Prompts for confirmation before deleting files or folders.

## For Development

### Configuration

Create a `.env` file with your vault paths:

```env
TEST_VAULT=C:\path\to\test\vault
REAL_VAULT=C:\path\to\real\vault
```

### Commands

```bash
yarn start      # Development with hot reload
yarn build      # Production build
yarn real       # Build + install real vault
yarn acp        # Add-commit-push Git
yarn bacp       # Build + add-commit-push
yarn v          # Update version
yarn h          # Help
```

Explorer Shortcuts streamlines your Obsidian file management, boosting your productivity and efficiency with its Space-prefixed shortcut system that prevents accidental activation.

[^1]: The root folder is the root of the Obsidian vault.

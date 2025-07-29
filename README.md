# Obsidian Explorer Shortcuts

A plugin for Obsidian that enhances file navigation and manipulation in the explorer using keyboard shortcuts.

## Key Features

- **Efficient Copy/Cut and Paste**: Files and folders are highlighted when copied or cut, allowing you to navigate directly to the destination for pasting without dragging or using complex context menus. When pasting, you can choose to increment the name or replace the existing file/folder if a conflict occurs.
- **Explorer-Editor Synergy**: Use arrow keys to browse files in the explorer, automatically displaying them in the editor. Right/left arrows reveal or collapse folders, enhancing file structure visualization.
- **One-Key Actions**: Perform common file operations (copy, cut, paste, rename, delete...) with single key presses.

## Quick Help

Press **Space + H** while hovering over the file explorer to display a modal with a reminder of all available shortcuts.

## Why Use Explorer Shortcuts?

- Simplifies file management tasks
- Reduces reliance on mouse interactions
- Speeds up your Obsidian workflow

## Navigation

- **Up/Down Arrow**: Navigate between files and folders in the explorer tree and view them in the editor. The plugin automatically unfolds parent folders and scrolls to the active file for effortless navigation.
- **Left Arrow**: Toggle collapse/expand all folders in the explorer tree (synced with the UI button in the explorer header).
- **Right Arrow**: Reveal the active file in the explorer tree and scroll to it.

## File/Folder Actions

N.B: Shortcuts are triggered when keys are released

- **Space + H**: Show a modal with a reminder of all available shortcuts.
- **F2 or Space + R**: Rename the selected file/folder.
- **Space + N**: Create a new file.
- **Space + F**: Create a new folder.
- **Space + X**: Mark(color) the hovered file/folder as Cut (Press again to unmark). You can also select multiple files/folders and press X to mark them all.
- **Space + C**: Mark(color) the hovered file/folder as Copy (Press again to unmark). You can also select multiple files/folders and press C to mark them all.
- **Space + V**: Paste what have been marked as cut/copy to the hovered item (parent folder if file). You can mix and paste multiple files/folders simultaneously.
- **Esc**: Unmark all cut/copy.
- **Delete**: Delete the hovered file/folder. By default, a confirmation dialog is shown for folders, but not for files. You can change this behavior in the plugin settings... You can still use the default Obsidian Delete after on a focused file.
- **Space + W**: Open the hovered file in a new window.
- **Space + O**: Open the hovered file/folder/root[^1] in the system explorer.

## Commands

- Show in system explorer: Over the editor open file or root[^1](if empty tab) in the system explorer. Recommanded shortcut: **Ctrl+O**.

## Settings

- **Confirmation on Deleting**: Prompts for confirmation before deleting files or folders.

Explorer Shortcuts streamlines your Obsidian file management, boosting your productivity and efficiency.

[^1]: The root folder is the root of the Obsidian vault.

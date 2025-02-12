# Obsidian Explorer Shortcuts

A plugin for Obsidian that enhances file navigation and manipulation in the explorer using keyboard shortcuts.

## Key Features

- **Efficient Copy/Cut and Paste**: Files and folders are highlighted when copied or cut, allowing you to navigate directly to the destination for pasting without dragging or using complex context menus. When pasting, you can choose to increment the name or replace the existing file/folder if a conflict occurs.
- **Explorer-Editor Synergy**: Use arrow keys to browse files in the explorer, automatically displaying them in the editor. Right/left arrows reveal or collapse folders, enhancing file structure visualization.
- **One-Key Actions**: Perform common file operations (rename, create, delete) with single key presses.

## Quick Help

Press **h** while hovering over the file explorer to display a modal with a reminder of all available shortcuts.

## Why Use Explorer Shortcuts?

- Simplifies file management tasks
- Reduces reliance on mouse interactions
- Speeds up your Obsidian workflow

## Navigation

- **Up/Down Arrow**: Navigate between files and folders in the explorer tree and view them in the editor. The plugin automatically unfolds parent folders and scrolls to the active file for effortless navigation.
- **Left Arrow**: Toggle collapse/expand all folders in the explorer tree (synced with the UI button in the explorer header).
- **Right Arrow**: Reveal the active file in the explorer tree and scroll to it.

## File/Folder Actions

- **h**: Show a modal with a reminder of all available shortcuts.  
  
- **F2 or R**: Rename the selected file/folder.
- **N**: Create a new file.
- **F**: Create a new folder.
- **X**: Mark(color) the hovered file/folder as Cut (Press again to unmark).
- **C**: Mark(color) the hovered file/folder as Copy (Press again to unmark).
- **Esc**: Unmark all cut/copy.
- **V**: Paste what have been marked as cut/copy to the hovered item (parent folder if file). You can mix and paste multiple files/folders simultaneously.
- **Delete**: Delete the hovered file/folder. By default, a confirmation dialog is shown for folders, but not for files. You can change this behavior in the plugin settings... You can still use the default Obsidian Delete after on a focused file.
- **W**: Open the hovered file in a new window.
- **O**: Open the hovered file/folder/root[^1] in the system explorer.

## Commands

- Show in system explorer: Over the editor open file or root[^1](if empty tab) in the system explorer. Recommanded shortcut: **Ctrl+O**.



## Settings

- **Confirmation on Deleting**: Prompts for confirmation before deleting files or folders.

Explorer Shortcuts streamlines your Obsidian file management, boosting your productivity and efficiency.  
  
## Development

This plugin uses a template that automates the development and publication processes on GitHub, including releases. You can develop either inside or outside your Obsidian vault.

### Environment Setup

#### File Structure
- All source files must be in the `src` folder:
  - `main.ts`
  - `styles.css`

> **Note:** If `styles.css` is accidentally placed in the root folder instead of `src`, it will be automatically moved to the correct location when running any development command. After building, a copy of `styles.css` will appear in the root folder as part of the normal release process.

#### Development Options
1. **Inside the vault's plugins folder:**
   - Delete the `.env` file
   - Run npm commands as usual

2. **Outside the vault:**
   - Set the paths in the `.env` file:
     - `TestVault` for development
     - `RealVault` for production simulation
   - Necessary files will be automatically copied to the targeted vault

### Available Commands

- `npm run start`: Opens VS Code, runs `npm install`, then `npm run dev`
- `npm run dev`: For development
- `npm run build`: Builds the project
- `npm run real`: Simulates a traditional plugin installation in your REAL vault
- `npm run bacp`: Builds, adds, commits, and pushes (prompts for commit message)
- `npm run acp`: Adds, commits, and pushes (without building)
- `npm run version`: Updates version, modifies relevant files, then adds, commits, and pushes
- `npm run release`: Creates a GitHub release (prompts for release title, can be multiline using `\n`)

### Recommended Workflow

1. `npm run start`
2. `npm run bacp`
3. `npm run version`
4. `npm run release`

### Additional Features

- **obsidian-typings**: This template automatically includes obsidian-typings, providing access to additional types not present in the official API.

[^1]: The root folder is the root of the Obsidian vault.

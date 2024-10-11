Obsidian Explorer Shortcuts
Supercharge Your Obsidian File Explorer with Keyboard Shortcuts

Explorer Shortcuts is an Obsidian plugin that empowers you to navigate and manipulate your files in the Obsidian file explorer faster and more efficiently using keyboard shortcuts.

Key Features:

Effortless Navigation and Actions:

    No Clicks Needed! Simply hover over a file or folder in the explorer tree and use the shortcuts. You don't need to click to select items before pressing the shortcuts.

    Seamless Navigation: Use Up/Down Arrow keys to easily navigate between files and folders in the explorer tree. The plugin automatically unfolds parent folders and scrolls to the active file for easy viewing in the editor.

    Instant Actions: Use F2 or R to rename, N to create new files, F to create new folders, X to cut, C to copy, V to paste, and Delete to delete files and folders directly without needing to open the context menu.

    Multi-Paste: Copy or cut multiple files/folders, then navigate to the destination folder and paste them all at once with a single shortcut.

Why Explorer Shortcuts?

    Faster File Management: Say goodbye to tedious clicks and scrolling. Get your work done quickly and efficiently.

    Improved Workflow: Streamline your file organization and boost your productivity.

    Enhanced File Explorer: Enjoy a much more intuitive and responsive way to manage your Obsidian files.

Detailed Features

Navigation:

    Up/Down Arrow: Navigate between files and folders in the explorer tree and view them in the editor. The plugin automatically unfolds parent folders and scrolls to the active file for effortless navigation.

    Left Arrow: Toggle collapse/expand all folders in the explorer tree (synced with the UI button in the explorer header).

    Right Arrow: Reveal the active file in the explorer tree and scroll to it.

File/Folder Actions:

    F2 or R: Rename the selected file/folder.

    N: Create a new file.

    F: Create a new folder.

    X: Cut the selected file/folder (Press again to cancel).

    C: Copy the selected file/folder (Press again to cancel).

    Esc: Cancel all operations.

    V: Paste the cut or copied file/folder into the current folder. You can mix and paste multiple files/folders simultaneously.

    Delete: Delete the selected file/folder. By default, a confirmation dialog is shown for folders, but not for files. Be careful not to accidentally press Delete while hovering over the explorer tree. To avoid this, enable both confirmations in the plugin settings. You can still use the default Obsidian Delete button after focusing on a file in the explorer.

Settings:

** Confirmation on Deleting: Prompts for confirmation before deleting files or folders.

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

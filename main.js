/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
var ge=Object.create;var b=Object.defineProperty;var ye=Object.getOwnPropertyDescriptor;var Fe=Object.getOwnPropertyNames;var Ie=Object.getPrototypeOf,be=Object.prototype.hasOwnProperty;var Se=(e,o)=>{for(var t in o)b(e,t,{get:o[t],enumerable:!0})},$=(e,o,t,r)=>{if(o&&typeof o=="object"||typeof o=="function")for(let n of Fe(o))!be.call(e,n)&&n!==t&&b(e,n,{get:()=>o[n],enumerable:!(r=ye(o,n))||r.enumerable});return e};var O=(e,o,t)=>(t=e!=null?ge(Ie(e)):{},$(o||!e||!e.__esModule?b(t,"default",{value:e,enumerable:!0}):t,e)),Ce=e=>$(b({},"__esModule",{value:!0}),e);var Ye={};Se(Ye,{default:()=>D});module.exports=Ce(Ye);var ve=require("obsidian");var j={focusNeeded:!0,delConfirmFile:!1,delConfirmFolder:!0};var F=require("obsidian"),S=class extends F.PluginSettingTab{constructor(t,r){super(t,r);this.plugin=r;this.plugin=r}display(){let{containerEl:t}=this;t.empty(),new F.Setting(t).setName("Confirm before deleting files").addToggle(r=>r.setValue(this.plugin.settings.delConfirmFile).onChange(async n=>{this.plugin.settings.delConfirmFile=n,await this.plugin.saveSettings()})),new F.Setting(t).setName("Confirm before deleting folders (containing files)").addToggle(r=>r.setValue(this.plugin.settings.delConfirmFolder).onChange(async n=>{this.plugin.settings.delConfirmFolder=n,await this.plugin.saveSettings()}))}};var E=O(require("path"));function m(e){var o,t,r;return(r=(t=(o=e==null?void 0:e.children[0])==null?void 0:o.getAttribute("data-path"))!=null?t:e==null?void 0:e.getAttribute("data-path"))!=null?r:""}function p(e){return e.explorerfileContainer||e.explorerfolderContainer||null}function W(e,o){return e.mousePosition={x:o.clientX,y:o.clientY},e.mousePosition?document.elementFromPoint(e.mousePosition.x,e.mousePosition.y):null}function M(e,o){var t;return(t=e==null?void 0:e.classList.contains(o))!=null?t:!1}var X=e=>M(e,"nav-file"),R=e=>M(e,"is-collapsed"),G=e=>M(e,"nav-folder"),Y=e=>{var o,t;return(t=(o=e.elementFromPoint)==null?void 0:o.closest(".nav-file"))!=null?t:null},_=e=>{var o,t;return(t=(o=e.elementFromPoint)==null?void 0:o.closest(".nav-folder"))!=null?t:null};function C(){return document.querySelectorAll(".nav-files-container .nav-file, .nav-files-container .nav-folder")}async function V(e){return new Promise(o=>{setTimeout(()=>{let t=ke(e);if(!t)return o();t.scrollIntoView({behavior:"smooth",block:"center"}),o()},100)})}function v(e){var t;let o=(t=Q(e))==null?void 0:t.view;return!o||!o.fileItems?[]:Object.entries(o.fileItems)||[]}function z(e){var t;return(t=v(e).find(r=>r[1].selfEl.classList.contains("is-active")))!=null?t:null}function H(e,o){let t=m(o),r=v(e);if(r){for(let n of r)if(n[0].includes(t)){n[1].setCollapsed(!1,!0);break}}}var I=e=>{var t;return((t=e.elementFromPoint)==null?void 0:t.closest(".workspace-leaf-content[data-type='file-explorer'] .nav-files-container"))||null};function J(e){var o,t;return(t=(o=e.elementFromPoint)==null?void 0:o.closest(".workspace-leaf.mod-active"))!=null?t:null}function Q(e){var t,r;let{workspace:o}=e.app;return(r=(t=o.getLeavesOfType("file-explorer"))==null?void 0:t.first())!=null?r:null}function x(e){let o=Q(e);return o?o.view:null}function ke(e){var t;let o=x(e);return(t=o==null?void 0:o.containerEl.querySelector(".is-active"))!=null?t:null}function Z(e){return{dir:E.dirname(e),name:E.basename(e,E.extname(e)),ext:E.extname(e)}}function ee(e,o){e.operation=o;let t=p(e);if(!t)return;let r=o==="cut"?"copy":"cut";t.classList.contains(r)&&t.classList.remove(r),t.classList.toggle(o)}function te(e){ee(e,"copy")}function oe(e){ee(e,"cut")}function re(e){C().forEach(t=>{t.classList.remove("copy","cut")}),e.operation=null}var h=require("obsidian");var w=require("obsidian"),U=class extends w.Modal{constructor(t,r,n){super(t);this.message=r;this.callback=n;this.scope=new w.Scope(this.scope),this.scope.register([],"Enter",()=>{this.confirm(!0)})}confirm(t){this.callback(t),this.close()}onOpen(){let{contentEl:t}=this;t.empty(),t.createEl("p").setText(this.message),new w.Setting(this.contentEl).addButton(r=>{r.setIcon("checkmark").setCta().onClick(()=>this.confirm(!0))}).addExtraButton(r=>r.setIcon("cross").onClick(()=>this.confirm(!1)))}onClose(){let{contentEl:t}=this;t.empty()}};async function Te(e,o){return await new Promise(t=>{new U(e,o,r=>{t(r)}).open()})}async function ne(e){return await Te(this.app,e)}function ie(e){let o=["Up/Down Arrow: Navigate between files and folders","Left Arrow: Toggle collapse/expand all folders","Right Arrow: Reveal the active file","F2 or R: Rename the selected file/folder","N: Create a new file","F: Create a new folder","X: mark(color) the hovered file/folder as cut (Press again to unmark)","C: mark(color) the hovered file/folder as copy (Press again to unmark)","Esc: Cancel all cut/copy markings","V: Paste what have been marked as cut/copy to the hovered item (parent folder if file)","Delete: Delete the hovered file/folder (with confirmation or not depending on settings)","W: Open the hovered file in a new window","O: Open the hovered file/folder/root in the system explorer","Ctrl+O: Over the editor open file/root(empty tab) in the system explorer."],t=new w.Modal(e);t.titleEl.textContent="Explorer shortcuts reminder",t.contentEl.innerHTML=o.map(r=>`<p>${r}</p>`).join(""),t.open()}async function le(e,o){let t=!0,r=x(e),n=r==null?void 0:r.tree;if(!n)return;let i=p(e),s=m(i)||"/",l=r.fileItems[s];if(!l)return;let a=l.file;if(a instanceof h.TFile&&l.el.children[0].classList.contains("has-focus")||(e.settings.delConfirmFile&&a instanceof h.TFile?t=await se(a):e.settings.delConfirmFolder&&a instanceof h.TFolder&&(a.children.length===0||(t=await se(a))),!t))return;n.selectItem(l),n.handleDeleteSelectedItems(o);let f=a instanceof h.TFile?"File":"Folder";new h.Notice(`${f} removed: `+a.name,3500)}async function se(e){return ne(" Are you sure you want to delete "+e.name+"?")}function ae(e,o){let t=new MouseEvent("mousemove",{clientX:e.mousePosition.x+1,clientY:e.mousePosition.y+1});setTimeout(()=>{document.dispatchEvent(t)},70)}var ce=require("obsidian");async function B(e,o="down"){await Le(e);let t=Ne(e,o);if(!t){new ce.Notice("End of list",800);return}X(t)&&await Me(e,t)}async function Le(e){let o=z(e);if(!o)return;let[t,r]=o;for(let n=0;n<2;n++){let i=v(e);for(let[s,l]of i)t.startsWith(s)&&R(l.el)&&l.setCollapsed(!1,!1);await new Promise(s=>setTimeout(s,50))}await V(e)}function Ne(e,o){let t=k();if(t.length===0)return;let r=Ae(t);if(r===-1){if(r=Pe(e),r===-1)return;t=k()}return De(e,t,r,o)}function Pe(e){let o=v(e),t=e.app.workspace.getLeaf(!1),r=(t==null?void 0:t.view).file;if(!r)return-1;let n=r.path,i=o.find(l=>l[0]===n);return i?(H(e,i[1].el),k().findIndex(l=>l.children[0].classList.contains("is-active"))):-1}function k(){let e=C();return Array.from(e).filter(o=>!o.children[0].classList.contains("is-unsupported")&&!o.classList.contains("mod-root"))}function Ae(e){return e.findIndex(o=>o.children[0].classList.contains("is-active"))}function T(e,o,t){return t==="down"?(e+1)%o:(e-1+o)%o}function De(e,o,t,r){let n=o,i=T(t,n.length,r),s=n[i];for(;G(s);){if(R(s)){let{newIndex:l,newList:a}=Oe(e,s,n,i,r);i=l,n=a}else i=T(i,n.length,r);s=n[i]}return s}function Oe(e,o,t,r,n){let i=t.length;H(e,o);let s=k(),a=s.length-i,f=s.indexOf(o),u;return n==="down"?u=a===0?T(r,s.length,n):f+1:u=a===0?T(r,s.length,n):f+a,{newIndex:u,newList:s}}async function Me(e,o){let t=m(o);if(!t)return;let r=e.app.vault.getFileByPath(t);if(!r)return;let n=e.app.workspace.getLeaf(!1);n&&(await n.openFile(r),await V(e))}var L=require("obsidian");async function q(e,o){let t=x(e);if(!t)return;let r=p(e),n=m(r)||"/",i;if(n==="/")i=e.app.vault.getRoot();else{let l=t.fileItems[n].file;l instanceof L.TFile?i=l.parent||e.app.vault.getRoot():l instanceof L.TFolder?i=l:i=e.app.vault.getRoot()}if(e.isEditingNewItem=!0,t.createAbstractFile(o,i,!0),o==="file"){let s=setInterval(()=>{let l=document.querySelector(".inline-title");l&&(clearInterval(s),l.addEventListener("blur",()=>{e.isEditingNewItem=!1},{once:!0}))},50)}else{let s=setInterval(()=>{let l=t.containerEl.querySelector('[contenteditable="true"]');l&&(clearInterval(s),l.addEventListener("blur",()=>{e.isEditingNewItem=!1,t.containerEl.querySelectorAll(".has-focus").forEach(a=>{a.classList.remove("has-focus")})},{once:!0}))},50)}setTimeout(()=>{e.isEditingNewItem=!1,t.containerEl.querySelectorAll(".has-focus").forEach(s=>{s.classList.remove("has-focus")})},1e4)}var c=require("obsidian"),d=O(require("path"));var N=!1;async function fe(e){var n;let t=v(e).filter(i=>i[1].el.classList.contains("copy")||i[1].el.classList.contains("cut"));if(!t.length){new c.Notice("No items selected for paste operation");return}let r=(n=qe(e))!=null?n:"/";try{N=!1;let i=await Re(e,t,r);for(let s of t){let l=s[0],a=d.join(r,d.basename(l)),f=s[1].el.classList.contains("copy")?"copy":"cut",u=!1;if(i.includes(l))if(N)u=!0;else{let g=await Ve(e.app,d.basename(l),i.length);if(g==="cancel")continue;u=g==="replace"}await He(e,s,a,f,u)}}catch(i){console.error("Paste operation failed:",i),new c.Notice("Paste operation failed. Check console for details.")}}async function Re(e,o,t){let r=[];for(let n of o){let i=d.join(t,d.basename(n[0]));await e.app.vault.adapter.exists(i)&&r.push(n[0])}return r}async function Ve(e,o,t){return new Promise(r=>{let n=new c.Modal(e);n.titleEl.textContent=`File "${o}" already exists`,new c.Setting(n.contentEl).setName("Choose Action").addDropdown(i=>{i.addOption("increment","Increment name").addOption("replace","Replace existing").setValue("increment").onChange(s=>{r(s),n.close()})}),t>1&&new c.Setting(n.contentEl).setName("Apply to all remaining files").addToggle(i=>{i.setValue(N).onChange(s=>{N=s})}),new c.Setting(n.contentEl).addButton(i=>{i.setButtonText("Cancel").onClick(()=>{r("cancel"),n.close()})}),n.open()})}async function He(e,o,t,r,n){let i=o[0];if((0,c.normalizePath)(i)===(0,c.normalizePath)(t)){new c.Notice("Cannot paste to the same location",2e3);return}n||(t=Ke(e,o[1].file instanceof c.TFile?"file":"folder",t));try{r==="copy"?await Ue(e,o,t,n):await Be(e,o,t,n),o[1].el.classList.remove(r)}catch(s){console.error(`Failed to ${r} item:`,s),new c.Notice(`Failed to ${r} item. Check console for details.`)}}async function Ue(e,o,t,r){if(o[1].file instanceof c.TFile)if(r){let n=await e.app.vault.adapter.read(o[1].file.path);await e.app.vault.adapter.write(t,n)}else await e.app.vault.copy(o[1].file,t);else o[1].file instanceof c.TFolder&&await me(e,o[1].file,t,r)}async function me(e,o,t,r){r&&await e.app.vault.adapter.rmdir(t,!0),await e.app.vault.createFolder(t);for(let n of o.children){let i=(0,c.normalizePath)(d.join(t,n.name));n instanceof c.TFile?await e.app.vault.copy(n,i):n instanceof c.TFolder&&await me(e,n,i,r)}}async function Be(e,o,t,r){o[1].file instanceof c.TFile?(r&&await e.app.vault.adapter.remove(t),await e.app.fileManager.renameFile(o[1].file,t)):await e.app.vault.rename(o[1].file,t)}function qe(e,o=!1){let t=p(e);if(!t)return;let r=m(t);return d.extname(r)?d.dirname(r):r}function Ke(e,o,t){let{dir:r,name:n,ext:i}=Z(t),s=r==="."?"":r+"/",l=n||"Untitled",a=o==="file"?i||".md":"",f=-1,u=l,g=(0,c.normalizePath)(s+u+a),xe=/^(Untitled)(\s*(\d+))?$/,we=l.match(xe);for(;e.app.vault.getAbstractFileByPath(g);)f++,we?u=f===0?"Untitled":`Untitled ${f}`:u=f===0?l:`${l} (${f})`,g=(0,c.normalizePath)(s+u+a);return g}async function pe(e,o){let t=x(e);if(!t)return;let r=p(e);if(!r)return;let n=t.tree;if(!n)return;let i=m(r)||"/",s=t.fileItems[i];s&&(n.setFocusedItem(s),n.handleRenameFocusedItem(o),setTimeout(()=>{let l=t.containerEl.querySelector('[contenteditable="true"]');l&&(l.addEventListener("blur",()=>{var a;e.renaming=!1,(a=r.firstElementChild)==null||a.classList.remove("has-focus")},{once:!0}),l.addEventListener("keydown",a=>{var f;a.key==="Enter"&&(e.renaming=!1,(f=r.firstElementChild)==null||f.classList.remove("has-focus"))},{once:!0}),setTimeout(()=>{var a;e.renaming&&(e.renaming=!1,(a=r.firstElementChild)==null||a.classList.remove("has-focus"))},1e4))},50))}var $e=50;function ue(){let e=document.querySelector('.nav-action-button[aria-label="Collapse all"]'),o=document.querySelector('.nav-action-button[aria-label="Expand all"]'),t=e||o;if(t){let r=new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window});t.dispatchEvent(r)}else console.warn("Toggle collapse/expand button not found")}function de(e){try{e.app.commands.executeCommandById("file-explorer:reveal-active-file"),e.app.commands.executeCommandById("file-explorer:reveal-active-file"),setTimeout(()=>{let o=e.app.workspace.getLeaf(!1);o?e.app.workspace.setActiveLeaf(o,{focus:!0}):console.warn("No active leaf found")},$e)}catch(o){console.error("Failed to reveal active file:",o)}}var y=O(require("path"));async function P(e,o=!1){var r;let t="/";if(o){let n=p(e);n&&(t=m(n))}else if(J(e)){let n=e.app.workspace.getLeaf(!1);n&&(t=((r=n.view.file)==null?void 0:r.path)||"/")}else return;je.call(e,t)}async function je(e){let o=window.electron.remote.shell;y.extname(e)!==""&&(e=y.dirname(e));let t=e,r=this.app.vault.adapter.basePath;t=y.join(r,e);try{await o.openPath(t)}catch(n){console.log(n)}}var A=require("obsidian"),K=!1;async function he(e){var t,r;if(!K||!I(this))return;if(((t=this.elementFromPoint)==null?void 0:t.closest(".is-being-renamed"))&&this.blockedKeys[e.key]&&delete this.blockedKeys[e.key],e.key==="Escape"&&re(this),this.renaming||this.isEditingNewItem){this.blockedKeys={};return}e.key==="ArrowLeft"&&ue(),e.key==="ArrowRight"&&de(this),e.key==="ArrowUp"&&await B(this,"up"),e.key==="ArrowDown"&&await B(this,"down"),e.key==="n"&&await q(this,"file"),e.key==="f"&&await q(this,"folder"),e.key==="o"&&await P(this,!0),e.key==="h"&&ie(this.app),(r=this.elementFromPoint)!=null&&r.closest(".tree-item")&&((e.key==="r"||e.key==="F2")&&(this.renaming=!0,await pe(this,e)),e.key==="x"&&oe(this),e.key==="c"&&te(this),e.key==="v"&&await fe(this),e.key==="Delete"&&(await le(this,e),ae(this,e)),e.key==="w"&&await Xe(this))}function Ee(e){if(I(this)&&!(this.renaming||this.isEditingNewItem))if(We(e.key))e.preventDefault(),this.blockedKeys[e.key]=!0,K=!0;else{K=!1;return}}function We(e){return["n","r","x","c","q","v","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","f","F2","Escape","Delete","w","h","o"].includes(e)}async function Xe(e){let o=p(e);if(!o)return;let t=m(o);if(!t)return;let r=e.app.vault.getAbstractFileByPath(t);if(!(r instanceof A.TFile))return;let n=e.app.workspace.getLeaf("window");if(n)try{await n.openFile(r)}catch(i){new A.Notice("Failed to open file in new window")}}var D=class extends ve.Plugin{constructor(){super(...arguments);this.elementFromPoint=null;this.explorerfileContainer=null;this.explorerfolderContainer=null;this.renaming=!1;this.isEditingNewItem=!1;this.blockedKeys={};this.operation=null}async onload(){await this.loadSettings(),this.addSettingTab(new S(this.app,this)),this.app.workspace.onLayoutReady(this.registerDomEvents.bind(this)),this.addCommand({id:"show-in-syst-explorer",name:"Show in system explorer",callback:async()=>{await P(this)}})}registerDomEvents(){this.registerDomEvent(document,"mousemove",Ge.bind(this)),this.registerDomEvent(document,"keydown",Ee.bind(this),!0),this.registerDomEvent(document,"keyup",async t=>await he.call(this,t))}async loadSettings(){this.settings=Object.assign({},j,await this.loadData())}async saveSettings(){await this.saveData(this.settings)}};function Ge(e){this.elementFromPoint=W(this,e),I(this)&&(this.explorerfolderContainer=_(this),this.explorerfileContainer=Y(this))}

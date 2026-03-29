# Notes de développement - Explorer Shortcuts

## Procédure pour modifier les raccourcis clavier

### Structure du code

Les raccourcis clavier sont gérés dans plusieurs fichiers :

- `src/pressKey.ts` : Logique principale des raccourcis (fonctions `keyUp`, `keyDown`, `keysToBlock`)
- `src/modal.ts` : Modal d'aide affichant la liste des raccourcis
- `README.md` : Documentation utilisateur

### Raccourcis actuels avec Space

Les raccourcis suivants nécessitent maintenant la touche Space :

- `Space + n` : Nouveau fichier
- `Space + f` : Nouveau dossier
- `Space + r` : Renommer
- `Space + v` : Coller
- `Space + w` : Nouvelle fenêtre
- `Space + h` : Aide
- `Space + o` : Explorer OS

### Raccourcis sans Space (inchangés)

- `Delete` : Supprimer
- `F2` : Renommer (alternative)
- `Esc` : Annuler opérations
- `↑↓←→` : Navigation
- `x` : Couper (touche simple)
- `c` : Copier (touche simple)

### Pour ajouter Space à un raccourci existant

1. **Dans `src/pressKey.ts`** :

   - Fonction `keyDown` : Détecter la combinaison et marquer dans `pendingSpaceCombos`
   - Fonction `keyUp` : Vérifier `pendingSpaceCombos[touche]` au lieu de `e.spaceKey`
   - Exemple : `if (e.key === 'n' && this.pendingSpaceCombos['n'])`

2. **Dans `src/pressKey.ts`** :

   - Fonction `keysToBlock` : Ajouter la touche à `spaceBlockedKeys` si elle nécessite Space
   - Ou la laisser dans `alwaysBlockedKeys` si elle fonctionne sans Space

3. **Dans `src/modal.ts`** :

   - Mettre à jour le texte d'aide : `"Space + N: Create a new file"` au lieu de `"N: Create a new file"`

4. **Dans `README.md`** :
   - Mettre à jour la documentation utilisateur

### Exemple concret : Ajouter Space aux flèches directionnelles

Si vous décidez d'ajouter Space aux flèches :

1. Dans `keyUp` :

```typescript
if (e.key === "ArrowUp" && e.altKey) {
  await navigateOverExplorer(this, "up");
}
```

2. Dans `keysToBlock` :

```typescript
// Retirer 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' de la liste
// OU modifier keyDown pour vérifier Alt
```

3. Dans la modal :

```typescript
"Alt + Up/Down Arrow: Navigate between files and folders",
```

### Logique des combinaisons Alt

Le plugin utilise un système spécial pour gérer les combinaisons Alt :

1. **keyDown** : Détecte Alt+touche et marque la combinaison comme "en attente" dans `pendingAltCombos`
2. **keyUp** : Vérifie si la touche relâchée était marquée comme "en attente" et exécute l'action
3. **Nettoyage** : Les combinaisons en attente sont effacées quand :
   - Escape est pressé
   - On sort de l'explorer
   - On commence à renommer/éditer

Cette logique permet de gérer l'ordre de relâchement des touches :

- Alt+X puis relâcher X puis Alt ✅
- Alt+X puis relâcher Alt puis X ✅

### Problème des conflits de raccourcis

**PROBLÈME MAJEUR** : Obsidian ne gère pas les raccourcis par zone/contexte. Quand vous pressez Alt+C :

- Tous les plugins avec Alt+C se déclenchent simultanément
- `e.preventDefault()` ne peut pas bloquer les raccourcis globaux d'autres plugins
- Solution : Utiliser des combinaisons uniques ou revenir aux touches simples pour certaines actions

### Conflits connus

- `Alt+C` : Peut conflictuer avec "Supprimer paragraphe" ou autres plugins
- `Alt+X` : Peut conflictuer avec d'autres raccourcis de plugins
- **Recommandation** : Désactiver les raccourcis conflictuels dans les autres plugins

### Notes importantes

- Toujours tester après modification
- Vérifier que les raccourcis n'interfèrent pas avec Obsidian
- La touche Ctrl est utilisée par Quick Preview dans l'explorer
- Les touches simples (X, C) fonctionnent mieux car elles peuvent être bloquées avec preventDefault()
- Le système `pendingAltCombos` résout le problème d'ordre de relâchement mais pas les conflits globaux

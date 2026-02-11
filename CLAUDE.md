# Simulateur Exposition

## Description

Simulateur interactif du **triangle d'exposition** (ouverture, vitesse, ISO) permettant de visualiser comment ces 3 paramètres affectent l'exposition, le flou de mouvement et le bruit de l'image.

## Stack Technique

- **Framework** : React 18 + TypeScript
- **UI** : Chakra UI 2.8
- **Build** : Vite 5
- **Animations** : Framer Motion

## Structure du Projet

```
src/
├── App.tsx      # Composant principal (toute la logique)
├── main.tsx     # Point d'entrée React
└── index.css    # Styles globaux
```

## Fonctionnalités

- 10 valeurs d'ouverture (f/1.4 à f/22)
- 15 vitesses d'obturation (1/4000s à 4s)
- 9 valeurs ISO (100 à 25600)
- 8 scènes prédéfinies avec EV de référence (EV 3-15)
- Posemètre analogique visuel
- Effets visuels temps réel :
  - Ajustement luminosité de l'image
  - Simulation du flou de mouvement
  - Simulation du bruit (grain) via SVG fractal noise

## Commandes

```bash
npm install    # Installer les dépendances
npm run dev    # Lancer en développement
npm run build  # Build de production
```

## Formule EV (Exposure Value)

```
EV = log2((f² / shutter) × (100 / ISO))
```

- f = valeur d'ouverture
- shutter = temps d'exposition en secondes
- ISO = sensibilité

## Interface

- Layout 2 colonnes : Image (30%) | Contrôles (70%)
- 3 sliders : Ouverture, Vitesse, ISO
- Badge statut exposition (sous/sur-exposé)
- Tooltips explicatifs sur les paramètres
- Responsive : passe en colonnes empilées sur mobile

## Effets Visuels

- **Luminosité** : ajustement CSS brightness basé sur différence EV
- **Flou** : filter blur proportionnel à la vitesse lente
- **Bruit** : SVG turbulence filter (activé si ISO >= 800)

## Charte Graphique

- Couleur primaire : `#FB9936` (orange)
- Couleur secondaire : `#212E40` (bleu foncé)

## Notes de Développement

- Image exemple hébergée sur apprendre-la-photo.fr
- Calculs temps réel sans debounce
- Application monolithique (tout dans App.tsx)

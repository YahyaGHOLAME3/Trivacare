# Plan directeur Trivacare

## Vision produit

Trivacare devient une plateforme de coordination médicale claire, rassurante et mobile-first pour les voyageurs au Maroc. Le prototype doit démontrer deux surfaces cohérentes:

- `Espace patient`
- `Back-office soins` fusionnant les besoins `Clinique` et `Professionnel de santé`

L'expérience doit rester fidèle à l'identité Trivacare, tout en se rapprochant de la lisibilité, de la simplicité et de la confiance d'un produit de santé comme Doctolib, sans imitation visuelle.

## Objectif du cycle actuel

Les 15 prochains jours sont dédiés à une refonte front-end structurée.

Objectifs prioritaires:

- disposer d'une base applicative moderne avec `src/`
- livrer un prototype cliquable en français
- garantir une utilisation fluide sur mobile, tablette et desktop
- conserver la logique de l'espace patient existant comme référence fonctionnelle
- créer une seconde surface opérationnelle pour les équipes de soins

Ce cycle ne vise pas encore l'intégration backend réelle ni la migration des données legacy.

## Surfaces et pages

### Espace patient

- Tableau de bord
- Dossier médical
- Plans de voyage
- Rendez-vous
- Facturation
- Sécurité
- Mon compte
- Aide

### Back-office soins

- Tableau de bord global
- Liste des patients
- Vue dossier patient
- Planning
- Messagerie et coordination
- Documents médicaux
- Prise en charge et facturation
- Paramètres et sécurité

## Direction UX

Principes de conception:

- hiérarchie visuelle nette
- navigation simple et cohérente
- tableaux de bord compréhensibles immédiatement
- actions principales visibles sans ambiguïté
- formulaires courts et rassurants
- signaux de confiance autour du soin, de la confidentialité et de la coordination
- densité adaptée selon le support

Référence d'inspiration:

- simplicité des parcours
- clarté de la prise de rendez-vous
- qualité des états et des confirmations
- lisibilité des informations critiques

Ce qui est exclu:

- copie de l'identité visuelle Doctolib
- reprise des codes couleur exacts
- duplication de maquettes externes

## Stratégie responsive

Le prototype doit être utilisable normalement sur:

- iPhone Safari
- Android Chrome
- tablette
- desktop

Règles de responsive:

- menus adaptatifs
- cartes empilées sur mobile
- densité d'information réduite sur petit écran
- alternatives aux tableaux trop larges
- composants tactiles avec zones d'appui confortables
- accès simple aux actions prioritaires

Le back-office garde plus de richesse sur desktop, mais reste fonctionnel sur mobile pour:

- recherche patient
- lecture rapide du dossier
- coordination
- messagerie
- planning

## Architecture et structure du dépôt

Structure cible:

- `src/patient/`
- `src/backoffice/`
- `src/shared/`
- `src/assets/logo/`
- `src/assets/icons/`
- `src/assets/screenshots/`
- `src/content/`
- `src/styles/`
- `docs/reference/`

Principes:

- une seule source de vérité pour les composants partagés
- une seule arborescence canonique pour les actifs de marque
- une seule arborescence canonique pour les captures
- les anciens prototypes sont conservés comme références, pas comme base de livraison

## Marque, logos et captures

Travail prévu:

- normaliser le logo dans un dossier dédié
- fournir plusieurs variantes de logo:
  - principal
  - monochrome
  - fond clair
  - fond sombre
  - pictogramme
- centraliser les icônes du produit
- classer les captures par usage:
  - `reference`
  - `validation`
  - `archive`

## Jalons prototype

### Lot 1

- mise en place du socle applicatif
- extraction du design system partagé
- reconstruction de l'espace patient

### Lot 2

- création du shell back-office
- livraison des pages cliniques et praticiens
- navigation bout en bout

### Lot 3

- passage responsive complet
- nettoyage de l'arborescence
- normalisation des actifs
- finition qualité

## Qualité attendue

Critères d'acceptation:

- tout le texte visible est en français
- les deux surfaces sont cliquables de bout en bout
- l'interface est cohérente sur mobile, tablette et desktop
- aucune page principale n'est laissée vide
- les états mockés sont réalistes et cohérents
- la structure du dépôt est propre et compréhensible

## Migration et backend différés

Le cycle actuel ne comprend pas:

- script réel de migration
- import legacy
- connexion base de données
- backend de production

En revanche, l'architecture front doit rester compatible avec une migration légère ultérieure:

- données mockées remplaçables
- composants découplés du stockage
- modèles d'affichage stables
- pas de dépendance à un nouveau schéma de base imposé trop tôt

## Risques et points de vigilance

- éviter une dette de prototype trop couplée au mock
- préserver la cohérence visuelle entre patient et back-office
- maintenir un excellent niveau de lisibilité sur mobile
- ne pas surcharger le back-office sur petit écran
- garder une structure de fichiers durable dès maintenant

## Hypothèses de travail

- l'interface produit reste en français uniquement
- les commentaires techniques peuvent rester en anglais
- la base de travail est le prototype patient existant
- la priorité immédiate est la qualité front-end
- l'inspiration Doctolib reste une inspiration UX, pas une imitation de marque

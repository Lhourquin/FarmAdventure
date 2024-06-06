# FarmAventure JS ( CLI )
## Objectifs de l’application :
FarmAdventure est un jeu en ligne de commande, simulant l’activité d’un fermier. Pour gérer sa ferme, le joueur devra réaliser différentes actions :
- Cultiver les terres : Faire des plantations.
- Acheter des animaux : Récolter leurs ressources (lait, œufs, etc.).
- Récolter les plantations : Les récolter à maturité.
- Stocker et vendre : Stocker les récoltes et les vendre pour gagner des pièces d’or.
- Réinvestissement : Utiliser les pièces d’or pour acheter de nouvelles plantes, machines, animaux, etc.
Ces différentes tâches permettent au joueur de gagner des points d’XP, ce qui lui permet de monter en niveaux (de 0 à 15). Chaque niveau débloque de nouvelles plantes, machines et animaux.

## Contraintes :
- On peut tout vendre sauf les animaux.
- On peut acheter uniquement des animaux et des machines ; les graines et plants sont débloqués en fonction du niveau.
- On a un stock d’eau de 10 gouttes. Quand le nombre de gouttes est inférieur à 10, il s'incrémente automatiquement d'une goutte toutes les 10 secondes jusqu’à atteindre 10.
- En fonction du légume à faire pousser, un nombre précis de gouttes d'eau est nécessaire.
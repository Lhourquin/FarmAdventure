const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const ressources = require('./ressources.json');

const cultures = require('./cultures.json');

const animaux = require('./annimals.json');

const machines = require('./machines.json');

const niveaux = require('./levels.json');

const joueur = require('./player.json');

// ** Commencer à jouer **
function jouer() {
    readline.question(`Que souhaitez vous faire (AfficherProfil, AfficherStock, Planter, Récolter, Vendre) ? : `, (action) => {
        switch (action) {
            case "AfficherProfil":
                afficherProfil();
                break;
            case "AfficherStock":
                afficherStock();
                break;
            case "Planter":
                planter();
                break;
            case "Récolter":
                recolter();
                break;
            case "Vendre":
                vendre();
                break;
            default:
                console.log('Action invalide');
                jouer();
            
        }
    })
}

// ** Afficher les ressources débloqués **
function AfficherRessources(mode) {
    let cultures_debloque = joueur.cultures.filter(item => item.debloque)
    let cultures_dispo = cultures_debloque.filter(item => item.quantite > 0)
    let cultures_debloque_nom = cultures_debloque.map(item => item.nom);
    let cultures_dispo_nom = cultures_dispo.map(item => item.nom);

    if (mode == "debloque") {
        return cultures_debloque_nom.join(', ')
    } else if (mode == "dispo") {
        return cultures_dispo_nom.join(', ')
    }
}

// ** Incrémentation des niveaux **
function niveau() {
    let niveau = niveaux.find(niveau => niveau.niveau === joueur.niveau);
    if (joueur.xp >= niveau.xp) {
        joueur.niveau++
        joueur.xp = 0;
        console.log(`Félicitations vous êtes passé au niveau ${joueur.niveau} !`)
        debloqueNiveau()
    }
}

// ** Nouveaux éléments selon le niveau **
function debloqueNiveau() {
    let niveau = niveaux.find(niveau => niveau.niveau === joueur.niveau);
    if (!niveau) {
        console.log("Niveau non trouvé.");
        return;
    }

    let nouv_elem = niveau.debloque.join(' ');
    let categories = ['ressources', 'cultures', 'animaux', 'machines'];

    categories.forEach(categorie => {
        joueur[categorie].forEach(element => {
            niveau.debloque.forEach(nomDebloque => {
                if (element.nom === nomDebloque) {
                    console.log(`${element.nom} débloqué.`);
                    element.debloque = true;
                }
            });
        });
    });

    console.log(`Voici les nouveaux éléments débloqués : ${nouv_elem}`);
}

// ** Afficher profil **
function afficherProfil() {
    console.log("Voici votre profil : ")
    console.log(`Vous êtes actuellement au niveau ${joueur.niveau}.`)
    console.log(`Vous avez ${joueur.xp} xp.`)

    jouer()
}

// ** Afficher les stocks **
function afficherStock() {
    let joueur_items = [...joueur.cultures, ...joueur.animaux, ...joueur.machines]

    console.log("Voici vos ressources : ")
    joueur_items.forEach(item => {
        if (item.quantite > 0) {
            console.log(`${item.quantite} ${item.nom}`)
        }
    })

    console.log("Voici vos plantations : ")
    let assetEnCours = joueur.ressourcesEnCours.filter(item => item.temps > 0)

    if (assetEnCours.length > 0) {
        assetEnCours.forEach(item => {
            console.log(`Plantation en cours: ${item.nom}, Temps restant: ${item.temps}`)
        })
    } else {
        console.log("Il n'y a aucune plantation en cours!")
    }

    jouer()
}

// ** Plantations **
function plantationsEnCours(plante, cultures_item) {
    let ressourcesEnCours = joueur.ressourcesEnCours;
    let ressourcesEnCours_item = joueur.ressourcesEnCours.find(item => item.nom === cultures_item.nom);
    
    let intervalId = setInterval(() => {
        if (ressourcesEnCours_item.temps != 0) {
            ressourcesEnCours_item.temps--;
            console.log(ressourcesEnCours_item)
        } else {
            clearInterval(intervalId);
            console.log(`Les ${plante} sont prêtes à être récoltés !`);
            jouer();
        }
    }, 1000);
}

function planter() {
    readline.question(`Que souhaitez-vous planter (${AfficherRessources("debloque")}) ? : `, (plante) => {
        let ressourcesEnCours = joueur.ressourcesEnCours;
        let cultures_item = cultures.find(item => item.nom === plante);
        let joueur_cultures_item = joueur.cultures.find(item => item.nom === plante);
        
        let culture_squelette = {
            nom: cultures_item.nom,
            quantite: cultures_item.quantite,
            temps: cultures_item.temps
        }

        if (cultures_item && joueur_cultures_item.debloque) {
            ressourcesEnCours.push(culture_squelette);
            plantationsEnCours(plante, cultures_item)
            console.log(`La plantation des ${plante} s'est fait avec succès !`);
            jouer()
        } else {
            console.log("La plante saisi n'est pas disponible !")
            console.log(cultures_item)
            planter()
        }
    });
}

// ** Récoltes **
function recolter() {
    readline.question(`Que souhaitez vous récolter (${AfficherRessources("debloque")}) ? : `, (plante) => {
        let ressourcesEnCours_index = joueur.ressourcesEnCours.findIndex(asset => asset.nom === plante);
        let ressourcesEnCours_item = joueur.ressourcesEnCours.find(asset => asset.nom === plante);
        let joueur_cultures_item = joueur.cultures.find(item => item.nom === plante);

        if (ressourcesEnCours_item) {
            joueur_cultures_item.quantite += ressourcesEnCours_item.quantite;
            joueur.xp += 50;
            joueur.ressourcesEnCours.splice(ressourcesEnCours_index, 1);
            console.log(`La récolte s'est fait avec succès !`)
            console.log(`Vous avez actuellement ${joueur_cultures_item.quantite} ${joueur_cultures_item.nom}.`)
            niveau()
        } else {
            console.log("La plantation saisi n'existe pas !")
        }
        jouer()
    })
}

// ** Ventes **
function vendre() {
    function poserQuestionSurPlante() {
        readline.question(`Que souhaitez-vous vendre ${AfficherRessources("dispo")} ? : `, (plante) => {
            let joueur_cultures_item = joueur.cultures.find(item => item.nom === plante);
            let plantes = cultures.find(crop => crop.nom === plante);

            if (joueur_cultures_item.quantite > 0 && plantes) {
                poserQuestionSurQuantite(plante, joueur_cultures_item, plantes);
            } else if (joueur_cultures_item.quantite == 0) {
                console.log(`Vous n'avez pas de ${plante} ! Veuillez choisir parmi les ${AfficherRessources("dispo")}`)
            }
            else {
                console.log(`La plante ${plante} n'est pas valide. Veuillez choisir parmi les ${AfficherRessources("dispo")}.`);
                poserQuestionSurPlante();
            }
        });
    }

    function poserQuestionSurQuantite(plante, joueur_cultures_item, plantes) {
        readline.question(`Combien souhaitez-vous vendre de ${plante} ? (Une ${plante} coûte ${plantes.prix} pièces) : `, (quant) => {
            quant = parseInt(quant);
            if (quant <= joueur_cultures_item.quantite && joueur_cultures_item.quantite > 0) {
                joueur_cultures_item.quantite -= quant;
                joueur.piecesOr += plantes.prix * quant;
                console.log(`La vente s'est effectuée avec succès !`);
                console.log(`Vous avez actuellement ${joueur.piecesOr} pièces d'or.`);
                joueur.xp += 50;
                niveau();
                jouer();
            } else {
                console.log(`Il ne vous reste plus que ${joueur_cultures_item.quantite} ${plante} !`);
                poserQuestionSurQuantite(plante, joueur_cultures_item, plantes);
            }
        });
    }

    poserQuestionSurPlante();
}

// ** Lancer le jeu **
jouer()
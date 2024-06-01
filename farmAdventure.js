const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const ressources = [
    { nom: "Eaux", temps: 10, prix: 0, quantite: 1}
]

const cultures = [
    { nom: "Carrotes", temps: 3, prix: 10, quantite: 5},
    { nom: "Tomates", temps: 5, prix: 15, quantite: 5},
    { nom: "Patates", temps: 7, prix: 20, quantite: 5},
    { nom: "Salade", temps: 7, prix: 25, quantite: 5},
    { nom: "Cerises", temps: 7, prix: 30, quantite: 5},
    { nom: "Oranges", temps: 7, prix: 20, quantite: 5},
    { nom: "Fraises", temps: 7, prix: 20, quantite: 5},
    { nom: "Ble", temps: 7, prix: 20, quantite: 5},
];

const animaux = [
    { nom: "Vache", temps: 30, prix: 70, quantite: 1, ressource: "Lait"},
    { nom: "Moutton", temps: 60, prix: 120, quantite: 1, ressource: "Laine"},
    { nom: "Poule", temps: 60, prix: 150, quantite: 1, ressource: "Oeuf"},
    { nom: "Chevre", temps: 100, prix: 200, quantite: 1, ressource: "Fromage"},
    { nom: "Abeille", temps: 200, prix: 250, quantite: 3, ressource: "Miel"},
]

const machines = [
    { nom: "Four", temps: 30, prix: 150, quantite: 1, ressource: ["Pain", "Gateau"]},
    { nom: "Moulin", temps: 30, prix: 200, quantite: 1, ressource: ["Ble"]}
]

const niveaux = [
    { niveau: 0, xp: 50, debloque: []},
    { niveau: 1, xp: 150, debloque: ["Four", "Ble", "Moulin", "Farine", "Pain"]},
    { niveau: 2, xp: 150, debloque: ["Vache", "Lait"]},
    { niveau: 3, xp: 150, debloque: ["Moutton", "Veste"]},
    { niveau: 4, xp: 150, debloque: ["Salade", "Sandwich"]},
    { niveau: 5, xp: 150, debloque: ["Cerises"]},
    { niveau: 6, xp: 150, debloque: ["Poule", "Oeuf", "Gateau"]},
    { niveau: 7, xp: 150, debloque: ["Oranges"]},
    { niveau: 8, xp: 150, debloque: ["Chevre", "Fromage"]},
    { niveau: 9, xp: 150, debloque: ["Fraises"]},
    { niveau: 10, xp: 150, debloque: ["Abeille", "Miel"]},
]

let joueur = {
    niveau: 0,
    xp: 0,
    terres: 1,
    terrains: 1,
    piecesOr: 15,
    ressources: [
        { nom: "Eau", quantite: 10, debloque: true }
    ],
    animaux: [
        { nom: "Vache", quantite: 0, debloque: false },
        { nom: "Moutton", quantite: 0, debloque: false },
        { nom: "Poule", quantite: 0, debloque: false },
        { nom: "Chevre", quantite: 0, debloque: false },
        { nom: "Abeille", quantite: 0, debloque: false }
    ],
    cultures: [
        { nom: "Carrotes", quantite: 5, debloque: true },
        { nom: "Tomates", quantite: 5, debloque: true },
        { nom: "Patates", quantite: 5, debloque: true },
        { nom: "Salade", quantite: 0, debloque: false },
        { nom: "Cerises", quantite: 0, debloque: false },
        { nom: "Oranges", quantite: 0, debloque: false },
        { nom: "Fraises", quantite: 0, debloque: false },
        { nom: "Ble", quantite: 0, debloque: false }
    ],
    machines: [
        { nom: "Four", quantite: 0, debloque: false },
        { nom: "Moulin", quantite: 0, debloque: false }
    ],
    ressourcesEnCours: [
        { nom: "model", quantite: 10, temps: 100 }
    ]
}

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
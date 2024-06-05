"use strict";
import inquirer from 'inquirer';
import readline from 'node:readline';
import fs from 'node:fs';
import ressources from './ressources.json' assert { type: 'json'};
import joueur from './player.json' assert { type: 'json'};
import cultures from './cultures.json' assert { type: 'json'};
import annimals from './annimals.json' assert { type: 'json'};
import machines from './machines.json' assert { type: 'json'};
import niveaux from './levels.json' assert { type:'json'};

const rl = readline.createInterface({
    input:process.stdin,
    outpout:process.stdout
});

function createUser(){
    inquirer.prompt([
        {
            type:'input',
            name:'name',
            message:"Bienvenue dans farmAdventure ! Pour commencer à jouer, créer ton pseudo ( Obligatoire !!) : "
        }
    ])
    .then( (answers) =>{
        if(!answers.name){
            console.log("Tu peut pas jouer si tu créer pas de pseudo.");
            return;
        }
        joueur.userName = answers.name;
        joueur.isFirstTimeUser = false;
        fs.writeFile('./player.json', JSON.stringify(joueur), err => {
            if(err){
                console.error(err);
                return;
            }
        })
        console.log(`Merci ${joueur.userName} !`)
        init();
    })
}

function init(){
    if(joueur.isFirstTimeUser){
       createUser();
    }else{
        play();
    }
}


// ** Commencer à jouer **
async function play(){

    
    let asking = true;

    while(asking){
        const action = await actionSelected();
        switch (action) {
            case "Consulter mon profil":
                afficherProfil();
                break;
            case "Consulter les stocks":
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
            case "Quitter":
                asking = false;
                break;
        }
        
    }


}

async function actionSelected(){
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: "Que souhaitez vous faire ?",
            choices : [
                "Consulter mon profil",
                "Consulter les stocks",
                "Planter",
                "Récolter",
                "Vendre",
                "Quitter"
            ]
        },
    ];
    const answers = await inquirer.prompt(questions);
    console.log(answers)
    return answers.action;
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
    console.table([{"Pseudo": joueur.userName, "XP": joueur.xp + "xp", "Niveau": joueur.niveau}] )
}

// ** Afficher les stocks **
function afficherStock() {
    const joueur_items = [...joueur.cultures, ...joueur.animaux, ...joueur.machines]

    const ressources = joueur_items.filter(item => item.quantite > 0);
    console.group("===== Voici vos ressources =====");
    console.table(ressources.map(item => {
           return {
            "Quantités" : item.quantite,
            "Nom" : item.nom,
            "Débloqués" : "✅"
           }
    }));
    console.groupEnd();
    const assetEnCours = joueur.ressourcesEnCours.filter(item => item.temps > 0);
    if (assetEnCours.length > 0) {
        console.group("===== Voici vos plantations =====")
        console.table(assetEnCours.map(item => {
            return {
                "Plantation en cours" : item.nom,
                "Temps restant" : item.temps
            }
        }))
        console.groupEnd();
    } else {
        console.log("Il n'y a aucune plantation en cours!")
    }

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
            return;
        }
    }, 1000);
}

function planter() {
    const cultures_debloque = joueur.cultures.filter(item => item.debloque).map(item => item.nom)
    const questions = [
        
        {
            type: 'list',
            name: 'name',
            message: "Que souhaitez vous planter ?",
            choices : cultures_debloque
        },
        
    ]
    inquirer.prompt(questions)
    .then
    ((plante) => {
        let ressourcesEnCours = joueur.ressourcesEnCours;
        let cultures_item = cultures.find(item => item.nom === plante.name);
        let joueur_cultures_item = joueur.cultures.find(item => item.nom === plante.name);
        
        let culture_squelette = {
            nom: cultures_item.nom,
            quantite: cultures_item.quantite,
            temps: cultures_item.temps
        }

        if (cultures_item && joueur_cultures_item.debloque) {
            ressourcesEnCours.push(culture_squelette);
            plantationsEnCours(plante, cultures_item)
            console.log(`La plantation des ${plante} s'est fait avec succès !`);
            return;
        } else {
            console.log("La plante saisi n'est pas disponible !")
            console.log(cultures_item)
            return;
        }
    });
}

// ** Récoltes **
function recolter() {
    rl.question(`Que souhaitez vous récolter (${AfficherRessources("debloque")}) ? : `, (plante) => {
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
    })
}

// ** Ventes **
function vendre() {
    function poserQuestionSurPlante() {
        rl.question(`Que souhaitez-vous vendre ${AfficherRessources("dispo")} ? : `, (plante) => {
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
        rl.question(`Combien souhaitez-vous vendre de ${plante} ? (Une ${plante} coûte ${plantes.prix} pièces) : `, (quant) => {
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
init();
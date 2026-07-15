/**
 * fiche.js
 * Point d'entrée de la feuille de personnage (outils/fiche.html).
 * Contrairement à app.js (création), cette page ne calcule rien : elle
 * lit le personnage déjà construit (localStorage) et l'affiche.
 *
 * Mode Jeu / Édition : un bouton bascule une classe sur <body>.
 * - Mode Jeu (par défaut) : vue synthétique en lecture seule pour les
 *   compétences/passives, XP et spécialités verrouillées, portrait et
 *   prompt IA masqués. Restent actifs : jauges de vie, équipement.
 * - Mode Édition : vue complète actuelle (dés, cases V/A, spécialités,
 *   XP, portrait, prompt IA).
 * Le CSS gère l'affichage/masquage (.edition-seulement / .mode-jeu-seulement) ;
 * ce fichier ne fait que construire les deux vues et changer la classe.
 */

import { chargerDonnees } from './loader.js';
import { chargerPersonnageStocke, sauvegarderPersonnage, exporterPersonnageJSON } from './stockage.js';
import { initOnglets } from './ui.js';
import { rendreZoneAffinite } from './fiche-competences.js';
import { initTableauCompetences, xpDepensee, xpDisponible } from './tableau-competences.js';
import { seuilPourNiveau } from './competences.js';
import { initPromptIA } from './prompt-ia.js';
import { initPortrait } from './portrait.js';
import { initEquipement } from './equipement.js';
import { rendreCompetencesPassives, initJaugesVie } from './stats.js';
import { rendreVueSynthetique } from './vue-synthetique.js';

function rendreOngletPersonnage(personnage, donnees) {
    const champNomPerso = document.getElementById('fiche-nom-perso');
    const champNomJoueur = document.getElementById('fiche-nom-joueur');
    const champArchetype = document.getElementById('fiche-archetype');

    champNomPerso.value = personnage.profil.nom || '';
    champNomJoueur.value = personnage.profil.joueur || '';
    champArchetype.value = personnage.profil.concept || '';

    function surModificationProfil() {
        personnage.profil.nom = champNomPerso.value;
        personnage.profil.joueur = champNomJoueur.value;
        personnage.profil.concept = champArchetype.value;
        sauvegarderPersonnage(personnage);
    }
    [champNomPerso, champNomJoueur, champArchetype].forEach(champ => {
        champ.addEventListener('input', surModificationProfil);
    });

    const conteneurAffinite = document.getElementById('fiche-affinite');
    conteneurAffinite.innerHTML = donnees.affinites.map(affinite => `
        <label class="affinite-option">
            <input type="checkbox" disabled ${affinite.id === personnage.affinite ? 'checked' : ''}>
            <span>${affinite.nom}</span>
        </label>
    `).join('');
}

function seuilResistancePour(niveau, donnees) {
    const table = donnees.config.competencesPassives.seuilsResistance.table;
    return (table.find(s => s.niveau === niveau) || table[0]).seuil;
}

async function demarrer() {
    const personnage = chargerPersonnageStocke();

    if (!personnage) {
        document.body.insertAdjacentHTML('afterbegin',
            `<div class="erreur-chargement">Aucun personnage trouvé. Crée-le d'abord dans l'outil de création (index.html).</div>`);
        return;
    }

    const donnees = await chargerDonnees();

    // Mode Jeu / Édition — Jeu par défaut à chaque ouverture (fiche de terrain).
    document.body.classList.add('mode-jeu');
    const boutonMode = document.getElementById('bouton-mode');
    boutonMode.addEventListener('click', () => {
        const enEdition = document.body.classList.toggle('mode-edition');
        document.body.classList.toggle('mode-jeu', !enEdition);
        boutonMode.textContent = enEdition ? '✏️ Édition' : '🎮 Jeu';
    });

    initOnglets({
        conteneurOnglets: document.getElementById('onglets-fiche'),
        conteneurContenus: document.getElementById('contenus-fiche')
    });

    rendreOngletPersonnage(personnage, donnees);

    const promptAPI = initPromptIA({
        conteneurItems: document.getElementById('trait-items'),
        champPrompt: document.getElementById('prompt-ia-texte'),
        personnage,
        donnees,
        caseInclureAffinite: document.getElementById('case-inclure-affinite')
    });

    initPortrait({
        conteneur: document.getElementById('onglet-personnage'),
        personnage,
        donnees,
        surChangement: () => promptAPI.regenerer()
    });

    const boutonCopier = document.getElementById('bouton-copier-prompt');
    if (boutonCopier) {
        boutonCopier.addEventListener('click', async () => {
            const texte = document.getElementById('prompt-ia-texte').value;
            try {
                await navigator.clipboard.writeText(texte);
                const libelleInitial = boutonCopier.textContent;
                boutonCopier.textContent = 'Copié !';
                setTimeout(() => { boutonCopier.textContent = libelleInitial; }, 1500);
            } catch (erreur) {
                console.error('Copie impossible :', erreur);
            }
        });
    }

    rendreZoneAffinite({
        conteneurTexte: document.getElementById('affinite-texte'),
        conteneurSchema: document.getElementById('affinite-schema'),
        personnage,
        donnees
    });

    // Vues synthétiques (mode Jeu) : rendues une fois, puis rafraîchies à
    // chaque changement fait côté Édition (dés, cases, XP).
    function rafraichirSynthetiques() {
        rendreVueSynthetique({
            conteneur: document.getElementById('competences-synthetique'),
            personnage,
            donnees,
            items: donnees.competences,
            niveauDe: (item) => (personnage.competences[item.id] || { niveau: 0 }).niveau + (personnage.progressionCompetences[item.id] || 0),
            seuilDe: (niveau) => `Seuil ${seuilPourNiveau(niveau, donnees.config)}`
        });
        rendreVueSynthetique({
            conteneur: document.getElementById('passives-synthetique'),
            personnage,
            donnees,
            items: donnees.competencesPassives,
            niveauDe: (item) => (personnage.competences[item.competenceActive] || { niveau: 0 }).niveau,
            seuilDe: (niveau) => `Adverse ${seuilResistancePour(niveau, donnees)}`
        });
    }

    function rendreExperience() {
        const champTotal = document.getElementById('xp-total');
        champTotal.value = personnage.experience.total;
        document.getElementById('xp-depenses').textContent = xpDepensee(personnage);
        document.getElementById('xp-disponible').textContent = xpDisponible(personnage);
        document.getElementById('xp-resume-jeu').textContent =
            `${personnage.experience.total} gagnés · ${xpDepensee(personnage)} dépensés · ${xpDisponible(personnage)} disponibles`;
    }

    const tableauAPI = initTableauCompetences({
        conteneur: document.getElementById('tableau-competences'),
        personnage,
        donnees,
        editable: false,
        surChangement: () => { rendreExperience(); rafraichirSynthetiques(); }
    });

    rendreExperience();
    rafraichirSynthetiques();
    document.getElementById('xp-total').addEventListener('input', (evenement) => {
        personnage.experience.total = parseInt(evenement.target.value, 10) || 0;
        sauvegarderPersonnage(personnage);
        rendreExperience();
        tableauAPI.rafraichir(); // redébloque/verrouille les cases de progression selon le nouveau total
        rafraichirSynthetiques();
    });

    const boutonExport = document.getElementById('bouton-export');
    if (boutonExport) {
        boutonExport.addEventListener('click', () => exporterPersonnageJSON(personnage));
    }

    initEquipement({
        conteneur: document.getElementById('zone-equipement'),
        personnage,
        donnees
    });

    rendreCompetencesPassives({
        conteneur: document.getElementById('competences-passives'),
        personnage,
        donnees
    });
    initJaugesVie({
        conteneur: document.getElementById('jauges-vie'),
        personnage,
        donnees
    });

    window.personnage = personnage;
}

demarrer().catch(erreur => {
    console.error('Erreur au démarrage de la fiche :', erreur);
    document.body.insertAdjacentHTML('afterbegin',
        `<div class="erreur-chargement">Erreur de chargement : ${erreur.message}</div>`);
});
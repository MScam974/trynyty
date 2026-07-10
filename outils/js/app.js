/**
 * app.js
 * Point d'entrée du moteur. Charge les données, crée l'objet personnage,
 * puis initialise les modules d'interface. Ne contient aucune règle de
 * jeu : c'est uniquement le câblage entre les modules.
 */

import { chargerDonnees, chargerQuestionnaire } from './loader.js';
import { creerPersonnage, appliquerResultatQuestionnaire } from './personnage.js';
import { initOnglets } from './ui.js';
import { initQuestionnaire } from './questionnaire.js';
import { initSelecteursDes } from './creation.js';
import { initRepartitionAxe } from './competences.js';

async function demarrer() {
    const donnees = await chargerDonnees();
    const questionnaireData = await chargerQuestionnaire();
    const personnage = creerPersonnage();

    const idsVocations = donnees.vocations.map(v => v.id);
    const idsAttributs = donnees.attributs.map(a => a.id);

    // Onglets : bascule entre les deux méthodes de création
    initOnglets({
        conteneurOnglets: document.getElementById('onglets-methode'),
        conteneurContenus: document.getElementById('contenus-methode')
    });

    // Répartition des compétences (Fort/Moyen/Faible) — initialisée avant
    // les dés pour que les callbacks de creation.js puissent la référencer.
    const repartitionAttributs = initRepartitionAxe({
        conteneur: document.getElementById('repartition-attributs'),
        axe: 'attribut',
        axeData: donnees.attributs,
        competencesData: donnees.competences,
        personnage,
        config: donnees.config
    });
    const repartitionVocations = initRepartitionAxe({
        conteneur: document.getElementById('repartition-vocations'),
        axe: 'vocation',
        axeData: donnees.vocations,
        competencesData: donnees.competences,
        personnage,
        config: donnees.config
    });

    function rafraichirRepartitions() {
        repartitionAttributs.rafraichir();
        repartitionVocations.rafraichir();
    }

    // Dés (mode Création libre)
    const selecteursDes = initSelecteursDes({
        conteneurAttributs: document.getElementById('selecteur-attributs'),
        conteneurVocations: document.getElementById('selecteur-vocations'),
        personnage,
        attributsData: donnees.attributs,
        vocationsData: donnees.vocations,
        config: donnees.config,
        surChangement: rafraichirRepartitions
    });

    // Questionnaire
    initQuestionnaire({
        conteneur: document.getElementById('questionnaire-conteneur'),
        questionnaire: questionnaireData,
        personnage,
        surChangement: (etat) => {
            const progression = document.getElementById('questionnaire-progression');
            if (progression) {
                progression.textContent = `${etat.nombreReponses} / ${etat.totalQuestions}`;
            }

            if (!etat.complet) return;

            // Le questionnaire produit exactement le même objet personnage
            // que la Création libre : on applique le résultat aux dés,
            // puis on resynchronise les deux vues qui en dépendent.
            appliquerResultatQuestionnaire(personnage, idsVocations, idsAttributs);
            selecteursDes.synchroniser();
            rafraichirRepartitions();

            const resultat = document.getElementById('questionnaire-resultat');
            if (resultat) {
                const affiniteNom = (donnees.affinites.find(a => a.id === personnage.affinite) || {}).nom || personnage.affinite;
                resultat.textContent = `Affinité : ${affiniteNom}`;
            }
        }
    });

    // Utile en console tant qu'il n'y a pas encore de fiche/export.
    window.personnage = personnage;
}

demarrer().catch(erreur => {
    console.error('Erreur au démarrage du moteur Trynyty :', erreur);
    document.body.insertAdjacentHTML('afterbegin',
        `<div class="erreur-chargement">Erreur de chargement : ${erreur.message}</div>`);
});

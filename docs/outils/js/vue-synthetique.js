/**
 * vue-synthetique.js
 * Vue compacte "mode Jeu" : une grille 4x4 en un coup d'œil (pips) +
 * une liste texte détaillée par Vocation. Purement en lecture — aucune
 * interaction, aucune donnée modifiée ici. Réutilisée pour les
 * compétences actives (tableau-competences.js) et passives (stats.js),
 * qui partagent la même forme Vocation x Attribut.
 */

function pipsTexte(niveau) {
    const n = Math.max(niveau || 0, 0);
    return n > 0 ? 'O'.repeat(n) : '—';
}

function logoDe(taille) {
    return taille ? taille.replace('d', '') : '—';
}

/**
 * @param {object} options
 * @param {HTMLElement} options.conteneur
 * @param {object} options.personnage
 * @param {object} options.donnees - résultat de chargerDonnees()
 * @param {object[]} options.items - competences ou competencesPassives (même forme vocation/attribut/nom)
 * @param {(item: object) => number} options.niveauDe - extrait le niveau d'un item
 * @param {(niveau: number) => string} options.seuilDe - seuil affiché pour un niveau
 */
export function rendreVueSynthetique({ conteneur, personnage, donnees, items, niveauDe, seuilDe }) {
    const { vocations, attributs } = donnees;

    const grille = `
        <table class="grille-synthetique">
            <thead>
                <tr>
                    <th></th>
                    ${attributs.map(a => `<th><span class="synth-logo">${logoDe(personnage.attributs[a.id])}</span><span class="synth-nom">${a.nom}</span></th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${vocations.map(v => `
                    <tr>
                        <th><span class="synth-logo">${logoDe(personnage.vocations[v.id])}</span><span class="synth-nom">${v.symbole || ''} ${v.nom}</span></th>
                        ${attributs.map(a => {
                            const item = items.find(i => i.vocation === v.id && i.attribut === a.id);
                            const niveau = item ? niveauDe(item) : 0;
                            return `<td>${pipsTexte(niveau)}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    const liste = vocations.map(v => `
        <div class="synth-groupe">
            <div class="synth-groupe-titre">${v.symbole || ''} ${v.nom}</div>
            ${items.filter(i => i.vocation === v.id).map(item => {
                const niveau = niveauDe(item);
                const deAttribut = personnage.attributs[item.attribut] || '—';
                const deVocation = personnage.vocations[item.vocation] || '—';
                return `
                    <div class="synth-ligne">
                        <span class="synth-ligne-nom">${item.nom}</span>
                        <span class="synth-ligne-des">${deAttribut}+${deVocation}</span>
                        <span class="synth-ligne-pips">${pipsTexte(niveau)}</span>
                        <span class="synth-ligne-seuil">${seuilDe(niveau)}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `).join('');

    conteneur.innerHTML = `
        <div class="synth-grille-zone">${grille}</div>
        <div class="synth-liste-zone">${liste}</div>
    `;
}
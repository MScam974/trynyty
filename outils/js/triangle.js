/**
 * triangle.js
 * Rendu générique d'un schéma de points reliés par des lignes, cliquable.
 * Ne connaît aucune règle de jeu : il lit uniquement une structure
 * { largeur, hauteur, points, liens, pointDepart } (voir data/triangle-affinite.json).
 * Sert aujourd'hui de support visuel pour la zone Affinité ; la mécanique
 * d'évolution en jeu (déplacement d'un point à l'autre) n'est pas encore
 * implémentée, cf. journal008.md.
 */

const NS_SVG = 'http://www.w3.org/2000/svg';

/**
 * @param {object} options
 * @param {HTMLElement} options.conteneur
 * @param {object} options.donneesSchema - data/triangle-affinite.json
 * @param {(idPoint: string) => void} [options.surClicPoint]
 */
export function initSchemaPoints({ conteneur, donneesSchema, surClicPoint }) {
    const svg = document.createElementNS(NS_SVG, 'svg');
    svg.setAttribute('viewBox', `0 0 ${donneesSchema.largeur} ${donneesSchema.hauteur}`);
    svg.classList.add('schema-points');

    donneesSchema.liens.forEach(([idA, idB]) => {
        const [xA, yA] = donneesSchema.points[idA];
        const [xB, yB] = donneesSchema.points[idB];
        const ligne = document.createElementNS(NS_SVG, 'line');
        ligne.setAttribute('x1', xA);
        ligne.setAttribute('y1', yA);
        ligne.setAttribute('x2', xB);
        ligne.setAttribute('y2', yB);
        ligne.classList.add('schema-ligne');
        svg.appendChild(ligne);
    });

    const cercles = {};
    let idSelectionne = donneesSchema.pointDepart || null;

    function rafraichirSelection() {
        Object.entries(cercles).forEach(([id, cercle]) => {
            cercle.classList.toggle('schema-point-selectionne', id === idSelectionne);
        });
    }

    Object.entries(donneesSchema.points).forEach(([id, [x, y]]) => {
        const cercle = document.createElementNS(NS_SVG, 'circle');
        cercle.setAttribute('cx', x);
        cercle.setAttribute('cy', y);
        cercle.setAttribute('r', 8);
        cercle.classList.add('schema-point');
        cercle.addEventListener('click', () => {
            idSelectionne = id;
            rafraichirSelection();
            if (typeof surClicPoint === 'function') surClicPoint(id);
        });
        svg.appendChild(cercle);
        cercles[id] = cercle;
    });

    rafraichirSelection();
    conteneur.innerHTML = '';
    conteneur.appendChild(svg);

    return {
        selectionner(id) {
            idSelectionne = id;
            rafraichirSelection();
        }
    };
}

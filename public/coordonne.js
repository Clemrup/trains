import fs from 'fs';
import path from 'path';
import { svgPathProperties } from 'svg-path-properties';

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const svgPath = path.join(process.cwd(), 'public', 'fr.svg');

// --------------------------------------------------
// Lecture du fichier SVG
// --------------------------------------------------

if (!fs.existsSync(svgPath)) {
    console.error(`❌ Fichier introuvable : ${svgPath}`);
    process.exit(1);
}

const svg = fs.readFileSync(svgPath, 'utf8');

console.log('✅ SVG chargé');
console.log(`📄 Fichier : ${svgPath}`);
console.log('');

// --------------------------------------------------
// Récupération des <path>
// --------------------------------------------------

const pathRegex = /<path\b([^>]*)\bd=["']([^"']+)["'][^>]*>/gi;

const paths = [];

let match;

while ((match = pathRegex.exec(svg)) !== null) {
    const attributes = match[1];
    const d = match[2];

    // Récupération de l'id
    const idMatch = attributes.match(/\bid=["']([^"']+)["']/i);

    // Récupération du name
    const nameMatch = attributes.match(/\bname=["']([^"']+)["']/i);

    const id = idMatch ? idMatch[1] : '(sans id)';
    const name = nameMatch ? nameMatch[1] : '';

    paths.push({
        id,
        name,
        d
    });
}

console.log(`🔎 ${paths.length} chemins SVG trouvés`);
console.log('');

// --------------------------------------------------
// Calcul des coordonnées
// --------------------------------------------------

const results = [];

for (const pathData of paths) {

    try {
        const properties = new svgPathProperties(pathData.d);

        const totalLength = properties.getTotalLength();

        // Nombre de points utilisés pour l'analyse
        const samples = Math.max(1000, Math.ceil(totalLength / 2));

        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        let leftPoint = null;
        let rightPoint = null;
        let topPoint = null;
        let bottomPoint = null;

        for (let i = 0; i <= samples; i++) {

            const fraction = i / samples;

            const point = properties.getPointAtLength(
                totalLength * fraction
            );

            // Gauche
            if (point.x < left) {
                left = point.x;
                leftPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // Droite
            if (point.x > right) {
                right = point.x;
                rightPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // Haut
            if (point.y < top) {
                top = point.y;
                topPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // Bas
            if (point.y > bottom) {
                bottom = point.y;
                bottomPoint = {
                    x: point.x,
                    y: point.y
                };
            }
        }

        results.push({
            id: pathData.id,
            name: pathData.name,

            left,
            right,
            top,
            bottom,

            leftPoint,
            rightPoint,
            topPoint,
            bottomPoint
        });

    } catch (error) {

        console.error(
            `❌ Impossible d'analyser ${pathData.id}:`,
            error.message
        );
    }
}

// --------------------------------------------------
// Affichage
// --------------------------------------------------

console.log('==================================================');
console.log('              COORDONNÉES DU SVG');
console.log('==================================================');
console.log('');

for (const result of results) {

    console.log(`🗺️ ${result.id}${result.name ? ` (${result.name})` : ''}`);

    console.log(
        `   Gauche : ${result.left.toFixed(2)}`
    );

    console.log(
        `   Droite : ${result.right.toFixed(2)}`
    );

    console.log(
        `   Haut   : ${result.top.toFixed(2)}`
    );

    console.log(
        `   Bas    : ${result.bottom.toFixed(2)}`
    );

    console.log('');

    console.log(
        `   Point gauche : (${result.leftPoint.x.toFixed(2)}, ${result.leftPoint.y.toFixed(2)})`
    );

    console.log(
        `   Point droit  : (${result.rightPoint.x.toFixed(2)}, ${result.rightPoint.y.toFixed(2)})`
    );

    console.log(
        `   Point haut   : (${result.topPoint.x.toFixed(2)}, ${result.topPoint.y.toFixed(2)})`
    );

    console.log(
        `   Point bas    : (${result.bottomPoint.x.toFixed(2)}, ${result.bottomPoint.y.toFixed(2)})`
    );

    console.log('--------------------------------------------------');
}

// --------------------------------------------------
// Calcul des limites de TOUT le SVG
// --------------------------------------------------

let globalLeft = Infinity;
let globalRight = -Infinity;
let globalTop = Infinity;
let globalBottom = -Infinity;

let globalLeftPoint = null;
let globalRightPoint = null;
let globalTopPoint = null;
let globalBottomPoint = null;

for (const result of results) {

    if (result.left < globalLeft) {
        globalLeft = result.left;
        globalLeftPoint = result.leftPoint;
    }

    if (result.right > globalRight) {
        globalRight = result.right;
        globalRightPoint = result.rightPoint;
    }

    if (result.top < globalTop) {
        globalTop = result.top;
        globalTopPoint = result.topPoint;
    }

    if (result.bottom > globalBottom) {
        globalBottom = result.bottom;
        globalBottomPoint = result.bottomPoint;
    }
}

// --------------------------------------------------
// Résultat global
// --------------------------------------------------

console.log('');
console.log('==================================================');
console.log('             LIMITES DE TOUTE LA CARTE');
console.log('==================================================');

console.log('');
console.log(`⬅️  Gauche : ${globalLeft.toFixed(2)}`);
console.log(`➡️  Droite : ${globalRight.toFixed(2)}`);
console.log(`⬆️  Haut   : ${globalTop.toFixed(2)}`);
console.log(`⬇️  Bas    : ${globalBottom.toFixed(2)}`);

console.log('');

console.log(
    `Point le plus à gauche : (${globalLeftPoint.x.toFixed(2)}, ${globalLeftPoint.y.toFixed(2)})`
);

console.log(
    `Point le plus à droite : (${globalRightPoint.x.toFixed(2)}, ${globalRightPoint.y.toFixed(2)})`
);

console.log(
    `Point le plus haut : (${globalTopPoint.x.toFixed(2)}, ${globalTopPoint.y.toFixed(2)})`
);

console.log(
    `Point le plus bas : (${globalBottomPoint.x.toFixed(2)}, ${globalBottomPoint.y.toFixed(2)})`
);

console.log('');
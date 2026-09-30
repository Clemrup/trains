import fs from 'fs';
import path from 'path';
import { svgPathProperties } from 'svg-path-properties';

// ==================================================
// CONFIGURATION
// ==================================================

const svgPath = path.join(process.cwd(), 'public', 'fr.svg');

// ==================================================
// LECTURE DU SVG
// ==================================================

if (!fs.existsSync(svgPath)) {
    console.error(`❌ Fichier introuvable : ${svgPath}`);
    process.exit(1);
}

const svg = fs.readFileSync(svgPath, 'utf8');

console.log('✅ SVG chargé');
console.log(`📄 Fichier : ${svgPath}`);
console.log('');

// ==================================================
// RÉCUPÉRATION DES PATH
// ==================================================

// On récupère toute la balise <path ... >
const pathRegex = /<path\b([^>]*)>/gi;

const paths = [];

let match;

while ((match = pathRegex.exec(svg)) !== null) {

    const attributes = match[1];

    // Récupération du d=""
    const dMatch = attributes.match(/\bd\s*=\s*["']([^"']+)["']/i);

    if (!dMatch) {
        continue;
    }

    // Récupération de id=""
    const idMatch = attributes.match(/\bid\s*=\s*["']([^"']+)["']/i);

    // Récupération de name=""
    const nameMatch = attributes.match(/\bname\s*=\s*["']([^"']+)["']/i);

    const d = dMatch[1];
    const id = idMatch ? idMatch[1] : '(sans id)';
    const name = nameMatch ? nameMatch[1] : '(sans nom)';

    paths.push({
        id,
        name,
        d
    });
}

console.log(`🔎 ${paths.length} chemins SVG trouvés`);
console.log('');

// ==================================================
// CALCUL DES COORDONNÉES
// ==================================================

const results = [];

for (const pathData of paths) {

    try {

        const properties = new svgPathProperties(pathData.d);

        const totalLength = properties.getTotalLength();

        // Nombre de points analysés
        const samples = Math.max(
            2000,
            Math.ceil(totalLength / 2)
        );

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

            // ------------------------------------------
            // GAUCHE
            // ------------------------------------------

            if (point.x < left) {

                left = point.x;

                leftPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // ------------------------------------------
            // DROITE
            // ------------------------------------------

            if (point.x > right) {

                right = point.x;

                rightPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // ------------------------------------------
            // HAUT
            // ------------------------------------------

            if (point.y < top) {

                top = point.y;

                topPoint = {
                    x: point.x,
                    y: point.y
                };
            }

            // ------------------------------------------
            // BAS
            // ------------------------------------------

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
            `❌ Erreur avec ${pathData.id} (${pathData.name}) :`,
            error.message
        );
    }
}

// ==================================================
// AFFICHAGE DE CHAQUE RÉGION
// ==================================================

console.log('==================================================');
console.log('             COORDONNÉES DES PATH');
console.log('==================================================');
console.log('');

for (const result of results) {

    console.log(
        `🗺️ ${result.id} — ${result.name}`
    );

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
        `   ⬅️ (${result.leftPoint.x.toFixed(2)}, ${result.leftPoint.y.toFixed(2)})`
    );

    console.log(
        `   ➡️ (${result.rightPoint.x.toFixed(2)}, ${result.rightPoint.y.toFixed(2)})`
    );

    console.log(
        `   ⬆️ (${result.topPoint.x.toFixed(2)}, ${result.topPoint.y.toFixed(2)})`
    );

    console.log(
        `   ⬇️ (${result.bottomPoint.x.toFixed(2)}, ${result.bottomPoint.y.toFixed(2)})`
    );

    console.log('--------------------------------------------------');
}

// ==================================================
// LIMITES GLOBALES
// ==================================================

let globalLeft = Infinity;
let globalRight = -Infinity;
let globalTop = Infinity;
let globalBottom = -Infinity;

let globalLeftPoint = null;
let globalRightPoint = null;
let globalTopPoint = null;
let globalBottomPoint = null;

let globalLeftPath = null;
let globalRightPath = null;
let globalTopPath = null;
let globalBottomPath = null;

for (const result of results) {

    if (result.left < globalLeft) {

        globalLeft = result.left;
        globalLeftPoint = result.leftPoint;
        globalLeftPath = result;
    }

    if (result.right > globalRight) {

        globalRight = result.right;
        globalRightPoint = result.rightPoint;
        globalRightPath = result;
    }

    if (result.top < globalTop) {

        globalTop = result.top;
        globalTopPoint = result.topPoint;
        globalTopPath = result;
    }

    if (result.bottom > globalBottom) {

        globalBottom = result.bottom;
        globalBottomPoint = result.bottomPoint;
        globalBottomPath = result;
    }
}

// ==================================================
// RÉSULTAT GLOBAL
// ==================================================

console.log('');
console.log('==================================================');
console.log('              LIMITES DE LA CARTE');
console.log('==================================================');
console.log('');

console.log(
    `⬅️ GAUCHE : ${globalLeft.toFixed(2)}`
);

console.log(
    `   Région : ${globalLeftPath.id} — ${globalLeftPath.name}`
);

console.log(
    `   Point  : (${globalLeftPoint.x.toFixed(2)}, ${globalLeftPoint.y.toFixed(2)})`
);

console.log('');

console.log(
    `➡️ DROITE : ${globalRight.toFixed(2)}`
);

console.log(
    `   Région : ${globalRightPath.id} — ${globalRightPath.name}`
);

console.log(
    `   Point  : (${globalRightPoint.x.toFixed(2)}, ${globalRightPoint.y.toFixed(2)})`
);

console.log('');

console.log(
    `⬆️ HAUT : ${globalTop.toFixed(2)}`
);

console.log(
    `   Région : ${globalTopPath.id} — ${globalTopPath.name}`
);

console.log(
    `   Point  : (${globalTopPoint.x.toFixed(2)}, ${globalTopPoint.y.toFixed(2)})`
);

console.log('');

console.log(
    `⬇️ BAS : ${globalBottom.toFixed(2)}`
);

console.log(
    `   Région : ${globalBottomPath.id} — ${globalBottomPath.name}`
);

console.log(
    `   Point  : (${globalBottomPoint.x.toFixed(2)}, ${globalBottomPoint.y.toFixed(2)})`
);

console.log('');
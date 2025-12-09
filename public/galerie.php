<!DOCTYPE html>
<html lang="fr">
<?php
    // --- Connexion à la base ---
    $user = 'clement';
    $pass = '';
    try {
        $db = new PDO('mysql:host=localhost;dbname=trains_db;charset=utf8', $user, $pass);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        die("Erreur : " . $e->getMessage());
    }

    // --- Récupération des trains avec leurs médias ---
    $sql = "
        SELECT 
            t.id AS train_id, 
            t.nom AS train_nom,
            t.numero_principal,
            t.numero_secondaire, 
            ty.nom AS type_nom,
    
            m.type_media, 
            m.media_url, 
            m.date_ajout,
    
            l1.nom AS lieu1,
            l2.nom AS lieu2,
    
            livrees.nom AS livrees_nom,
            livrees.color AS livrees_color
    
        FROM trains t
        JOIN types_train ty ON t.type_id = ty.id
        LEFT JOIN livrees ON livrees.id = t.livree_id
        LEFT JOIN train_medias tm ON t.id = tm.train_id
        LEFT JOIN medias m ON tm.media_id = m.id
        LEFT JOIN lieux l1 ON l1.id = m.id_lieu1
        LEFT JOIN lieux l2 ON l2.id = m.id_lieu2
    
        ORDER BY ty.nom, t.nom
    ";

    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- Regrouper les médias par train ---
    $trains = [];
    foreach ($rows as $row) {
        $tid = $row['train_id'];
        if (!isset($trains[$tid])) {
            $trains[$tid] = [
                'train_id' => $tid,
                'train_nom' => $row['train_nom'],
                'numero_principal' => $row['numero_principal'],
                'numero_secondaire' => $row['numero_secondaire'],
                'livrees_nom' => $row['livrees_nom'],
                'livrees_color' => $row['livrees_color'],
                'type_nom' => $row['type_nom'],
                'medias' => []
            ];
        }
        if ($row['media_url']) {
            $trains[$tid]['medias'][] = [
                'type_media' => $row['type_media'],
                'media_url' => $row['media_url'],
                'lieu1' => $row['lieu1'],
                'lieu2' => $row['lieu2'],
                'date_ajout' => $row['date_ajout']
            ];
        }
    }

    // --- Organiser par type de train ---
    $trains_par_type = [];
    foreach ($trains as $train) {
        $trains_par_type[$train['type_nom']][] = $train;
    }
?>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Galerie des trains</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <header>
            <h1>🚄 Galerie des trains</h1>
            <nav style="text-align:center; margin-top: 20px;">
                <a href="index.php" class="nav-link">⬅ Retour au formulaire</a>
            </nav>
        </header>

        <section class="galerie">
            <?php
                if (!$trains_par_type) {
                    echo "<p style='text-align:center; font-size:1.1rem;'>Aucun train enregistré pour le moment.</p>";
                } else {
                    foreach ($trains_par_type as $type_nom => $trains_type) {
                        echo "<h2 class='type-titre'>" . htmlspecialchars($type_nom) . "</h2>";
                        echo "<div class='train-groupe'>";
                        foreach ($trains_type as $train) {
                            echo '<div class="train-card" style="background:'. htmlspecialchars($train['livrees_color']) .';">';
                                echo '<div class="train-header">';
                                    if ($type_nom == "BB 37000" || $type_nom == "BB 37500"|| $type_nom == "BB 26000"){
                                        echo '<h3> BB </h3>';
                                        echo '<p class="train-numero">N° ' . htmlspecialchars($train['numero_principal']) . '</p>';
                                    }
                                    elseif($type_nom == "AGC" || $type_nom == "Régiolis"){
                                        echo '<h3>' . htmlspecialchars($type_nom) . '</h3>';
                                        echo '<p class="train-numero">N° ' . htmlspecialchars($train['numero_principal']) . '/'. htmlspecialchars($train['numero_secondaire']) .'</p>';
                                    }
                                    elseif($type_nom == "BB 75000" || $type_nom == "BB 60000"){
                                        echo '<h3> BB </h3>';
                                        echo '<p class="train-numero">N° ' . htmlspecialchars($train['numero_principal']) . '<br>('. htmlspecialchars($train['numero_secondaire']) .')</p>';
                                    }
                                    else{
                                        echo '<h3>' . htmlspecialchars($type_nom) . '</h3>';
                                        echo '<p class="train-numero">N° ' . htmlspecialchars($train['numero_principal']) . '</p>';
                                    }
                                    echo '<p class="train-livree"> livrée ' . htmlspecialchars($train['livrees_nom']) . '</p>';
                                echo '</div>';
                            if (!empty($train['medias'])) {
                                echo '<div class="medias-column ">';
                                foreach ($train['medias'] as $media) {
                                    if ($media['type_media'] === 'image') {
                                        echo '<div class="media-container">';
                                        echo '<img data-src="' . htmlspecialchars($media['media_url']) . '" alt="Image du train">';
                                        echo '</div>';
                                    } elseif ($media['type_media'] === 'video') {
                                        $url = htmlspecialchars($media['media_url']) . "?controls=1&modestbranding=1&rel=0&showinfo=0";
                                        echo '<div class="media-container">';
                                        echo '<iframe data-src="' . $url . '" allowfullscreen></iframe>';
                                        echo '</div>';
                                    }
                                    $date = DateTime::createFromFormat('Y-m-d', htmlspecialchars($media['date_ajout']));
                                    $dateFormatee = $date->format('d/m/Y');
                                    if (empty($media['lieu2'])) {
                                        echo '<p class="media-lieu"> Vu à ' . htmlspecialchars($media['lieu1']) . ' le ' . $dateFormatee .'</p>';
                                    } else {
                                        echo '<p class="media-lieu"> Vu entre ' . htmlspecialchars($media['lieu1']) . ' et ' . htmlspecialchars($media['lieu2']) . ' le ' . $dateFormatee .'</p>';
                                    }
                                }
                                echo '</div>'; // ferme la colonne de médias
                            } else {
                                echo '<p class="no-media">Aucun média associé.</p>';
                            }
                            echo '</div>'; // ferme la carte train
                        }
                        echo '</div>'; // ferme le groupe
                    }
                }
            ?>
        </section>
    <!-- Lightbox -->
        <div id="lightbox" class="hidden">
            <div id="lightbox-content">
                <span id="lightbox-close">&times;</span>
                <img id="lightbox-img" src="" alt="Image agrandie">
                <p id="lightbox-desc"></p>
            </div>
        </div>
    </body>
</html>
<script>
    // Lightbox pour toutes les images
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');

    document.querySelectorAll('.train-card img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            lightboxImg.src = img.dataset.src || img.src;
            const desc = img.closest('.train-card').querySelector('.media-lieu');
            lightboxDesc.textContent = desc ? desc.textContent : '';
            lightbox.classList.remove('hidden');
        });
    });

    // Fermer au clic sur le fond ou sur la croix
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target === lightboxClose) {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
            lightboxDesc.textContent = '';
        }
    });

    // Fermer au ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
            lightboxDesc.textContent = '';
        }
    });

    
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".train-card").forEach(card => {
            const header = card.querySelector(".train-header");
            const mediasColumn = card.querySelector(".medias-column");

            if (!header || !mediasColumn) return;

            header.addEventListener("click", () => {

                // Ouvrir / fermer la colonne
                mediasColumn.classList.toggle("open");

                // Charger les médias uniquement à l'ouverture
                if (mediasColumn.classList.contains("open")) {
                    mediasColumn.querySelectorAll("[data-src]").forEach(media => {
                        if (!media.src) {
                            media.src = media.dataset.src;
                        }
                    });
                }
            });
        });
    });
</script>
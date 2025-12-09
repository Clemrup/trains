<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Fonction pour obtenir le chemin d'image en fonction du type de train
function getMediaPath($db, $trains_id) {
    if (is_array($trains_id)) {
        $train_id = $trains_id[0] ?? null;
    } else {
        $train_id = $trains_id;
    }
    
    if (!$train_id) return 'images/';
    
    $stmt = $db->prepare("SELECT types_train.nom FROM trains JOIN types_train ON trains.type_id = types_train.id WHERE trains.id = :id");
    $stmt->execute([':id' => $train_id]);
    $type_nom = $stmt->fetchColumn();
    
    $paths = [
        'TGV Réseau' => 'images/TGV_R/',
        'TGV Duplex' => 'images/TGV_D/',
        'TGV Réseau-Duplex' => 'images/TGV_RD/',
        'TGV POS' => 'images/TGV_POS/',
        'Corail réversible' => 'images/Corail/',
    ];
    
    if (isset($paths[$type_nom])) {
        return $paths[$type_nom];
    }
    
    if (in_array($type_nom, ['BB 26000', 'BB 37000', 'BB 37500', 'BB 60000'])) {
        return 'images/BB/';
    }
    
    return 'images/' . str_replace(' ', '_', $type_nom) . '/';
}

// Fonction pour ajouter un média
function ajouterMedia($db, $trains_id, $type_media, $media_path, $date_ajout, $id_lieu1, $id_lieu2 = null) {
    if (!$media_path) return false;

    $stmt = $db->prepare("
        INSERT INTO medias (type_media, media_url, id_lieu1, id_lieu2, date_ajout)
        VALUES (:type_media, :media_url, :id_lieu1, :id_lieu2, :date_ajout)
    ");
    $stmt->execute([
        ':type_media' => $type_media,
        ':media_url' => $media_path,
        ':id_lieu1' => $id_lieu1,
        ':id_lieu2' => $id_lieu2,
        ':date_ajout' => $date_ajout
    ]);
    $media_id = $db->lastInsertId();

    foreach ((array)$trains_id as $train_id) {
        $stmt2 = $db->prepare("INSERT INTO train_medias (train_id, media_id) VALUES (:train_id, :media_id)");
        $stmt2->execute([':train_id' => $train_id, ':media_id' => $media_id]);
    }

    return true;
}

// Fonction pour déterminer le nom du train
function getTrainName($type_nom, $numero_principal, $numero_secondaire = null) {
    if ($numero_secondaire) {
        if ($type_nom == 'BB 75000') {
            return "BB " . $numero_principal . "(" . $numero_secondaire . ")";
        } else {
            return $type_nom . " " . $numero_principal . "/" . $numero_secondaire;
        }
    }
    
    $names = [
        'TGV Réseau' => 'TGV-R',
        'TGV Duplex' => 'TGV-D',
        'TGV Réseau-Duplex' => 'TGV-RD',
        'TGV POS' => 'TGV-POS',
        'Corail réversible' => 'Corail',
    ];
    
    if (in_array($type_nom, ['BB 26000', 'BB 37000', 'BB 37500', 'BB 60000'])) {
        return 'BB ' . $numero_principal;
    }
    
    if (isset($names[$type_nom])) {
        return $names[$type_nom] . ' ' . $numero_principal;
    }
    
    return $type_nom . ' ' . $numero_principal;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// GET: Récupérer les trains
if ($method === 'GET') {
    if ($action === 'list') {
        $stmt = $db->query("SELECT id, nom FROM trains ORDER BY nom");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($action === 'types') {
        $stmt = $db->query("SELECT * FROM types_train");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// POST: Créer un nouveau train
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $type_id = $data['type_id'] ?? null;
    $numero_principal = trim($data['numero_principal'] ?? '');
    $numero_secondaire = !empty($data['numero_secondaire']) ? trim($data['numero_secondaire']) : null;
    $livree_id = !empty($data['livree_id']) ? trim($data['livree_id']) : null;
    
    if (!$type_id || !$numero_principal) {
        http_response_code(400);
        echo json_encode(['error' => 'Type et numéro principal requis']);
        exit;
    }
    
    try {
        // Récupérer le nom du type
        $stmtType = $db->prepare("SELECT nom FROM types_train WHERE id = :id");
        $stmtType->execute([':id' => $type_id]);
        $type_nom = $stmtType->fetchColumn();
        
        // Générer le nom du train
        $nom = getTrainName($type_nom, $numero_principal, $numero_secondaire);
        
        // Insérer le train
        $stmt = $db->prepare("
            INSERT INTO trains (type_id, nom, numero_principal, numero_secondaire, livree_id)
            VALUES (:type_id, :nom, :numero_principal, :numero_secondaire, :livree_id)
        ");
        $stmt->execute([
            ':type_id' => $type_id,
            ':nom' => $nom,
            ':numero_principal' => $numero_principal,
            ':numero_secondaire' => $numero_secondaire,
            ':livree_id' => $livree_id
        ]);
        
        $train_id = $db->lastInsertId();
        
        // Gestion optionnelle du média
        $type_media = $data['type_media'] ?? null;
        if (!empty($type_media)) {
            $type_lieu = $data['type_lieu'] ?? null;
            $date_ajout = $data['date_ajout'] ?? null;
            
            if ($type_lieu == "2") {
                $id_lieu1 = $data['lieu1_double'] ?? null;
                $id_lieu2 = $data['lieu2_double'] ?? null;
            } else {
                $id_lieu1 = $data['lieu1'] ?? null;
                $id_lieu2 = null;
            }
        
            if ($type_media === 'image') {
                $media_path = trim($data['media_path'] ?? '');
                if ($media_path) {
                    $debut_media_path = getMediaPath($db, $train_id);
                    ajouterMedia($db, $train_id, $type_media, $debut_media_path . $media_path . '.jpg', $date_ajout, $id_lieu1, $id_lieu2);
                }
            } elseif ($type_media === 'video') {
                $media_path = trim($data['media_url'] ?? '');
                if ($media_path) {
                    ajouterMedia($db, $train_id, $type_media, $media_path, $date_ajout, $id_lieu1, $id_lieu2);
                }
            }
        }
        
        http_response_code(201);
        echo json_encode(['success' => true, 'train_id' => $train_id, 'message' => 'Train ajouté avec succès']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'insertion: ' . $e->getMessage()]);
    }
}

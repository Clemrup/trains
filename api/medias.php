<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// GET: Récupérer les lieux
if ($method === 'GET') {
    if ($action === 'lieux') {
        $stmt = $db->query("SELECT id, nom FROM lieux ORDER BY nom ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($action === 'livrees') {
        $stmt = $db->query("SELECT id, nom FROM livrees ORDER BY nom ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// POST: Ajouter un média
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $trains_id = $data['trains_id'] ?? [];
    $type_media = $data['type_media'] ?? null;
    $type_lieu = $data['type_lieu'] ?? null;
    $date_ajout = $data['date_ajout'] ?? null;
    $media_path = $data['media_path'] ?? null;
    $media_url = $data['media_url'] ?? null;
    
    if (empty($trains_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Au moins un train doit être sélectionné']);
        exit;
    }
    
    if (!$type_media || !in_array($type_media, ['image', 'video'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Type de média invalide']);
        exit;
    }
    
    try {
        if ($type_lieu == "2") {
            $id_lieu1 = $data['lieu1_double'] ?? null;
            $id_lieu2 = $data['lieu2_double'] ?? null;
        } else {
            $id_lieu1 = $data['lieu1'] ?? null;
            $id_lieu2 = null;
        }
        
        if ($type_media === 'image') {
            $media_path = trim($media_path ?? '');
            if ($media_path) {
                $debut_media_path = getMediaPath($db, $trains_id);
                ajouterMedia($db, $trains_id, $type_media, $debut_media_path . $media_path . '.jpg', $date_ajout, $id_lieu1, $id_lieu2);
            }
        } elseif ($type_media === 'video') {
            $media_path = trim($media_url ?? '');
            if ($media_path) {
                ajouterMedia($db, $trains_id, $type_media, $media_path, $date_ajout, $id_lieu1, $id_lieu2);
            }
        }
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Média ajouté avec succès']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'insertion: ' . $e->getMessage()]);
    }
}

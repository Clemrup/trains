<?php
// Fonction utilitaire pour extraire les lieux depuis les données du formulaire
function getLieuxFromData($data) {
    if (($data['type_lieu'] ?? null) == "2") {
        $id_lieu1 = $data['lieu1_double'] ?? null;
        $id_lieu2 = $data['lieu2_double'] ?? null;
    } else {
        $id_lieu1 = $data['lieu1'] ?? null;
        $id_lieu2 = null;
    }
    return [$id_lieu1, $id_lieu2];
}

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

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
        $stmt2 = $db->prepare("INSERT INTO trains_medias (train_id, media_id) VALUES (:train_id, :media_id)");
        $stmt2->execute([':train_id' => $train_id, ':media_id' => $media_id]);
    }

    return true;
}

// Fonction pour déterminer le nom du train
function getTrainName($type_nom, $numero_principal, $numero_secondaire = null) {
    if ($numero_secondaire) {
        if (str_contains($type_nom, 'BB')) {
            return "BB " . $numero_principal;
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
    
    if (str_contains($type_nom, 'BB')) {
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
        $stmt = $db->query("SELECT id, nom FROM trains ORDER BY nom ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($action === 'types') {
        $stmt = $db->query("SELECT * FROM types ORDER BY nom ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($action === 'list_by_type' && isset($_GET['type_id'])) {
        $type_id = (int)$_GET['type_id'];
        $stmt = $db->prepare("SELECT id, nom FROM trains WHERE type_id = :type_id ORDER BY nom ASC");
        $stmt->execute([':type_id' => $type_id]);
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
        $stmtType = $db->prepare("SELECT nom FROM types WHERE id = :id ORDER BY nom ASC");
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
            $date_ajout = $data['date_ajout'] ?? null;
            list($id_lieu1, $id_lieu2) = getLieuxFromData($data);
            if ($type_media === 'image') {
                $media_path = trim($data['media_path'] ?? '');
                if ($media_path) {
                    ajouterMedia($db, $train_id, $type_media, $media_path . '.jpg', $date_ajout, $id_lieu1, $id_lieu2);
                }
            } elseif ($type_media === 'video') {
                $media_url = trim($data['media_url'] ?? '');
                if ($media_url) {
                    ajouterMedia($db, $train_id, $type_media, $media_url, $date_ajout, $id_lieu1, $id_lieu2);
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

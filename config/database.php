<?php
/**
 * Configuration de la base de données
 */

try {
    $db = new PDO(
        'mysql:host=localhost;dbname=trains_db;charset=utf8',
        'clement',
        ''
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]));
}

<?php
// api/db_config.php - Hostinger MySQL Database Settings
// Leave DB_NAME empty if you prefer using the default JSON file database (data/menu.json)

define('DB_HOST', 'localhost');
define('DB_NAME', '');          // Enter your Hostinger Database Name (e.g., u123456789_radha)
define('DB_USER', '');          // Enter your Hostinger Database Username
define('DB_PASS', '');          // Enter your Hostinger Database Password
define('DB_CHARSET', 'utf8mb4');

function getDBConnection() {
    if (empty(DB_NAME)) {
        return null; // Signals to use data/menu.json
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null; // Fallback to JSON if database connection fails
    }
}

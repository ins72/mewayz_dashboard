<?php
// Test database connection
try {
    $host = '109.106.255.240';
    $port = '3306';
    $dbname = 'test-mewayz';
    $username = 'test-mewayz';
    $password = 'duM4q6w153UUvfnlQNlU';
    
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n";
    
    // Test query
    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetchColumn();
    echo "Database version: $version\n";
    
    // Show tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Existing tables: " . (count($tables) > 0 ? implode(', ', $tables) : 'No tables yet') . "\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
<?php
echo "<h1>Database Connection Test</h1>";

// Test different connection methods
$configs = [
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => 'root'],
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => 'root'],
];

foreach ($configs as $i => $config) {
    echo "<h3>Test " . ($i + 1) . ": {$config['host']}:{$config['port']} user:{$config['user']} pass:" . ($config['pass'] ? '***' : 'empty') . "</h3>";
    
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        echo "<p style='color: green;'>✅ Connection successful!</p>";
        
        // Test if we can see databases
        $stmt = $pdo->query("SHOW DATABASES");
        $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "<p>Available databases: " . implode(', ', $databases) . "</p>";
        
        // Check if our database exists
        if (in_array('digital_hermit_community', $databases)) {
            echo "<p style='color: green;'>✅ digital_hermit_community database exists!</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ digital_hermit_community database not found</p>";
        }
        
        break; // Stop on first successful connection
        
    } catch (PDOException $e) {
        echo "<p style='color: red;'>❌ Connection failed: " . $e->getMessage() . "</p>";
    }
}

echo "<hr>";
echo "<p><strong>Next steps:</strong></p>";
echo "<ol>";
echo "<li>If connection works, create the database in phpMyAdmin</li>";
echo "<li>If no connection works, check MAMP MySQL settings</li>";
echo "</ol>";
?>

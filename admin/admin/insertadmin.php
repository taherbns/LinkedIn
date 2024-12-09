<?php
require 'db.php';

// Example for creating a new admin:
$email = 'admin@tecc.com';
$password = 'pass12345678';

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Store the hashed password in the database
$stmt = $pdo->prepare("INSERT INTO admins (email, password) VALUES (?, ?)");
$stmt->execute([$email, $hashedPassword]);

echo "Admin created successfully!";
?>

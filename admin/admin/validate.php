<?php
session_start();
require 'db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit();
}

$type = $_GET['type'];
$id = $_GET['id'];

if ($type === 'recruiter') {
    $stmt = $pdo->prepare("UPDATE recruiter SET validated = 1 WHERE id = ?");
} elseif ($type === 'candidate') {
    $stmt = $pdo->prepare("UPDATE candidate SET validated = 1 WHERE id = ?");
} else {
    die("Invalid type");
}

$stmt->execute([$id]);
header('Location: index.php');

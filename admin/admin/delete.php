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
    $stmt = $pdo->prepare("DELETE FROM recruiter WHERE id = ?");
} elseif ($type === 'candidate') {
    $stmt = $pdo->prepare("DELETE FROM candidate WHERE id = ?");
} else {
    die("Invalid type");
}

$stmt->execute([$id]);
header('Location: index.php');

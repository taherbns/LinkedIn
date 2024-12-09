<?php
session_start();
require 'db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit();
}

// Fetch pending accounts
$pending_recruiters = $pdo->query("SELECT * FROM recruiter WHERE validated = 0")->fetchAll(PDO::FETCH_ASSOC);
$pending_candidates = $pdo->query("SELECT * FROM candidate WHERE validated = 0")->fetchAll(PDO::FETCH_ASSOC);

// Fetch validated accounts
$validated_recruiters = $pdo->query("SELECT * FROM recruiter WHERE validated = 1")->fetchAll(PDO::FETCH_ASSOC);
$validated_candidates = $pdo->query("SELECT * FROM candidate WHERE validated = 1")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Admin Dashboard</title>
</head>
<body>
    <h1>Admin Dashboard</h1>

    <!-- Pending Recruiters -->
    <h2>Pending Recruiters</h2>
    <?php if (!empty($pending_recruiters)): ?>
        <?php foreach ($pending_recruiters as $recruiter): ?>
            <p>
                <?php echo htmlspecialchars($recruiter['nom']); ?> (<?php echo htmlspecialchars($recruiter['email']); ?>)
                <a href="validate.php?type=recruiter&id=<?php echo $recruiter['id']; ?>">Validate</a>
                <a href="delete.php?type=recruiter&id=<?php echo $recruiter['id']; ?>">Delete</a>
            </p>
        <?php endforeach; ?>
    <?php else: ?>
        <p>No pending recruiters.</p>
    <?php endif; ?>

    <!-- Pending Candidates -->
    <h2>Pending Candidates</h2>
    <?php if (!empty($pending_candidates)): ?>
        <?php foreach ($pending_candidates as $candidate): ?>
            <p>
                <?php echo htmlspecialchars($candidate['nom']); ?> (<?php echo htmlspecialchars($candidate['email']); ?>)
                <a href="validate.php?type=candidate&id=<?php echo $candidate['id']; ?>">Validate</a>
                <a href="delete.php?type=candidate&id=<?php echo $candidate['id']; ?>">Delete</a>
            </p>
        <?php endforeach; ?>
    <?php else: ?>
        <p>No pending candidates.</p>
    <?php endif; ?>

    <!-- Validated Recruiters -->
    <h2>Validated Recruiters</h2>
    <?php if (!empty($validated_recruiters)): ?>
        <?php foreach ($validated_recruiters as $recruiter): ?>
            <p>
                <?php echo htmlspecialchars($recruiter['nom']); ?> (<?php echo htmlspecialchars($recruiter['email']); ?>)
                <a href="unvalidate.php?type=recruiter&id=<?php echo $recruiter['id']; ?>">Unvalidate</a>
                <a href="delete.php?type=recruiter&id=<?php echo $recruiter['id']; ?>">Delete</a>
            </p>
        <?php endforeach; ?>
    <?php else: ?>
        <p>No validated recruiters.</p>
    <?php endif; ?>

    <!-- Validated Candidates -->
    <h2>Validated Candidates</h2>
    <?php if (!empty($validated_candidates)): ?>
        <?php foreach ($validated_candidates as $candidate): ?>
            <p>
                <?php echo htmlspecialchars($candidate['nom']); ?> (<?php echo htmlspecialchars($candidate['email']); ?>)
                <a href="unvalidate.php?type=candidate&id=<?php echo $candidate['id']; ?>">Unvalidate</a>
                <a href="delete.php?type=candidate&id=<?php echo $candidate['id']; ?>">Delete</a>
            </p>
        <?php endforeach; ?>
    <?php else: ?>
        <p>No validated candidates.</p>
    <?php endif; ?>
</body>
</html>

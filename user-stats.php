<?php
/**
 * User Statistics API for Digital Hermit Community Platform
 * Provides user-specific statistics for the dashboard
 */

require_once 'config/database.php';
require_once 'auth.php';

header('Content-Type: application/json');

try {
    $auth = new Auth();
    
    // Check if user is logged in
    if (!$auth->isLoggedIn()) {
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }
    
    $currentUser = $auth->getCurrentUser();
    $db = new Database();
    
    $stats = [];
    
    // Get user ID based on user type
    $userId = $currentUser['id'];
    $userType = $currentUser['user_type'];
    
    // Count connections
    $connectionsResult = $db->fetchOne("
        SELECT COUNT(*) as count 
        FROM connections 
        WHERE user1_id = ? OR user2_id = ?
    ", [$userId, $userId]);
    $stats['connections'] = $connectionsResult['count'];
    
    // Count messages (sent + received)
    $messagesResult = $db->fetchOne("
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE sender_id = ? OR receiver_id = ?
    ", [$userId, $userId]);
    $stats['messages'] = $messagesResult['count'];
    
    // Count interests (for enhanced users)
    if ($userType === 'enhanced') {
        $interestsResult = $db->fetchOne("
            SELECT COUNT(*) as count 
            FROM user_interests ui
            JOIN user_profiles up ON ui.user_profile_id = up.id
            WHERE up.user_id = ?
        ", [$userId]);
        $stats['interests'] = $interestsResult['count'];
    } else {
        $stats['interests'] = 0;
    }
    
    // Calculate profile completion percentage
    if ($userType === 'enhanced') {
        $profileResult = $db->fetchOne("
            SELECT 
                CASE 
                    WHEN first_name IS NOT NULL AND first_name != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN last_name IS NOT NULL AND last_name != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN age IS NOT NULL AND age != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN tech_interests IS NOT NULL AND tech_interests != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN work_style IS NOT NULL AND work_style != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN connection_type IS NOT NULL AND connection_type != '' THEN 1 ELSE 0 END
                as filled_fields
            FROM user_profiles 
            WHERE user_id = ?
        ", [$userId]);
        
        $filledFields = $profileResult['filled_fields'] ?? 0;
        $stats['profile_completion'] = round(($filledFields / 8) * 100);
    } else {
        // Basic users have limited profile fields
        $basicResult = $db->fetchOne("
            SELECT 
                CASE 
                    WHEN name IS NOT NULL AND name != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END +
                CASE 
                    WHEN message IS NOT NULL AND message != '' THEN 1 ELSE 0 END
                as filled_fields
            FROM users 
            WHERE id = ?
        ", [$userId]);
        
        $filledFields = $basicResult['filled_fields'] ?? 0;
        $stats['profile_completion'] = round(($filledFields / 3) * 100);
    }
    
    // Get recent activity
    $recentMessages = $db->fetchAll("
        SELECT m.*, 
               CASE 
                   WHEN m.sender_id = ? THEN u2.name 
                   ELSE u1.name 
               END as other_user_name
        FROM messages m
        LEFT JOIN users u1 ON m.sender_id = u1.id
        LEFT JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at DESC
        LIMIT 5
    ", [$userId, $userId, $userId]);
    
    $stats['recent_messages'] = $recentMessages;
    
    // Get pending connection requests
    $pendingRequests = $db->fetchAll("
        SELECT cr.*, u.name as from_user_name
        FROM connection_requests cr
        JOIN users u ON cr.from_user_id = u.id
        WHERE cr.to_user_id = ? AND cr.status = 'pending'
        ORDER BY cr.created_at DESC
    ", [$userId]);
    
    $stats['pending_requests'] = count($pendingRequests);
    
    echo json_encode($stats);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to load stats: ' . $e->getMessage()]);
}
?>

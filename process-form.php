<?php
/**
 * Form Processing for Digital Hermit Community Platform
 * Handles both basic and enhanced signup forms
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

class FormProcessor {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function processRequest() {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Only POST requests are allowed');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $input = $_POST;
            }
            
            $formType = $input['form_type'] ?? 'basic';
            
            if ($formType === 'enhanced') {
                return $this->processEnhancedSignup($input);
            } else {
                return $this->processBasicSignup($input);
            }
            
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
    
    private function processBasicSignup($data) {
        // Validate required fields
        if (empty($data['name']) || empty($data['email'])) {
            throw new Exception('Name and email are required');
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        
        $email = trim($data['email']);
        
        // Check if email already exists
        $existingUser = $this->db->fetchOne("SELECT id FROM users WHERE email = ?", [$email]);
        $existingProfile = $this->db->fetchOne("SELECT id FROM user_profiles WHERE email = ?", [$email]);
        
        if ($existingUser || $existingProfile) {
            throw new Exception('Email address already exists. Please use a different email or try logging in.');
        }
        
        // Prepare data
        $userData = [
            'name' => trim($data['name']),
            'email' => $email,
            'message' => trim($data['message'] ?? ''),
            'source' => 'landing_page'
        ];
        
        // Insert into database
        $userId = $this->db->insert('users', $userData);
        
        return $this->successResponse([
            'id' => $userId,
            'message' => 'Thank you for joining Digital Hermit!',
            'type' => 'basic'
        ]);
    }
    
    private function processEnhancedSignup($data) {
        // Validate required fields
        if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email']) || empty($data['bio'])) {
            throw new Exception('First name, last name, email, and bio are required');
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        
        // Validate bio length
        if (strlen($data['bio']) < 50 || strlen($data['bio']) > 500) {
            throw new Exception('Bio must be between 50 and 500 characters');
        }
        
        // Validate interests
        $interests = $data['interests'] ?? [];
        if (count($interests) < 3 || count($interests) > 5) {
            throw new Exception('Please select 3-5 interests');
        }
        
        $email = trim($data['email']);
        
        // Check if email already exists
        $existingUser = $this->db->fetchOne("SELECT id FROM users WHERE email = ?", [$email]);
        $existingProfile = $this->db->fetchOne("SELECT id FROM user_profiles WHERE email = ?", [$email]);
        
        if ($existingUser || $existingProfile) {
            throw new Exception('Email address already exists. Please use a different email or try logging in.');
        }
        
        // Start transaction
        $this->db->getConnection()->beginTransaction();
        
        try {
            // Insert basic user first
            $userData = [
                'name' => trim($data['firstName']) . ' ' . trim($data['lastName']),
                'email' => trim($data['email']),
                'message' => trim($data['bio']),
                'source' => 'enhanced_signup'
            ];
            
            $userId = $this->db->insert('users', $userData);
            
            // Insert detailed profile
            $profileData = [
                'user_id' => $userId,
                'first_name' => trim($data['firstName']),
                'last_name' => trim($data['lastName']),
                'email' => trim($data['email']),
                'age' => $data['age'] ?? null,
                'location' => trim($data['location'] ?? ''),
                'bio' => trim($data['bio']),
                'tech_interests' => trim($data['techInterests'] ?? ''),
                'mindfulness_practices' => trim($data['mindfulnessPractices'] ?? ''),
                'work_style' => $data['workStyle'] ?? null,
                'hobbies' => trim($data['hobbies'] ?? ''),
                'connection_type' => $data['connectionType'] ?? null,
                'privacy_level' => $data['privacyLevel'] ?? 'public',
                'newsletter' => isset($data['newsletter']) ? 1 : 0
            ];
            
            $profileId = $this->db->insert('user_profiles', $profileData);
            
            // Insert interests
            foreach ($interests as $interest) {
                $this->db->insert('user_interests', [
                    'user_profile_id' => $profileId,
                    'interest' => $interest
                ]);
            }
            
            // Commit transaction
            $this->db->getConnection()->commit();
            
            return $this->successResponse([
                'id' => $profileId,
                'message' => 'Welcome to the Digital Hermit community! Your detailed profile has been created.',
                'type' => 'enhanced'
            ]);
            
        } catch (Exception $e) {
            // Rollback transaction
            $this->db->getConnection()->rollback();
            throw $e;
        }
    }
    
    private function successResponse($data) {
        return [
            'success' => true,
            'data' => $data
        ];
    }
    
    private function errorResponse($message) {
        http_response_code(400);
        return [
            'success' => false,
            'error' => $message
        ];
    }
}

// Process the request
$processor = new FormProcessor();
$response = $processor->processRequest();

echo json_encode($response);
?>
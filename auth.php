<?php
/**
 * Authentication System for Digital Hermit Community Platform
 * Handles login, logout, session management, and password security
 */

require_once 'config/database.php';

class Auth {
    private $db;
    private $sessionName = 'digital_hermit_user';
    
    public function __construct() {
        $this->db = new Database();
        $this->startSession();
    }
    
    private function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Register a new user with password
     */
    public function register($email, $password, $name, $userType = 'basic') {
        try {
            // Check if user already exists
            if ($this->userExists($email)) {
                return ['success' => false, 'error' => 'User already exists'];
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            if ($userType === 'enhanced') {
                // Insert into user_profiles table
                $userId = $this->db->insert('user_profiles', [
                    'email' => $email,
                    'password' => $hashedPassword,
                    'first_name' => $name,
                    'last_name' => '',
                    'status' => 'pending'
                ]);
            } else {
                // Insert into users table
                $userId = $this->db->insert('users', [
                    'email' => $email,
                    'password' => $hashedPassword,
                    'name' => $name,
                    'status' => 'pending'
                ]);
            }
            
            return ['success' => true, 'user_id' => $userId];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()];
        }
    }
    
    /**
     * Login user with email and password
     */
    public function login($email, $password) {
        try {
            // Check if user is locked
            if ($this->isUserLocked($email)) {
                return ['success' => false, 'error' => 'Account is temporarily locked. Please try again later.'];
            }
            
            // Find user in both tables
            $user = $this->findUserByEmail($email);
            
            if (!$user) {
                return ['success' => false, 'error' => 'Invalid email or password'];
            }
            
            // Check if user is approved
            if ($user['status'] !== 'approved') {
                return ['success' => false, 'error' => 'Your account is pending approval. Please wait for admin approval.'];
            }
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                $this->incrementLoginAttempts($email);
                return ['success' => false, 'error' => 'Invalid email or password'];
            }
            
            // Reset login attempts on successful login
            $this->resetLoginAttempts($email);
            
            // Update last login
            $this->updateLastLogin($user['id'], $user['user_table']);
            
            // Create session
            $this->createSession($user);
            
            return ['success' => true, 'user' => $user];
            
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return ['success' => false, 'error' => 'Login failed: ' . $e->getMessage()];
        }
    }
    
    /**
     * Logout user
     */
    public function logout() {
        if (isset($_SESSION[$this->sessionName])) {
            $sessionId = $_SESSION[$this->sessionName]['session_id'];
            $this->invalidateSession($sessionId);
        }
        
        // Clear session data
        $_SESSION = array();
        
        // Destroy session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        session_destroy();
        return ['success' => true];
    }
    
    /**
     * Check if user is logged in
     */
    public function isLoggedIn() {
        if (!isset($_SESSION[$this->sessionName])) {
            return false;
        }
        
        $sessionData = $_SESSION[$this->sessionName];
        
        // Check if session is still valid
        if (!$this->isSessionValid($sessionData['session_id'])) {
            $this->logout();
            return false;
        }
        
        return true;
    }
    
    /**
     * Get current logged in user
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        return $_SESSION[$this->sessionName];
    }
    
    /**
     * Check if user exists
     */
    private function userExists($email) {
        $user = $this->findUserByEmail($email);
        return $user !== null;
    }
    
    /**
     * Find user by email in both tables
     */
    private function findUserByEmail($email) {
        // Check users table first
        $user = $this->db->fetchOne("SELECT *, 'users' as user_table FROM users WHERE email = ?", [$email]);
        
        if (!$user) {
            // Check user_profiles table
            $user = $this->db->fetchOne("SELECT *, 'user_profiles' as user_table FROM user_profiles WHERE email = ?", [$email]);
        }
        
        return $user;
    }
    
    /**
     * Check if user is locked due to too many failed attempts
     */
    private function isUserLocked($email) {
        $user = $this->findUserByEmail($email);
        if (!$user) return false;
        
        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Increment login attempts
     */
    private function incrementLoginAttempts($email) {
        $user = $this->findUserByEmail($email);
        if (!$user) return;
        
        $attempts = $user['login_attempts'] + 1;
        $lockedUntil = null;
        
        // Lock account after 5 failed attempts for 30 minutes
        if ($attempts >= 5) {
            $lockedUntil = date('Y-m-d H:i:s', time() + (30 * 60));
        }
        
        $this->db->update($user['user_table'], [
            'login_attempts' => $attempts,
            'locked_until' => $lockedUntil
        ], 'email = ?', [$email]);
    }
    
    /**
     * Reset login attempts
     */
    private function resetLoginAttempts($email) {
        $user = $this->findUserByEmail($email);
        if (!$user) return;
        
        $this->db->update($user['user_table'], [
            'login_attempts' => 0,
            'locked_until' => null
        ], 'email = ?', [$email]);
    }
    
    /**
     * Update last login time
     */
    private function updateLastLogin($userId, $userTable) {
        $this->db->update($userTable, [
            'last_login' => date('Y-m-d H:i:s')
        ], 'id = ?', [$userId]);
    }
    
    /**
     * Create user session
     */
    private function createSession($user) {
        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours
        
        // Store session in database
        $this->db->insert('user_sessions', [
            'id' => $sessionId,
            'user_id' => $user['id'],
            'user_type' => $user['table'] === 'user_profiles' ? 'enhanced' : 'basic',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'expires_at' => $expiresAt
        ]);
        
        // Store in PHP session
        $_SESSION[$this->sessionName] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'] ?? ($user['first_name'] . ' ' . $user['last_name']),
            'user_type' => $user['user_table'] === 'user_profiles' ? 'enhanced' : 'basic',
            'session_id' => $sessionId,
            'table' => $user['user_table']
        ];
    }
    
    /**
     * Check if session is valid
     */
    private function isSessionValid($sessionId) {
        $session = $this->db->fetchOne(
            "SELECT * FROM user_sessions WHERE id = ? AND is_active = 1 AND expires_at > NOW()",
            [$sessionId]
        );
        
        return $session !== null;
    }
    
    /**
     * Invalidate session
     */
    private function invalidateSession($sessionId) {
        $this->db->update('user_sessions', [
            'is_active' => 0
        ], 'id = ?', [$sessionId]);
    }
    
    /**
     * Clean up expired sessions
     */
    public function cleanupExpiredSessions() {
        $this->db->query("DELETE FROM user_sessions WHERE expires_at < NOW()");
    }
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Suppress warnings for clean JSON output
    error_reporting(E_ERROR | E_PARSE);
    header('Content-Type: application/json');
    
    $auth = new Auth();
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'login':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            echo json_encode($auth->login($email, $password));
            break;
            
        case 'logout':
            echo json_encode($auth->logout());
            break;
            
        case 'register':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $name = $_POST['name'] ?? '';
            $userType = $_POST['user_type'] ?? 'basic';
            echo json_encode($auth->register($email, $password, $name, $userType));
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    exit;
}

// Handle GET requests for authentication check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    // Suppress warnings for clean JSON output
    error_reporting(E_ERROR | E_PARSE);
    header('Content-Type: application/json');
    
    $auth = new Auth();
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'check':
            if ($auth->isLoggedIn()) {
                echo json_encode([
                    'logged_in' => true,
                    'user' => $auth->getCurrentUser()
                ]);
            } else {
                echo json_encode(['logged_in' => false]);
            }
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
    exit;
}
?>

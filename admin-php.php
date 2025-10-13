<?php
/**
 * PHP Admin Dashboard for Digital Hermit Community Platform
 * View and manage user signups from MySQL database
 */

require_once 'config/database.php';

class AdminDashboard {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function getStats() {
        $stats = [];
        
        // Total users
        $result = $this->db->fetchOne("SELECT COUNT(*) as count FROM users");
        $stats['total_users'] = $result['count'];
        
        // Pending users
        $result = $this->db->fetchOne("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
        $stats['pending_users'] = $result['count'];
        
        // Approved users
        $result = $this->db->fetchOne("SELECT COUNT(*) as count FROM users WHERE status = 'approved'");
        $stats['approved_users'] = $result['count'];
        
        // Enhanced profiles
        $result = $this->db->fetchOne("SELECT COUNT(*) as count FROM user_profiles");
        $stats['enhanced_profiles'] = $result['count'];
        
        return $stats;
    }
    
    public function getUsers($limit = 50, $offset = 0, $search = '', $status = '') {
        $whereClause = "1=1";
        $params = [];
        
        if (!empty($search)) {
            $whereClause .= " AND (u.name LIKE :search OR u.email LIKE :search)";
            $params['search'] = "%{$search}%";
        }
        
        if (!empty($status)) {
            $whereClause .= " AND u.status = :status";
            $params['status'] = $status;
        }
        
        $sql = "
            SELECT 
                u.id,
                u.name,
                u.email,
                u.message,
                u.source,
                u.status,
                u.created_at,
                up.first_name,
                up.last_name,
                up.age,
                up.location,
                up.work_style,
                up.connection_type,
                (SELECT GROUP_CONCAT(ui2.interest) 
                 FROM user_interests ui2 
                 WHERE ui2.user_profile_id = up.id) as interests
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE {$whereClause}
            ORDER BY u.created_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ";
        
        return $this->db->fetchAll($sql, $params);
    }
    
    public function updateUserStatus($userId, $status) {
        $validStatuses = ['pending', 'approved', 'rejected'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Invalid status');
        }
        
        return $this->db->update('users', 
            ['status' => $status], 
            'id = :id', 
            ['id' => $userId]
        );
    }
}

$admin = new AdminDashboard();
$stats = $admin->getStats();

// Handle AJAX requests
if (isset($_GET['action'])) {
    header('Content-Type: application/json');
    
    switch ($_GET['action']) {
        case 'get_users':
            $search = $_GET['search'] ?? '';
            $status = $_GET['status'] ?? '';
            $page = (int)($_GET['page'] ?? 1);
            $limit = 10;
            $offset = ($page - 1) * $limit;
            
            $users = $admin->getUsers($limit, $offset, $search, $status);
            echo json_encode(['success' => true, 'data' => $users]);
            exit;
            
        case 'update_status':
            $userId = (int)($_POST['user_id'] ?? 0);
            $status = $_POST['status'] ?? '';
            
            try {
                $admin->updateUserStatus($userId, $status);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Digital Hermit - PHP Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            min-height: 100vh;
        }
        
        .header {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo h1 {
            font-size: 1.8em;
            background: linear-gradient(45deg, #2c3e50, #34495e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .stats {
            display: flex;
            gap: 20px;
        }
        
        .stat-item {
            text-align: center;
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .stat-number {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px 20px;
        }
        
        .controls {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .search-box {
            flex: 1;
            min-width: 300px;
        }
        
        .search-box input {
            width: 100%;
            padding: 15px;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 16px;
        }
        
        .search-box input::placeholder {
            color: rgba(255,255,255,0.6);
        }
        
        .filter-select {
            padding: 15px;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 16px;
            min-width: 150px;
        }
        
        .filter-select option {
            background: #2c3e50;
            color: white;
        }
        
        .refresh-btn {
            padding: 15px 25px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(44, 62, 80, 0.4);
        }
        
        .users-table {
            width: 100%;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .users-table th,
        .users-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .users-table th {
            background: rgba(44, 62, 80, 0.3);
            font-weight: bold;
            color: #2c3e50;
        }
        
        .users-table tr:hover {
            background: rgba(255,255,255,0.05);
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-pending {
            background: rgba(243, 156, 18, 0.2);
            color: #f39c12;
            border: 1px solid rgba(243, 156, 18, 0.3);
        }
        
        .status-approved {
            background: rgba(39, 174, 96, 0.2);
            color: #27ae60;
            border: 1px solid rgba(39, 174, 96, 0.3);
        }
        
        .status-rejected {
            background: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            border: 1px solid rgba(231, 76, 60, 0.3);
        }
        
        .action-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
            margin: 2px;
        }
        
        .approve-btn {
            background: rgba(39, 174, 96, 0.2);
            color: #27ae60;
            border: 1px solid rgba(39, 174, 96, 0.3);
        }
        
        .approve-btn:hover {
            background: rgba(39, 174, 96, 0.3);
        }
        
        .reject-btn {
            background: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            border: 1px solid rgba(231, 76, 60, 0.3);
        }
        
        .reject-btn:hover {
            background: rgba(231, 76, 60, 0.3);
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 1.2em;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 20px;
            }
            
            .stats {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .controls {
                flex-direction: column;
            }
            
            .search-box {
                min-width: auto;
            }
            
            .users-table {
                font-size: 0.9em;
            }
            
            .users-table th,
            .users-table td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">
                <h1>Digital Hermit - PHP Admin</h1>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number"><?php echo $stats['total_users']; ?></div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $stats['pending_users']; ?></div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $stats['approved_users']; ?></div>
                    <div class="stat-label">Approved</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $stats['enhanced_profiles']; ?></div>
                    <div class="stat-label">Enhanced Profiles</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="controls">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search by name or email...">
            </div>
            
            <select class="filter-select" id="statusFilter">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
            
            <button class="refresh-btn" id="refreshBtn">Refresh</button>
        </div>
        
        <div id="usersContainer">
            <div class="loading">Loading users...</div>
        </div>
    </div>
    
    <script>
        class PHPAdminDashboard {
            constructor() {
                this.currentPage = 1;
                this.searchInput = document.getElementById('searchInput');
                this.statusFilter = document.getElementById('statusFilter');
                this.refreshBtn = document.getElementById('refreshBtn');
                this.container = document.getElementById('usersContainer');
                
                this.addEventListeners();
                this.loadUsers();
            }
            
            addEventListeners() {
                this.searchInput.addEventListener('input', debounce(() => {
                    this.loadUsers();
                }, 300));
                
                this.statusFilter.addEventListener('change', () => {
                    this.loadUsers();
                });
                
                this.refreshBtn.addEventListener('click', () => {
                    this.loadUsers();
                });
            }
            
            async loadUsers() {
                try {
                    this.showLoading();
                    
                    const search = this.searchInput.value;
                    const status = this.statusFilter.value;
                    
                    const response = await fetch(`?action=get_users&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${this.currentPage}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        this.renderUsers(result.data);
                    } else {
                        throw new Error(result.error || 'Failed to load users');
                    }
                    
                } catch (error) {
                    console.error('Error loading users:', error);
                    this.showError('Failed to load users. Please try again.');
                }
            }
            
            renderUsers(users) {
                if (users.length === 0) {
                    this.container.innerHTML = '<div class="loading">No users found</div>';
                    return;
                }
                
                const html = `
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Source</th>
                                <th>Interests</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => this.createUserRow(user)).join('')}
                        </tbody>
                    </table>
                `;
                
                this.container.innerHTML = html;
            }
            
            createUserRow(user) {
                const fullName = user.first_name && user.last_name ? 
                    `${user.first_name} ${user.last_name}` : user.name;
                const interests = user.interests ? user.interests.split(',').slice(0, 3).join(', ') : 'None';
                const createdDate = new Date(user.created_at).toLocaleDateString();
                const statusClass = `status-${user.status}`;
                
                return `
                    <tr>
                        <td>${fullName}</td>
                        <td>${user.email}</td>
                        <td>${user.source}</td>
                        <td>${interests}</td>
                        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
                        <td>${createdDate}</td>
                        <td>
                            ${user.status === 'pending' ? `
                                <button class="action-btn approve-btn" onclick="adminDashboard.updateStatus(${user.id}, 'approved')">
                                    Approve
                                </button>
                                <button class="action-btn reject-btn" onclick="adminDashboard.updateStatus(${user.id}, 'rejected')">
                                    Reject
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }
            
            async updateStatus(userId, status) {
                try {
                    const formData = new FormData();
                    formData.append('user_id', userId);
                    formData.append('status', status);
                    
                    const response = await fetch('?action=update_status', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        this.loadUsers();
                        this.showMessage(`User status updated to ${status}`, 'success');
                    } else {
                        throw new Error(result.error || 'Failed to update status');
                    }
                    
                } catch (error) {
                    console.error('Error updating status:', error);
                    this.showMessage('Failed to update status. Please try again.', 'error');
                }
            }
            
            showLoading() {
                this.container.innerHTML = '<div class="loading">Loading users...</div>';
            }
            
            showError(message) {
                this.container.innerHTML = `<div class="loading">${message}</div>`;
            }
            
            showMessage(text, type) {
                const message = document.createElement('div');
                message.textContent = text;
                message.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 1000;
                    font-weight: bold;
                    color: white;
                    background: ${type === 'success' ? 'rgba(39, 174, 96, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
                `;
                
                document.body.appendChild(message);
                
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 3000);
            }
        }
        
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Initialize dashboard
        const adminDashboard = new PHPAdminDashboard();
    </script>
</body>
</html>

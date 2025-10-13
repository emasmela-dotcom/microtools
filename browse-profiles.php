<?php
/**
 * Profile Browsing Page - Digital Hermit Community
 * Shows how users can browse other profiles
 */

require_once 'landing-page/config/database.php';

class ProfileBrowser {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function getProfiles($limit = 20, $offset = 0, $search = '', $interest = '') {
        $whereClause = "u.status = 'approved'";
        $params = [];
        
        if (!empty($search)) {
            $whereClause .= " AND (u.name LIKE :search OR up.bio LIKE :search OR up.location LIKE :search)";
            $params['search'] = "%{$search}%";
        }
        
        if (!empty($interest)) {
            $whereClause .= " AND EXISTS (
                SELECT 1 FROM user_interests ui 
                WHERE ui.user_profile_id = up.id 
                AND ui.interest LIKE :interest
            )";
            $params['interest'] = "%{$interest}%";
        }
        
        $sql = "
            SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                up.first_name,
                up.last_name,
                up.age,
                up.location,
                up.bio,
                up.tech_interests,
                up.mindfulness_practices,
                up.work_style,
                up.hobbies,
                up.connection_type,
                up.privacy_level,
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
    
    public function getProfileById($userId) {
        $sql = "
            SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                up.first_name,
                up.last_name,
                up.age,
                up.location,
                up.bio,
                up.tech_interests,
                up.mindfulness_practices,
                up.work_style,
                up.hobbies,
                up.connection_type,
                up.privacy_level,
                (SELECT GROUP_CONCAT(ui2.interest) 
                 FROM user_interests ui2 
                 WHERE ui2.user_profile_id = up.id) as interests
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = ? AND u.status = 'approved'
        ";
        
        return $this->db->fetchOne($sql, [$userId]);
    }
    
    public function getAllInterests() {
        $sql = "
            SELECT DISTINCT interest, COUNT(*) as count
            FROM user_interests ui
            JOIN user_profiles up ON ui.user_profile_id = up.id
            JOIN users u ON up.user_id = u.id
            WHERE u.status = 'approved'
            GROUP BY interest
            ORDER BY count DESC, interest ASC
        ";
        
        return $this->db->fetchAll($sql);
    }
}

$browser = new ProfileBrowser();

// Handle AJAX requests
if (isset($_GET['action'])) {
    header('Content-Type: application/json');
    
    switch ($_GET['action']) {
        case 'get_profiles':
            $limit = $_GET['limit'] ?? 20;
            $offset = $_GET['offset'] ?? 0;
            $search = $_GET['search'] ?? '';
            $interest = $_GET['interest'] ?? '';
            
            $profiles = $browser->getProfiles($limit, $offset, $search, $interest);
            echo json_encode(['success' => true, 'profiles' => $profiles]);
            break;
            
        case 'get_profile':
            $userId = $_GET['user_id'] ?? 0;
            $profile = $browser->getProfileById($userId);
            echo json_encode(['success' => true, 'profile' => $profile]);
            break;
            
        case 'get_interests':
            $interests = $browser->getAllInterests();
            echo json_encode(['success' => true, 'interests' => $interests]);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browse Profiles - Digital Hermit Community</title>
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
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #ecf0f1;
        }
        
        .header p {
            font-size: 1.1rem;
            color: #bdc3c7;
        }
        
        .filters {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .filter-group label {
            font-size: 0.9rem;
            color: #bdc3c7;
        }
        
        .filter-group input,
        .filter-group select {
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            color: #2c3e50;
            font-size: 0.9rem;
        }
        
        .filter-group input:focus,
        .filter-group select:focus {
            outline: none;
            background: white;
        }
        
        .search-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s;
        }
        
        .search-btn:hover {
            background: #2980b9;
        }
        
        .profiles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .profile-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        
        .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .profile-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3498db, #9b59b6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            margin-right: 15px;
        }
        
        .profile-info h3 {
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
        
        .profile-info p {
            font-size: 0.9rem;
            color: #bdc3c7;
        }
        
        .profile-details {
            margin-bottom: 15px;
        }
        
        .profile-details p {
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .profile-details .label {
            color: #3498db;
            font-weight: bold;
        }
        
        .interests {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .interest-tag {
            background: rgba(52, 152, 219, 0.2);
            color: #3498db;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #bdc3c7;
        }
        
        .error {
            text-align: center;
            padding: 40px;
            color: #e74c3c;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .pagination button {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .pagination button:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination button.active {
            background: #3498db;
        }
        
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .back-link:hover {
            color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Digital Hermit Community</a>
        
        <div class="header">
            <h1>🏠 Browse Digital Hermits</h1>
            <p>Discover other hermits who share your interests and values</p>
        </div>
        
        <div class="filters">
            <div class="filter-group">
                <label for="search">Search</label>
                <input type="text" id="search" placeholder="Search by name, bio, or location...">
            </div>
            
            <div class="filter-group">
                <label for="interest">Interest</label>
                <select id="interest">
                    <option value="">All Interests</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="work-style">Work Style</label>
                <select id="work-style">
                    <option value="">All Work Styles</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="office">Office</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="connection-type">Connection Type</label>
                <select id="connection-type">
                    <option value="">All Types</option>
                    <option value="professional">Professional</option>
                    <option value="friendship">Friendship</option>
                    <option value="collaboration">Collaboration</option>
                </select>
            </div>
            
            <button class="search-btn" onclick="searchProfiles()">Search</button>
        </div>
        
        <div id="profiles-container">
            <div class="loading">Loading profiles...</div>
        </div>
        
        <div class="pagination" id="pagination" style="display: none;">
            <button id="prev-btn" onclick="previousPage()">Previous</button>
            <span id="page-info"></span>
            <button id="next-btn" onclick="nextPage()">Next</button>
        </div>
    </div>

    <script>
        let currentPage = 0;
        const limit = 12;
        let totalProfiles = 0;
        
        // Load profiles on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadInterests();
            loadProfiles();
        });
        
        // Load available interests
        async function loadInterests() {
            try {
                const response = await fetch('?action=get_interests');
                const data = await response.json();
                
                if (data.success) {
                    const interestSelect = document.getElementById('interest');
                    data.interests.forEach(interest => {
                        const option = document.createElement('option');
                        option.value = interest.interest;
                        option.textContent = `${interest.interest} (${interest.count})`;
                        interestSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Error loading interests:', error);
            }
        }
        
        // Load profiles
        async function loadProfiles() {
            try {
                const search = document.getElementById('search').value;
                const interest = document.getElementById('interest').value;
                
                const params = new URLSearchParams({
                    action: 'get_profiles',
                    limit: limit,
                    offset: currentPage * limit,
                    search: search,
                    interest: interest
                });
                
                const response = await fetch(`?${params}`);
                const data = await response.json();
                
                if (data.success) {
                    displayProfiles(data.profiles);
                    totalProfiles = data.profiles.length;
                    updatePagination();
                } else {
                    showError('Failed to load profiles');
                }
            } catch (error) {
                console.error('Error loading profiles:', error);
                showError('Failed to load profiles');
            }
        }
        
        // Display profiles
        function displayProfiles(profiles) {
            const container = document.getElementById('profiles-container');
            
            if (profiles.length === 0) {
                container.innerHTML = '<div class="error">No profiles found. Try adjusting your search criteria.</div>';
                return;
            }
            
            const profilesHTML = profiles.map(profile => {
                const fullName = profile.first_name && profile.last_name ? 
                    `${profile.first_name} ${profile.last_name}` : profile.name;
                
                const interests = profile.interests ? 
                    profile.interests.split(',').map(interest => 
                        `<span class="interest-tag">${interest.trim()}</span>`
                    ).join('') : 
                    '<span class="interest-tag">No interests listed</span>';
                
                const bio = profile.bio ? 
                    (profile.bio.length > 100 ? profile.bio.substring(0, 100) + '...' : profile.bio) : 
                    'No bio provided';
                
                return `
                    <div class="profile-card" onclick="viewProfile(${profile.id})">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                ${fullName.charAt(0).toUpperCase()}
                            </div>
                            <div class="profile-info">
                                <h3>${fullName}</h3>
                                <p>${profile.location || 'Location not specified'}</p>
                            </div>
                        </div>
                        
                        <div class="profile-details">
                            <p><span class="label">Bio:</span> ${bio}</p>
                            ${profile.work_style ? `<p><span class="label">Work Style:</span> ${profile.work_style}</p>` : ''}
                            ${profile.connection_type ? `<p><span class="label">Looking for:</span> ${profile.connection_type}</p>` : ''}
                            <p><span class="label">Joined:</span> ${new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="interests">
                            ${interests}
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = `<div class="profiles-grid">${profilesHTML}</div>`;
        }
        
        // Search profiles
        function searchProfiles() {
            currentPage = 0;
            loadProfiles();
        }
        
        // View individual profile
        function viewProfile(userId) {
            // This would open a detailed profile view
            alert(`Viewing profile for user ID: ${userId}\n\nThis would show the full profile with all details, interests, and bio.`);
        }
        
        // Pagination
        function previousPage() {
            if (currentPage > 0) {
                currentPage--;
                loadProfiles();
            }
        }
        
        function nextPage() {
            if (totalProfiles === limit) {
                currentPage++;
                loadProfiles();
            }
        }
        
        function updatePagination() {
            const pagination = document.getElementById('pagination');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const pageInfo = document.getElementById('page-info');
            
            if (totalProfiles > 0) {
                pagination.style.display = 'flex';
                prevBtn.disabled = currentPage === 0;
                nextBtn.disabled = totalProfiles < limit;
                pageInfo.textContent = `Page ${currentPage + 1}`;
            } else {
                pagination.style.display = 'none';
            }
        }
        
        function showError(message) {
            const container = document.getElementById('profiles-container');
            container.innerHTML = `<div class="error">${message}</div>`;
        }
        
        // Search on Enter key
        document.getElementById('search').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProfiles();
            }
        });
    </script>
</body>
</html>

/**
 * User Discovery and Connection System
 * Handles user browsing, matching, and mutual connection requests
 */

class UserDiscovery {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentUser = null;
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.totalPages = 1;
        
        // DOM elements
        this.container = document.getElementById('usersContainer');
        this.searchInput = document.getElementById('searchInput');
        this.locationFilter = document.getElementById('locationFilter');
        this.ageFilter = document.getElementById('ageFilter');
        this.workStyleFilter = document.getElementById('workStyleFilter');
        this.connectionTypeFilter = document.getElementById('connectionTypeFilter');
        this.interestsFilter = document.getElementById('interestsFilter');
        this.sortBy = document.getElementById('sortBy');
        this.applyFiltersBtn = document.getElementById('applyFilters');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.pagination = document.getElementById('pagination');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageNumbers = document.getElementById('pageNumbers');
        
        this.init();
    }
    
    /**
     * Initialize the discovery system
     */
    async init() {
        console.log('Initializing user discovery system...');
        
        // Add event listeners
        this.addEventListeners();
        
        // Load current user profile (for matching)
        await this.loadCurrentUser();
        
        // Load all users
        await this.loadUsers();
        
        // Render initial view
        this.filterAndSort();
        this.renderUsers();
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        this.searchInput.addEventListener('input', debounce(() => {
            this.filterAndSort();
            this.renderUsers();
        }, 300));
        
        this.applyFiltersBtn.addEventListener('click', () => {
            this.filterAndSort();
            this.renderUsers();
        });
        
        this.clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
            this.filterAndSort();
            this.renderUsers();
        });
        
        this.prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderUsers();
            }
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderUsers();
            }
        });
    }
    
    /**
     * Load current user profile for matching
     */
    async loadCurrentUser() {
        try {
            // For now, we'll use a mock current user
            // In a real app, this would come from Firebase Auth
            this.currentUser = {
                id: 'current_user',
                firstName: 'Current',
                lastName: 'User',
                interests: ['programming', 'design', 'writing'],
                location: 'San Francisco, USA',
                workStyle: 'remote',
                connectionType: 'collaboration'
            };
            
            console.log('Current user loaded:', this.currentUser);
            
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }
    
    /**
     * Load all users from Firebase
     */
    async loadUsers() {
        try {
            this.showLoading();
            
            const result = await firebaseService.getAllSignups();
            
            if (result.success) {
                // Filter out current user and convert signups to user profiles
                this.users = (result.data || [])
                    .filter(signup => signup.id !== this.currentUser?.id)
                    .map(signup => this.convertSignupToUser(signup));
                
                console.log(`Loaded ${this.users.length} users for discovery`);
                
            } else {
                throw new Error(result.error || 'Failed to load users');
            }
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users. Please try again.');
        }
    }
    
    /**
     * Convert signup data to user profile format
     */
    convertSignupToUser(signup) {
        return {
            id: signup.id,
            firstName: signup.firstName || signup.name?.split(' ')[0] || 'Unknown',
            lastName: signup.lastName || signup.name?.split(' ').slice(1).join(' ') || '',
            email: signup.email,
            age: signup.age,
            location: signup.location,
            bio: signup.bio || signup.message || 'No bio provided',
            interests: signup.interests || [],
            hobbies: signup.hobbies,
            workStyle: signup.workStyle,
            connectionType: signup.connectionType,
            privacyLevel: signup.privacyLevel,
            techInterests: signup.techInterests,
            mindfulnessPractices: signup.mindfulnessPractices,
            createdAt: signup.createdAt || signup.timestamp,
            matchScore: this.calculateMatchScore(signup)
        };
    }
    
    /**
     * Calculate match score between current user and another user
     */
    calculateMatchScore(user) {
        if (!this.currentUser) return 0;
        
        let score = 0;
        let totalFactors = 0;
        
        // Interest matching (40% weight)
        if (this.currentUser.interests && user.interests) {
            const commonInterests = this.currentUser.interests.filter(interest => 
                user.interests.includes(interest)
            );
            const interestScore = (commonInterests.length / Math.max(this.currentUser.interests.length, user.interests.length)) * 40;
            score += interestScore;
            totalFactors += 40;
        }
        
        // Location matching (20% weight)
        if (this.currentUser.location && user.location) {
            const currentLocation = this.currentUser.location.toLowerCase();
            const userLocation = user.location.toLowerCase();
            if (currentLocation.includes(userLocation.split(',')[0]) || userLocation.includes(currentLocation.split(',')[0])) {
                score += 20;
            }
            totalFactors += 20;
        }
        
        // Work style matching (20% weight)
        if (this.currentUser.workStyle && user.workStyle && this.currentUser.workStyle === user.workStyle) {
            score += 20;
            totalFactors += 20;
        }
        
        // Connection type matching (20% weight)
        if (this.currentUser.connectionType && user.connectionType && this.currentUser.connectionType === user.connectionType) {
            score += 20;
            totalFactors += 20;
        }
        
        return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 0;
    }
    
    /**
     * Filter and sort users
     */
    filterAndSort() {
        let filtered = [...this.users];
        
        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const bio = user.bio?.toLowerCase() || '';
                const interests = user.interests?.join(' ').toLowerCase() || '';
                const location = user.location?.toLowerCase() || '';
                
                return fullName.includes(searchTerm) || 
                       bio.includes(searchTerm) || 
                       interests.includes(searchTerm) ||
                       location.includes(searchTerm);
            });
        }
        
        // Apply location filter
        const locationFilter = this.locationFilter.value.toLowerCase();
        if (locationFilter) {
            filtered = filtered.filter(user => 
                user.location?.toLowerCase().includes(locationFilter)
            );
        }
        
        // Apply age filter
        const ageFilter = this.ageFilter.value;
        if (ageFilter) {
            filtered = filtered.filter(user => user.age === ageFilter);
        }
        
        // Apply work style filter
        const workStyleFilter = this.workStyleFilter.value;
        if (workStyleFilter) {
            filtered = filtered.filter(user => user.workStyle === workStyleFilter);
        }
        
        // Apply connection type filter
        const connectionTypeFilter = this.connectionTypeFilter.value;
        if (connectionTypeFilter) {
            filtered = filtered.filter(user => user.connectionType === connectionTypeFilter);
        }
        
        // Apply interests filter
        const interestsFilter = this.interestsFilter.value;
        if (interestsFilter) {
            filtered = filtered.filter(user => 
                user.interests?.includes(interestsFilter)
            );
        }
        
        // Apply sorting
        const sortBy = this.sortBy.value;
        switch (sortBy) {
            case 'match':
                filtered.sort((a, b) => b.matchScore - a.matchScore);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'location':
                filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
                break;
            case 'interests':
                filtered.sort((a, b) => (b.interests?.length || 0) - (a.interests?.length || 0));
                break;
        }
        
        this.filteredUsers = filtered;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    }
    
    /**
     * Render users to the page
     */
    renderUsers() {
        if (this.filteredUsers.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);
        
        // Render user cards
        const html = pageUsers.map(user => this.createUserCard(user)).join('');
        this.container.innerHTML = `<div class="users-grid">${html}</div>`;
        
        // Render pagination
        this.renderPagination();
    }
    
    /**
     * Create HTML for a user card
     */
    createUserCard(user) {
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        const location = user.location || 'Location not specified';
        const age = user.age || 'Age not specified';
        const workStyle = user.workStyle || 'Work style not specified';
        const interests = user.interests || [];
        const bio = user.bio || 'No bio provided';
        const matchScore = user.matchScore || 0;
        
        const interestsHtml = interests.slice(0, 6).map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        const connectionStatus = this.getConnectionStatus(user.id);
        const statusClass = connectionStatus ? `status-${connectionStatus}` : '';
        const statusText = connectionStatus ? this.getStatusText(connectionStatus) : '';
        
        return `
            <div class="user-card" data-id="${user.id}">
                ${matchScore > 0 ? `<div class="match-score">${matchScore}% Match</div>` : ''}
                ${statusText ? `<div class="connection-status ${statusClass}">${statusText}</div>` : ''}
                
                <div class="user-header">
                    <div class="user-avatar">
                        ${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h3>${fullName}</h3>
                        <div class="user-meta">
                            <span>📍 ${location}</span>
                            <span>🎂 ${age}</span>
                            <span>💼 ${workStyle}</span>
                        </div>
                    </div>
                </div>
                
                <div class="user-bio">"${bio}"</div>
                <div class="user-interests">${interestsHtml}</div>
                
                <div class="connection-actions">
                    <button class="btn-view" onclick="userDiscovery.viewUserProfile('${user.id}')">
                        View Profile
                    </button>
                    ${!connectionStatus ? `
                        <button class="btn-connect" onclick="userDiscovery.sendConnectionRequest('${user.id}')">
                            Connect
                        </button>
                    ` : connectionStatus === 'pending' ? `
                        <button class="btn-connect" disabled>
                            Request Sent
                        </button>
                    ` : connectionStatus === 'connected' ? `
                        <button class="btn-connect" onclick="userDiscovery.openChat('${user.id}')">
                            Message
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Get connection status between current user and another user
     */
    getConnectionStatus(userId) {
        // This would check Firebase for existing connections
        // For now, return null (no connection)
        return null;
    }
    
    /**
     * Get status text for connection status
     */
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Request Sent';
            case 'connected': return 'Connected';
            case 'rejected': return 'Declined';
            default: return '';
        }
    }
    
    /**
     * Send connection request to another user
     */
    async sendConnectionRequest(userId) {
        try {
            const targetUser = this.users.find(u => u.id === userId);
            if (!targetUser) return;
            
            // Create connection request
            const connectionRequest = {
                fromUserId: this.currentUser.id,
                toUserId: userId,
                fromUserName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                toUserName: `${targetUser.firstName} ${targetUser.lastName}`,
                status: 'pending',
                timestamp: new Date().toISOString(),
                message: `Hi ${targetUser.firstName}! I'd like to connect with you on Digital Hermit.`
            };
            
            // Save to Firebase
            const result = await firebaseService.saveConnectionRequest(connectionRequest);
            
            if (result.success) {
                // Show success message
                this.showMessage(`Connection request sent to ${targetUser.firstName}!`, 'success');
                
                // Update UI
                this.renderUsers();
                
                // Track analytics
                if (window.analytics) {
                    window.analytics.logEvent('connection_request_sent', {
                        target_user_id: userId,
                        match_score: targetUser.matchScore
                    });
                }
                
            } else {
                throw new Error(result.error || 'Failed to send connection request');
            }
            
        } catch (error) {
            console.error('Error sending connection request:', error);
            this.showMessage('Failed to send connection request. Please try again.', 'error');
        }
    }
    
    /**
     * View detailed user profile
     */
    viewUserProfile(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        // Create detailed profile modal (simplified version)
        const details = `
            ${user.firstName} ${user.lastName}
            
            Location: ${user.location || 'Not provided'}
            Age: ${user.age || 'Not provided'}
            Work Style: ${user.workStyle || 'Not provided'}
            Connection Type: ${user.connectionType || 'Not specified'}
            
            Bio: ${user.bio || 'No bio provided'}
            
            Tech Interests: ${user.techInterests || 'Not provided'}
            Mindfulness Practices: ${user.mindfulnessPractices || 'Not provided'}
            
            Interests: ${(user.interests || []).join(', ')}
            Hobbies: ${user.hobbies || 'Not provided'}
            
            Match Score: ${user.matchScore}%
            Member Since: ${new Date(user.createdAt).toLocaleDateString()}
        `;
        
        alert(details);
    }
    
    /**
     * Open chat with connected user
     */
    openChat(userId) {
        // This would open a chat interface
        alert('Chat feature coming soon!');
    }
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchInput.value = '';
        this.locationFilter.value = '';
        this.ageFilter.value = '';
        this.workStyleFilter.value = '';
        this.connectionTypeFilter.value = '';
        this.interestsFilter.value = '';
        this.sortBy.value = 'match';
    }
    
    /**
     * Render pagination controls
     */
    renderPagination() {
        if (this.totalPages <= 1) {
            this.pagination.style.display = 'none';
            return;
        }
        
        this.pagination.style.display = 'flex';
        
        // Update prev/next buttons
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage === this.totalPages;
        
        // Generate page numbers
        const pageNumbersHtml = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentPage;
            pageNumbersHtml.push(`
                <button class="page-btn ${isActive ? 'active' : ''}" 
                        onclick="userDiscovery.goToPage(${i})">
                    ${i}
                </button>
            `);
        }
        
        this.pageNumbers.innerHTML = pageNumbersHtml.join('');
    }
    
    /**
     * Go to specific page
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.renderUsers();
        }
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        this.container.innerHTML = '<div class="loading">Loading digital hermits...</div>';
    }
    
    /**
     * Show empty state
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>No users found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        this.pagination.style.display = 'none';
    }
    
    /**
     * Show error state
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="userDiscovery.loadUsers()">Try Again</button>
            </div>
        `;
    }
    
    /**
     * Show message to user
     */
    showMessage(text, type) {
        // Create temporary message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        if (type === 'success') {
            message.style.background = 'rgba(39, 174, 96, 0.9)';
            message.style.color = 'white';
        } else {
            message.style.background = 'rgba(231, 76, 60, 0.9)';
            message.style.color = 'white';
        }
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }
}

/**
 * Debounce utility function
 */
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

// Initialize discovery system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userDiscovery = new UserDiscovery();
    console.log('User discovery system initialized');
});

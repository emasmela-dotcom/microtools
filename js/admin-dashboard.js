/**
 * Admin Dashboard for Digital Hermit Community Platform
 * Manages signup data, filtering, and user management
 */

class AdminDashboard {
    constructor() {
        this.signups = [];
        this.filteredSignups = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        
        // DOM elements
        this.container = document.getElementById('signupsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.statusFilter = document.getElementById('statusFilter');
        this.sortBy = document.getElementById('sortBy');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.pagination = document.getElementById('pagination');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageNumbers = document.getElementById('pageNumbers');
        
        // Stats elements
        this.totalSignups = document.getElementById('totalSignups');
        this.pendingSignups = document.getElementById('pendingSignups');
        this.approvedSignups = document.getElementById('approvedSignups');
        
        this.init();
    }
    
    /**
     * Initialize the dashboard
     */
    async init() {
        console.log('Initializing admin dashboard...');
        
        // Add event listeners
        this.addEventListeners();
        
        // Load initial data
        await this.loadSignups();
        
        // Render initial view
        this.renderSignups();
        this.updateStats();
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        this.searchInput.addEventListener('input', debounce(() => {
            this.filterAndSort();
            this.renderSignups();
        }, 300));
        
        this.statusFilter.addEventListener('change', () => {
            this.filterAndSort();
            this.renderSignups();
        });
        
        this.sortBy.addEventListener('change', () => {
            this.filterAndSort();
            this.renderSignups();
        });
        
        this.refreshBtn.addEventListener('click', () => {
            this.loadSignups();
        });
        
        this.prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderSignups();
            }
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderSignups();
            }
        });
    }
    
    /**
     * Load signups from Firebase or localStorage
     */
    async loadSignups() {
        try {
            this.showLoading();
            
            const result = await firebaseService.getAllSignups();
            
            if (result.success) {
                this.signups = result.data || [];
                console.log(`Loaded ${this.signups.length} signups`);
                
                // Process and normalize data
                this.signups = this.signups.map(signup => ({
                    ...signup,
                    status: signup.status || 'pending',
                    createdAt: signup.createdAt || signup.timestamp || new Date().toISOString(),
                    interests: signup.interests || [],
                    firstName: signup.firstName || signup.name?.split(' ')[0] || 'Unknown',
                    lastName: signup.lastName || signup.name?.split(' ').slice(1).join(' ') || '',
                    bio: signup.bio || signup.message || 'No bio provided'
                }));
                
                this.filterAndSort();
                this.renderSignups();
                this.updateStats();
                
            } else {
                throw new Error(result.error || 'Failed to load signups');
            }
            
        } catch (error) {
            console.error('Error loading signups:', error);
            this.showError('Failed to load signups. Please try again.');
        }
    }
    
    /**
     * Filter and sort signups
     */
    filterAndSort() {
        let filtered = [...this.signups];
        
        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(signup => {
                const fullName = `${signup.firstName} ${signup.lastName}`.toLowerCase();
                const email = signup.email?.toLowerCase() || '';
                const interests = signup.interests?.join(' ').toLowerCase() || '';
                const bio = signup.bio?.toLowerCase() || '';
                
                return fullName.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       interests.includes(searchTerm) ||
                       bio.includes(searchTerm);
            });
        }
        
        // Apply status filter
        const statusFilter = this.statusFilter.value;
        if (statusFilter) {
            filtered = filtered.filter(signup => signup.status === statusFilter);
        }
        
        // Apply sorting
        const sortBy = this.sortBy.value;
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                filtered.sort((a, b) => {
                    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'email':
                filtered.sort((a, b) => (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase()));
                break;
        }
        
        this.filteredSignups = filtered;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredSignups.length / this.itemsPerPage);
    }
    
    /**
     * Render signups to the page
     */
    renderSignups() {
        if (this.filteredSignups.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSignups = this.filteredSignups.slice(startIndex, endIndex);
        
        // Render signup cards
        const html = pageSignups.map(signup => this.createSignupCard(signup)).join('');
        this.container.innerHTML = `<div class="signups-grid">${html}</div>`;
        
        // Render pagination
        this.renderPagination();
    }
    
    /**
     * Create HTML for a signup card
     */
    createSignupCard(signup) {
        const fullName = `${signup.firstName} ${signup.lastName}`.trim();
        const email = signup.email || 'No email provided';
        const location = signup.location || 'Location not specified';
        const createdAt = new Date(signup.createdAt).toLocaleDateString();
        const interests = signup.interests || [];
        const bio = signup.bio || 'No bio provided';
        const workStyle = signup.workStyle || 'Not specified';
        
        const statusClass = `status-${signup.status}`;
        const statusText = signup.status.charAt(0).toUpperCase() + signup.status.slice(1);
        
        const interestsHtml = interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        return `
            <div class="signup-card" data-id="${signup.id}">
                <div class="signup-header">
                    <div class="signup-info">
                        <h3>${fullName}</h3>
                        <div class="signup-meta">
                            <span>📧 ${email}</span>
                            <span>📍 ${location}</span>
                            <span>💼 ${workStyle}</span>
                            <span>📅 ${createdAt}</span>
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="signup-content">
                    <div class="bio">"${bio}"</div>
                    <div class="interests">${interestsHtml}</div>
                </div>
                
                <div class="signup-actions">
                    <button class="action-btn view-btn" onclick="adminDashboard.viewSignup('${signup.id}')">
                        View Details
                    </button>
                    ${signup.status === 'pending' ? `
                        <button class="action-btn approve-btn" onclick="adminDashboard.updateStatus('${signup.id}', 'approved')">
                            Approve
                        </button>
                        <button class="action-btn reject-btn" onclick="adminDashboard.updateStatus('${signup.id}', 'rejected')">
                            Reject
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
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
                        onclick="adminDashboard.goToPage(${i})">
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
            this.renderSignups();
        }
    }
    
    /**
     * Update signup status
     */
    async updateStatus(signupId, newStatus) {
        try {
            const result = await firebaseService.updateSignupStatus(signupId, newStatus);
            
            if (result.success) {
                // Update local data
                const signup = this.signups.find(s => s.id === signupId);
                if (signup) {
                    signup.status = newStatus;
                    signup.updatedAt = new Date().toISOString();
                }
                
                // Re-render
                this.filterAndSort();
                this.renderSignups();
                this.updateStats();
                
                console.log(`Signup ${signupId} status updated to ${newStatus}`);
                
            } else {
                throw new Error(result.error || 'Failed to update status');
            }
            
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    }
    
    /**
     * View detailed signup information
     */
    viewSignup(signupId) {
        const signup = this.signups.find(s => s.id === signupId);
        if (!signup) return;
        
        // Create detailed view modal (simplified version)
        const details = `
            Full Name: ${signup.firstName} ${signup.lastName}
            Email: ${signup.email || 'Not provided'}
            Age: ${signup.age || 'Not provided'}
            Location: ${signup.location || 'Not provided'}
            Work Style: ${signup.workStyle || 'Not provided'}
            Bio: ${signup.bio || 'Not provided'}
            Tech Interests: ${signup.techInterests || 'Not provided'}
            Mindfulness Practices: ${signup.mindfulnessPractices || 'Not provided'}
            Interests: ${(signup.interests || []).join(', ')}
            Hobbies: ${signup.hobbies || 'Not provided'}
            Connection Type: ${signup.connectionType || 'Not specified'}
            Privacy Level: ${signup.privacyLevel || 'Not specified'}
            Newsletter: ${signup.newsletter ? 'Subscribed' : 'Not subscribed'}
            Created: ${new Date(signup.createdAt).toLocaleString()}
            Status: ${signup.status}
        `;
        
        alert(details);
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        const total = this.signups.length;
        const pending = this.signups.filter(s => s.status === 'pending').length;
        const approved = this.signups.filter(s => s.status === 'approved').length;
        
        this.totalSignups.textContent = total;
        this.pendingSignups.textContent = pending;
        this.approvedSignups.textContent = approved;
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        this.container.innerHTML = '<div class="loading">Loading signups...</div>';
    }
    
    /**
     * Show empty state
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>No signups found</h3>
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
                <button class="refresh-btn" onclick="adminDashboard.loadSignups()">Try Again</button>
            </div>
        `;
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    console.log('Admin dashboard initialized');
});

/**
 * Admin Dashboard JavaScript
 * Handles all admin dashboard functionality
 */

class AdminDashboard {
    constructor() {
        this.submissions = [];
        this.currentPage = 1;
        this.itemsPerPage = 25;
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.filters = {
            date: 'all',
            interest: 'all',
            search: ''
        };
        this.charts = {};
        
        this.init();
    }
    
    /**
     * Initialize the dashboard
     */
    init() {
        this.loadSubmissions();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.updateStats();
        
        console.log('Admin Dashboard initialized');
    }
    
    /**
     * Load submissions from localStorage or API
     */
    loadSubmissions() {
        // Try to load from localStorage first (for demo purposes)
        const storedSubmissions = localStorage.getItem('digital_hermit_submissions');
        if (storedSubmissions) {
            this.submissions = JSON.parse(storedSubmissions);
        } else {
            // Generate sample data for demo
            this.submissions = this.generateSampleData();
            this.saveSubmissions();
        }
        
        this.updateSubmissionsCount();
        this.renderSubmissions();
        this.updateStats();
        this.updateInterestFilters();
    }
    
    /**
     * Generate sample data for demo purposes
     */
    generateSampleData() {
        const sampleData = [];
        const interests = [
            'technology', 'philosophy', 'minimalism', 'books', 'nature', 'art', 'music',
            'writing', 'meditation', 'sustainability', 'psychology', 'photography',
            'poetry', 'privacy', 'yoga', 'astronomy', 'journaling', 'independent-films',
            'stoicism', 'botany', 'cryptocurrency', 'cooking', 'gardening', 'hiking',
            'classical-music', 'history', 'linguistics', 'open-source', 'tea-culture',
            'calligraphy', 'buddhism', 'wildlife', 'museums', 'climate-science',
            'existentialism', 'pottery'
        ];
        
        const names = [
            'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Rodriguez',
            'Lisa Thompson', 'James Wilson', 'Maria Garcia', 'Robert Brown',
            'Jennifer Davis', 'Christopher Miller', 'Amanda Taylor', 'Daniel Anderson',
            'Jessica Thomas', 'Matthew Jackson', 'Ashley White', 'Joshua Harris',
            'Stephanie Martin', 'Andrew Thompson', 'Nicole Garcia', 'Kevin Martinez',
            'Rachel Robinson', 'Brandon Clark', 'Samantha Lewis', 'Tyler Walker',
            'Megan Hall', 'Ryan Allen', 'Lauren Young', 'Justin King', 'Kayla Wright',
            'Nathan Lopez', 'Brittany Hill', 'Zachary Scott', 'Danielle Green',
            'Cody Adams', 'Katherine Baker', 'Jordan Gonzalez', 'Alexis Nelson',
            'Austin Carter', 'Morgan Mitchell', 'Taylor Perez', 'Jordan Roberts',
            'Casey Turner', 'Riley Phillips', 'Avery Campbell', 'Quinn Parker',
            'Sage Evans', 'River Edwards', 'Phoenix Collins', 'Skyler Stewart'
        ];
        
        const locations = [
            'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
            'Portland, OR', 'Denver, CO', 'Boston, MA', 'Chicago, IL',
            'Los Angeles, CA', 'Miami, FL', 'Nashville, TN', 'Phoenix, AZ',
            'Atlanta, GA', 'Dallas, TX', 'Minneapolis, MN', 'Detroit, MI',
            'Philadelphia, PA', 'Washington, DC', 'Las Vegas, NV', 'Orlando, FL'
        ];
        
        for (let i = 0; i < 150; i++) {
            const randomInterests = this.getRandomItems(interests, 3, 5);
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                id: i + 1,
                name: randomName,
                email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
                interests: randomInterests,
                hobbies: Math.random() > 0.5 ? this.generateRandomHobby() : '',
                timestamp: randomDate.toISOString(),
                ip: this.generateRandomIP(),
                userAgent: this.generateRandomUserAgent(),
                location: randomLocation
            });
        }
        
        return sampleData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    /**
     * Get random items from an array
     */
    getRandomItems(array, min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    /**
     * Generate random hobby
     */
    generateRandomHobby() {
        const hobbies = [
            'Collecting vintage typewriters',
            'Learning ancient languages',
            'Building terrariums',
            'Urban gardening',
            'Astrophotography',
            'Woodworking',
            'Fermentation experiments',
            'Bird watching',
            'Rock climbing',
            'Chess tournaments',
            'Podcast creation',
            'Volunteer work',
            'Travel blogging',
            'Coffee roasting',
            'Hiking trails'
        ];
        return hobbies[Math.floor(Math.random() * hobbies.length)];
    }
    
    /**
     * Generate random IP address
     */
    generateRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
    
    /**
     * Generate random user agent
     */
    generateRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
            'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
    
    /**
     * Save submissions to localStorage
     */
    saveSubmissions() {
        localStorage.setItem('digital_hermit_submissions', JSON.stringify(this.submissions));
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Auto-refresh settings
        const refreshInterval = document.getElementById('refreshInterval');
        if (refreshInterval) {
            refreshInterval.addEventListener('change', (e) => {
                this.setAutoRefresh(parseInt(e.target.value));
            });
        }
        
        // Items per page settings
        const itemsPerPage = document.getElementById('itemsPerPage');
        if (itemsPerPage) {
            itemsPerPage.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderSubmissions();
            });
        }
    }
    
    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        this.setAutoRefresh(60); // Default to 1 minute
    }
    
    /**
     * Set auto-refresh interval
     */
    setAutoRefresh(seconds) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (seconds > 0) {
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, seconds * 1000);
        }
    }
    
    /**
     * Refresh all data
     */
    refreshData() {
        this.loadSubmissions();
        this.updateStats();
        this.updateAnalytics();
        
        // Show refresh indicator
        const refreshBtn = document.querySelector('.admin-btn-primary');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
            }, 1000);
        }
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        const totalSubmissions = this.submissions.length;
        const today = new Date().toDateString();
        const todaySubmissions = this.submissions.filter(sub => 
            new Date(sub.timestamp).toDateString() === today
        ).length;
        
        // Calculate conversion rate (mock data)
        const conversionRate = Math.round((totalSubmissions / 1000) * 100);
        
        // Get top interest
        const interestCounts = {};
        this.submissions.forEach(sub => {
            sub.interests.forEach(interest => {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            });
        });
        
        const topInterest = Object.keys(interestCounts).reduce((a, b) => 
            interestCounts[a] > interestCounts[b] ? a : b, 'technology'
        );
        
        // Update DOM
        this.updateElement('totalSubmissions', totalSubmissions.toLocaleString());
        this.updateElement('todaySubmissions', todaySubmissions);
        this.updateElement('conversionRate', `${conversionRate}%`);
        this.updateElement('topInterest', topInterest);
        this.updateElement('interestCount', `${interestCounts[topInterest] || 0} users`);
        
        // Update submissions count badge
        this.updateElement('submissionsCount', totalSubmissions);
    }
    
    /**
     * Update a DOM element
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    
    /**
     * Update submissions count
     */
    updateSubmissionsCount() {
        const count = this.submissions.length;
        const badge = document.getElementById('submissionsCount');
        if (badge) {
            badge.textContent = count;
        }
    }
    
    /**
     * Render submissions table
     */
    renderSubmissions() {
        const filteredSubmissions = this.getFilteredSubmissions();
        const sortedSubmissions = this.getSortedSubmissions(filteredSubmissions);
        const paginatedSubmissions = this.getPaginatedSubmissions(sortedSubmissions);
        
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        paginatedSubmissions.forEach(submission => {
            const row = this.createSubmissionRow(submission);
            tbody.appendChild(row);
        });
        
        this.renderPagination(filteredSubmissions.length);
    }
    
    /**
     * Get filtered submissions
     */
    getFilteredSubmissions() {
        return this.submissions.filter(submission => {
            // Date filter
            if (this.filters.date !== 'all') {
                const submissionDate = new Date(submission.timestamp);
                const now = new Date();
                
                switch (this.filters.date) {
                    case 'today':
                        if (submissionDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (submissionDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (submissionDate < monthAgo) return false;
                        break;
                }
            }
            
            // Interest filter
            if (this.filters.interest !== 'all') {
                if (!submission.interests.includes(this.filters.interest)) return false;
            }
            
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = `${submission.name} ${submission.email} ${submission.hobbies}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }
            
            return true;
        });
    }
    
    /**
     * Get sorted submissions
     */
    getSortedSubmissions(submissions) {
        return [...submissions].sort((a, b) => {
            let aValue = a[this.currentSort.column];
            let bValue = b[this.currentSort.column];
            
            if (this.currentSort.column === 'timestamp') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (this.currentSort.column === 'interests') {
                aValue = aValue.length;
                bValue = bValue.length;
            }
            
            if (this.currentSort.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }
    
    /**
     * Get paginated submissions
     */
    getPaginatedSubmissions(submissions) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return submissions.slice(startIndex, endIndex);
    }
    
    /**
     * Create submission row
     */
    createSubmissionRow(submission) {
        const row = document.createElement('tr');
        
        const interestsHtml = submission.interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        const timeAgo = this.getTimeAgo(new Date(submission.timestamp));
        
        row.innerHTML = `
            <td>${submission.name}</td>
            <td>${submission.email}</td>
            <td><div class="submission-interests">${interestsHtml}</div></td>
            <td>${submission.hobbies || '-'}</td>
            <td>${timeAgo}</td>
            <td>
                <div class="submission-actions">
                    <button class="action-btn view" onclick="viewSubmission(${submission.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteSubmission(${submission.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }
    
    /**
     * Render pagination
     */
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changePage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = html;
    }
    
    /**
     * Update interest filters
     */
    updateInterestFilters() {
        const interestFilter = document.getElementById('interestFilter');
        if (!interestFilter) return;
        
        const allInterests = new Set();
        this.submissions.forEach(sub => {
            sub.interests.forEach(interest => allInterests.add(interest));
        });
        
        const sortedInterests = Array.from(allInterests).sort();
        
        interestFilter.innerHTML = '<option value="all">All Interests</option>';
        sortedInterests.forEach(interest => {
            interestFilter.innerHTML += `<option value="${interest}">${interest}</option>`;
        });
    }
    
    /**
     * Update analytics
     */
    updateAnalytics() {
        this.updateSubmissionsChart();
        this.updateTopInterests();
    }
    
    /**
     * Update submissions chart
     */
    updateSubmissionsChart() {
        const canvas = document.getElementById('submissionsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.submissions) {
            this.charts.submissions.destroy();
        }
        
        // Generate chart data
        const days = 7;
        const data = [];
        const labels = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const count = this.submissions.filter(sub => 
                sub.timestamp.startsWith(dateString)
            ).length;
            
            data.push(count);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        this.charts.submissions = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Submissions',
                    data: data,
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update top interests
     */
    updateTopInterests() {
        const interestCounts = {};
        this.submissions.forEach(sub => {
            sub.interests.forEach(interest => {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            });
        });
        
        const sortedInterests = Object.entries(interestCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const container = document.getElementById('topInterestsList');
        if (!container) return;
        
        container.innerHTML = sortedInterests.map(([interest, count]) => `
            <div class="interest-item">
                <span class="interest-name">${interest}</span>
                <span class="interest-count">${count}</span>
            </div>
        `).join('');
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to nav item
    const targetNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`).parentElement;
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
    
    // Update analytics if needed
    if (sectionName === 'analytics') {
        dashboard.updateAnalytics();
    }
}

function refreshData() {
    dashboard.refreshData();
}

function filterSubmissions() {
    const dateFilter = document.getElementById('dateFilter');
    const interestFilter = document.getElementById('interestFilter');
    const searchInput = document.getElementById('searchInput');
    
    dashboard.filters.date = dateFilter ? dateFilter.value : 'all';
    dashboard.filters.interest = interestFilter ? interestFilter.value : 'all';
    dashboard.filters.search = searchInput ? searchInput.value : '';
    
    dashboard.currentPage = 1;
    dashboard.renderSubmissions();
}

function sortTable(column) {
    if (dashboard.currentSort.column === column) {
        dashboard.currentSort.direction = dashboard.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        dashboard.currentSort.column = column;
        dashboard.currentSort.direction = 'asc';
    }
    
    dashboard.renderSubmissions();
}

function changePage(page) {
    dashboard.currentPage = page;
    dashboard.renderSubmissions();
}

function viewSubmission(id) {
    const submission = dashboard.submissions.find(sub => sub.id === id);
    if (!submission) return;
    
    const modal = document.getElementById('submissionModal');
    const details = document.getElementById('submissionDetails');
    
    if (modal && details) {
        details.innerHTML = `
            <div class="submission-detail">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> ${submission.name}</p>
                <p><strong>Email:</strong> ${submission.email}</p>
                <p><strong>Location:</strong> ${submission.location || 'Not specified'}</p>
            </div>
            
            <div class="submission-detail">
                <h4>Interests</h4>
                <div class="submission-interests">
                    ${submission.interests.map(interest => 
                        `<span class="interest-tag">${interest}</span>`
                    ).join('')}
                </div>
            </div>
            
            ${submission.hobbies ? `
                <div class="submission-detail">
                    <h4>Additional Hobbies</h4>
                    <p>${submission.hobbies}</p>
                </div>
            ` : ''}
            
            <div class="submission-detail">
                <h4>Technical Information</h4>
                <p><strong>Submitted:</strong> ${new Date(submission.timestamp).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${submission.ip}</p>
                <p><strong>User Agent:</strong> ${submission.userAgent}</p>
            </div>
        `;
        
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('submissionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function deleteSubmission(id) {
    if (confirm('Are you sure you want to delete this submission?')) {
        dashboard.submissions = dashboard.submissions.filter(sub => sub.id !== id);
        dashboard.saveSubmissions();
        dashboard.updateStats();
        dashboard.renderSubmissions();
    }
}

function exportSubmissions() {
    const csv = dashboard.generateCSV(dashboard.getFilteredSubmissions());
    dashboard.downloadCSV(csv, 'digital-hermit-submissions.csv');
}

function exportSubmissionsCSV() {
    const startDate = document.getElementById('exportStartDate');
    const endDate = document.getElementById('exportEndDate');
    
    let submissions = dashboard.submissions;
    
    if (startDate && startDate.value) {
        submissions = submissions.filter(sub => sub.timestamp >= startDate.value);
    }
    
    if (endDate && endDate.value) {
        submissions = submissions.filter(sub => sub.timestamp <= endDate.value);
    }
    
    const csv = dashboard.generateCSV(submissions);
    dashboard.downloadCSV(csv, 'digital-hermit-submissions.csv');
}

function exportAnalytics() {
    const analyticsData = {
        totalSubmissions: dashboard.submissions.length,
        dateRange: {
            start: new Date(Math.min(...dashboard.submissions.map(s => new Date(s.timestamp)))),
            end: new Date(Math.max(...dashboard.submissions.map(s => new Date(s.timestamp))))
        },
        topInterests: dashboard.getTopInterests(),
        submissionsByDay: dashboard.getSubmissionsByDay()
    };
    
    const json = JSON.stringify(analyticsData, null, 2);
    dashboard.downloadJSON(json, 'digital-hermit-analytics.json');
}

function clearOldData() {
    if (confirm('Are you sure you want to clear data older than 30 days?')) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        dashboard.submissions = dashboard.submissions.filter(sub => 
            new Date(sub.timestamp) > thirtyDaysAgo
        );
        dashboard.saveSubmissions();
        dashboard.updateStats();
        dashboard.renderSubmissions();
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
        if (confirm('This will delete all submissions. Are you absolutely sure?')) {
            dashboard.submissions = [];
            dashboard.saveSubmissions();
            dashboard.updateStats();
            dashboard.renderSubmissions();
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real application, this would clear the session
        window.location.href = '../index.html';
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new AdminDashboard();
});

// Add methods to AdminDashboard class
AdminDashboard.prototype.generateCSV = function(submissions) {
    const headers = ['Name', 'Email', 'Interests', 'Hobbies', 'Submitted', 'IP Address', 'Location'];
    const rows = submissions.map(sub => [
        sub.name,
        sub.email,
        sub.interests.join('; '),
        sub.hobbies || '',
        new Date(sub.timestamp).toLocaleString(),
        sub.ip,
        sub.location || ''
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
};

AdminDashboard.prototype.downloadCSV = function(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

AdminDashboard.prototype.downloadJSON = function(json, filename) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

AdminDashboard.prototype.getTopInterests = function() {
    const interestCounts = {};
    this.submissions.forEach(sub => {
        sub.interests.forEach(interest => {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
    });
    
    return Object.entries(interestCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
};

AdminDashboard.prototype.getSubmissionsByDay = function() {
    const dayCounts = {};
    this.submissions.forEach(sub => {
        const day = sub.timestamp.split('T')[0];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    return dayCounts;
};

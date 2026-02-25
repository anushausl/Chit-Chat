/* ============================================
   MESSAGE SEARCH & ADVANCED FILTERING
   ============================================ */

class MessageSearchEngine {
    constructor() {
        this.searchIndex = new Map(); // Quick search index
        this.filters = {
            keyword: '',
            sender: null,
            startDate: null,
            endDate: null,
            hasReactions: false,
            hasMedia: false,
            isPinned: false,
            isEdited: false
        };
        this.buildIndex();
    }

    // Build search index
    buildIndex() {
        if (typeof chatManager === 'undefined') return;

        chatManager.messages.forEach(msg => {
            const words = msg.content.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, []);
                }
                this.searchIndex.get(word).push(msg.id);
            });
        });
    }

    // Search messages
    search(query, options = {}) {
        if (!query && !this.hasActiveFilters(options || this.filters)) {
            return [];
        }

        let results = this.getAllMessages();

        // Apply keyword search
        if (query) {
            const keywords = query.toLowerCase().split(/\s+/);
            results = results.filter(msg => {
                return keywords.every(keyword =>
                    msg.content.toLowerCase().includes(keyword) ||
                    (msg.senderUsername && msg.senderUsername.toLowerCase().includes(keyword))
                );
            });
        }

        // Apply filters
        const activeFilters = options || this.filters;
        
        if (activeFilters.sender) {
            results = results.filter(msg => msg.senderId === activeFilters.sender);
        }

        if (activeFilters.startDate) {
            results = results.filter(msg => new Date(msg.timestamp) >= activeFilters.startDate);
        }

        if (activeFilters.endDate) {
            results = results.filter(msg => new Date(msg.timestamp) <= activeFilters.endDate);
        }

        if (activeFilters.hasReactions) {
            results = results.filter(msg => {
                const reactions = document.querySelector(`[data-message-id="${msg.id}"] .reaction-badge`);
                return reactions && reactions.length > 0;
            });
        }

        if (activeFilters.hasMedia) {
            results = results.filter(msg => msg.media && msg.media.length > 0);
        }

        if (activeFilters.isPinned) {
            results = results.filter(msg => msg.isPinned);
        }

        if (activeFilters.isEdited) {
            results = results.filter(msg => msg.isEdited);
        }

        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Get all messages
    getAllMessages() {
        if (typeof chatManager === 'undefined') return [];
        return chatManager.messages || [];
    }

    // Check if any filters are active
    hasActiveFilters(filters) {
        return filters && (
            filters.sender ||
            filters.startDate ||
            filters.endDate ||
            filters.hasReactions ||
            filters.hasMedia ||
            filters.isPinned ||
            filters.isEdited
        );
    }

    // Get advanced suggestions
    getSuggestions(query) {
        const suggestions = {
            keywords: [],
            senders: [],
            dates: [],
            filters: []
        };

        if (!query) return suggestions;

        const q = query.toLowerCase();

        // Keyword suggestions
        this.searchIndex.forEach((_, word) => {
            if (word.startsWith(q) && suggestions.keywords.length < 5) {
                suggestions.keywords.push(word);
            }
        });

        // Sender suggestions
        const users = chatManager?.allUsers || [];
        users.forEach(user => {
            if (user.username.toLowerCase().includes(q) && suggestions.senders.length < 3) {
                suggestions.senders.push(user);
            }
        });

        // Filter suggestions
        const commonFilters = ['has:reactions', 'has:media', 'is:pinned', 'is:edited'];
        commonFilters.forEach(filter => {
            if (filter.includes(q) && suggestions.filters.length < 3) {
                suggestions.filters.push(filter);
            }
        });

        return suggestions;
    }

    // Clear filters
    clearFilters() {
        this.filters = {
            keyword: '',
            sender: null,
            startDate: null,
            endDate: null,
            hasReactions: false,
            hasMedia: false,
            isPinned: false,
            isEdited: false
        };
    }

    // Save search
    saveSearch(name, query, filters) {
        const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        savedSearches.push({
            id: Date.now(),
            name,
            query,
            filters,
            createdAt: new Date()
        });
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        return savedSearches[savedSearches.length - 1];
    }

    // Get saved searches
    getSavedSearches() {
        return JSON.parse(localStorage.getItem('savedSearches') || '[]');
    }

    // Delete saved search
    deleteSavedSearch(id) {
        const savedSearches = this.getSavedSearches();
        const updated = savedSearches.filter(s => s.id !== id);
        localStorage.setItem('savedSearches', JSON.stringify(updated));
    }
}

// Initialize search engine
const messageSearchEngine = new MessageSearchEngine();

// ============================================
// SEARCH UI COMPONENT
// ============================================

class SearchUI {
    constructor() {
        this.searchContainer = null;
        this.isOpen = false;
        this.results = [];
    }

    // Create search panel
    createSearchPanel() {
        const panel = document.createElement('div');
        panel.className = 'search-panel';
        panel.innerHTML = `
            <div class="search-header">
                <div class="search-input-wrapper">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Search messages..."
                    >
                    <button class="search-clear-btn" title="Clear">✕</button>
                </div>
                <button class="search-filter-btn" title="Filters">⚙️</button>
                <button class="search-close-btn" title="Close">✕</button>
            </div>

            <div class="search-suggestions" id="search-suggestions"></div>

            <div class="search-filters">
                <div class="filter-group">
                    <label>Sender</label>
                    <select id="filter-sender" class="filter-select">
                        <option value="">All Users</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Date Range</label>
                    <input type="date" id="filter-start-date" class="filter-input">
                    <span>to</span>
                    <input type="date" id="filter-end-date" class="filter-input">
                </div>

                <div class="filter-group checkboxes">
                    <label><input type="checkbox" id="filter-reactions"> Has Reactions</label>
                    <label><input type="checkbox" id="filter-media"> Has Media</label>
                    <label><input type="checkbox" id="filter-pinned"> Pinned</label>
                    <label><input type="checkbox" id="filter-edited"> Edited</label>
                </div>

                <button class="btn btn-secondary" id="filter-apply">Apply Filters</button>
                <button class="btn btn-ghost" id="filter-clear">Clear Filters</button>
            </div>

            <div class="search-results" id="search-results"></div>

            <div class="search-saved-searches" id="saved-searches">
                <h4>Saved Searches</h4>
                <div id="saved-list"></div>
            </div>
        `;

        return panel;
    }

    // Toggle search panel
    toggleSearchPanel() {
        if (!this.searchContainer) {
            this.searchContainer = this.createSearchPanel();
            const chatSection = document.querySelector('.chat-section');
            if (chatSection) {
                chatSection.prepend(this.searchContainer);
            }
            this.attachEventListeners();
        }

        this.isOpen ?this.close() : this.open();
    }

    // Open search panel
    open() {
        if (this.searchContainer) {
            this.searchContainer.classList.add('active');
            this.isOpen = true;
            document.getElementById('search-input')?.focus();
        }
    }

    // Close search panel
    close() {
        if (this.searchContainer) {
            this.searchContainer.classList.remove('active');
            this.isOpen = false;
        }
    }

    // Attach event listeners
    attachEventListeners() {
        const searchInput = document.getElementById('search-input');
        const searchClearBtn = document.querySelector('.search-clear-btn');
        const searchCloseBtn = document.querySelector('.search-close-btn');
        const filterApplyBtn = document.getElementById('filter-apply');
        const filterClearBtn = document.getElementById('filter-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.onSearchInput(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.onSearchInput('');
            });
        }

        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', () => this.close());
        }

        if (filterApplyBtn) {
            filterApplyBtn.addEventListener('click', () => this.applyFilters());
        }

        if (filterClearBtn) {
            filterClearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Populate sender dropdown
        this.populateSenderDropdown();
        this.loadSavedSearches();
    }

    // On search input
    onSearchInput(value) {
        if (value.length < 2) {
            document.getElementById('search-suggestions').innerHTML = '';
            return;
        }

        const suggestions = messageSearchEngine.getSuggestions(value);
        const container = document.getElementById('search-suggestions');
        container.innerHTML = '';

        if (suggestions.keywords.length) {
            const section = document.createElement('div');
            section.className = 'suggestion-section';
            section.innerHTML = `<div class="suggestion-title">Keywords</div>`;
            suggestions.keywords.forEach(keyword => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = keyword;
                item.addEventListener('click', () => {
                    document.getElementById('search-input').value = keyword;
                    this.performSearch();
                });
                section.appendChild(item);
            });
            container.appendChild(section);
        }
    }

    // Perform search
    performSearch() {
        const query = document.getElementById('search-input').value;
        const results = messageSearchEngine.search(query);

        this.results = results;
        this.displayResults(results);
    }

    // Display results
    displayResults(results) {
        const container = document.getElementById('search-results');
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">No messages found</div>';
            return;
        }

        const heading = document.createElement('div');
        heading.className = 'search-results-heading';
        heading.textContent = `Found ${results.length} message${results.length !== 1 ? 's' : ''}`;
        container.appendChild(heading);

        results.slice(0, 50).forEach(msg => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-sender">${msg.senderUsername || 'Unknown'}</div>
                <div class="result-content">${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</div>
                <div class="result-time">${new Date(msg.timestamp).toLocaleString()}</div>
            `;
            item.addEventListener('click', () => this.scrollToMessage(msg.id));
            container.appendChild(item);
        });
    }

    // Scroll to message
    scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('search-highlight');
            setTimeout(() => messageElement.classList.remove('search-highlight'), 3000);
        }
    }

    // Populate sender dropdown
    populateSenderDropdown() {
        const select = document.getElementById('filter-sender');
        if (!select || !chatManager) return;

        const users = chatManager.allUsers || [];
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            select.appendChild(option);
        });
    }

    // Apply filters
    applyFilters() {
        const filters = {
            sender: document.getElementById('filter-sender')?.value || null,
            startDate: document.getElementById('filter-start-date')?.value ? new Date(document.getElementById('filter-start-date').value) : null,
            endDate: document.getElementById('filter-end-date')?.value ? new Date(document.getElementById('filter-end-date').value) : null,
            hasReactions: document.getElementById('filter-reactions')?.checked || false,
            hasMedia: document.getElementById('filter-media')?.checked || false,
            isPinned: document.getElementById('filter-pinned')?.checked || false,
            isEdited: document.getElementById('filter-edited')?.checked || false
        };

        const query = document.getElementById('search-input').value;
        const results = messageSearchEngine.search(query, filters);
        this.displayResults(results);
    }

    // Clear filters
    clearFilters() {
        document.getElementById('filter-sender').value = '';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        document.getElementById('filter-reactions').checked = false;
        document.getElementById('filter-media').checked = false;
        document.getElementById('filter-pinned').checked = false;
        document.getElementById('filter-edited').checked = false;

        messageSearchEngine.clearFilters();
        document.getElementById('search-results').innerHTML = '';
    }

    // Load saved searches
    loadSavedSearches() {
        const savedSearches = messageSearchEngine.getSavedSearches();
        const container = document.getElementById('saved-list');
        if (!container) return;

        container.innerHTML = '';
        savedSearches.forEach(search => {
            const item = document.createElement('div');
            item.className = 'saved-search-item';
            item.innerHTML = `
                <span class="search-name">${search.name}</span>
                <button class="btn-delete" title="Delete">🗑️</button>
            `;
            item.querySelector('.search-name').addEventListener('click', () => {
                document.getElementById('search-input').value = search.query;
                this.performSearch();
            });
            item.querySelector('.btn-delete').addEventListener('click', () => {
                messageSearchEngine.deleteSavedSearch(search.id);
                this.loadSavedSearches();
            });
            container.appendChild(item);
        });
    }
}

// Initialize search UI
const searchUI = new SearchUI();

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add search button to header
    const Header = document.querySelector('.chat-header');
    if (Header) {
        const searchBtn = document.createElement('button');
        searchBtn.className = 'btn btn-icon';
        searchBtn.innerHTML = '🔍';
        searchBtn.title = 'Search Messages';
        searchBtn.addEventListener('click', () => searchUI.toggleSearchPanel());
        Header.appendChild(searchBtn);
    }
});

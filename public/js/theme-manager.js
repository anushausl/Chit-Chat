/* ============================================
   CUSTOM THEME & CUSTOMIZATION SYSTEM
   ============================================ */

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.customThemes = new Map();
        this.loadThemes();
    }

    // Load themes from storage
    loadThemes() {
        const saved = localStorage.getItem('customThemes');
        if (saved) {
            try {
                const themes = JSON.parse(saved);
                themes.forEach(theme => {
                    this.customThemes.set(theme.name, theme);
                });
            } catch (e) {
                console.error('Error loading themes:', e);
            }
        }

        const savedTheme = localStorage.getItem('currentTheme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
        }
    }

    // Create custom theme
    createTheme(name, colors) {
        const theme = {
            name,
            colors: {
                primary: colors.primary || '#3498db',
                secondary: colors.secondary || '#9b59b6',
                success: colors.success || '#2ecc71',
                danger: colors.danger || '#e74c3c',
                warning: colors.warning || '#f39c12',
                background: colors.background || '#ffffff',
                text: colors.text || '#2c3e50',
                border: colors.border || '#ecf0f1',
                ...colors
            },
            createdAt: new Date()
        };

        this.customThemes.set(name, theme);
        this.saveThemes();
        return theme;
    }

    // Apply theme
    applyTheme(themeName) {
        const theme = this.customThemes.get(themeName);
        if (!theme) {
            // Apply preset theme
            document.documentElement.setAttribute('data-theme', themeName);
            return;
        }

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        this.currentTheme = themeName;
        localStorage.setItem('currentTheme', themeName);
    }

    // Get all themes
    getAllThemes() {
        return Array.from(this.customThemes.values());
    }

    // Delete theme
    deleteTheme(name) {
        this.customThemes.delete(name);
        this.saveThemes();
    }

    // Save themes
    saveThemes() {
        const themes = Array.from(this.customThemes.values());
        localStorage.setItem('customThemes', JSON.stringify(themes));
    }

    // Export theme
    exportTheme(name) {
        const theme = this.customThemes.get(name);
        if (!theme) return null;
        return JSON.stringify(theme, null, 2);
    }

    // Import theme
    importTheme(json) {
        try {
            const theme = JSON.parse(json);
            this.createTheme(theme.name, theme.colors);
            return true;
        } catch (e) {
            console.error('Error importing theme:', e);
            return false;
        }
    }

    // Get theme CSS
    getThemeCSS(theme) {
        const css = Object.entries(theme.colors)
            .map(([key, value]) => `--color-${key}: ${value};`)
            .join('\n');
        return css;
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// ============================================
// THEME CUSTOMIZER UI
// ============================================

class ThemeCustomizer {
    constructor() {
        this.customizer = null;
        this.isOpen = false;
    }

    // Create customizer panel
    createCustomizer() {
        const container = document.createElement('div');
        container.className = 'theme-customizer';
        container.innerHTML = `
            <div class="customizer-header">
                <h3>Theme Customizer</h3>
                <button class="btn-close-customizer" title="Close">✕</button>
            </div>

            <div class="customizer-content">
                <div class="customizer-section">
                    <h4>Preset Themes</h4>
                    <div class="preset-themes">
                        <button class="preset-btn" data-theme="light">☀️ Light</button>
                        <button class="preset-btn" data-theme="dark">🌙 Dark</button>
                        <button class="preset-btn" data-theme="auto">🎨 Auto</button>
                    </div>
                </div>

                <div class="customizer-section">
                    <h4>Color Customization</h4>
                    <div class="color-picker-group">
                        <div class="color-item">
                            <label for="color-primary">Primary Color</label>
                            <input type="color" id="color-primary" value="#3498db">
                        </div>
                        <div class="color-item">
                            <label for="color-secondary">Secondary Color</label>
                            <input type="color" id="color-secondary" value="#9b59b6">
                        </div>
                        <div class="color-item">
                            <label for="color-success">Success Color</label>
                            <input type="color" id="color-success" value="#2ecc71">
                        </div>
                        <div class="color-item">
                            <label for="color-danger">Danger Color</label>
                            <input type="color" id="color-danger" value="#e74c3c">
                        </div>
                        <div class="color-item">
                            <label for="color-warning">Warning Color</label>
                            <input type="color" id="color-warning" value="#f39c12">
                        </div>
                        <div class="color-item">
                            <label for="color-background">Background Color</label>
                            <input type="color" id="color-background" value="#ffffff">
                        </div>
                    </div>
                </div>

                <div class="customizer-section">
                    <h4>Theme Management</h4>
                    <div class="theme-management">
                        <input type="text" id="theme-name" placeholder="Enter theme name" class="theme-input">
                        <button class="btn btn-primary" id="btn-save-theme">Save Theme</button>
                    </div>
                    <div class="saved-themes-list" id="saved-themes-list"></div>
                </div>

                <div class="customizer-section">
                    <h4>Import/Export</h4>
                    <div class="import-export">
                        <button class="btn btn-secondary" id="btn-export-theme">Export Theme</button>
                        <button class="btn btn-secondary" id="btn-import-theme">Import Theme</button>
                        <input type="file" id="theme-file-input" accept=".json" style="display: none;">
                    </div>
                </div>

                <div class="color-preview">
                    <h4>Preview</h4>
                    <div class="preview-grid">
                        <div class="preview-box" style="background: var(--color-primary);">Primary</div>
                        <div class="preview-box" style="background: var(--color-secondary);">Secondary</div>
                        <div class="preview-box" style="background: var(--color-success);">Success</div>
                        <div class="preview-box" style="background: var(--color-danger);">Danger</div>
                        <div class="preview-box" style="background: var(--color-warning);">Warning</div>
                        <div class="preview-box" style="background: var(--color-background); color: #000; border: 1px solid #ccc;">Background</div>
                    </div>
                </div>
            </div>
        `;

        return container;
    }

    // Toggle customizer
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    // Open customizer
    open() {
        if (!this.customizer) {
            this.customizer = this.createCustomizer();
            document.body.appendChild(this.customizer);
            this.attachEventListeners();
        }

        this.customizer.classList.add('active');
        this.isOpen = true;
    }

    // Close customizer
    close() {
        if (this.customizer) {
            this.customizer.classList.remove('active');
            this.isOpen = false;
        }
    }

    // Attach event listeners
    attachEventListeners() {
        const closeBtn = this.customizer?.querySelector('.btn-close-customizer');
        const presetBtns = this.customizer?.querySelectorAll('.preset-btn');
        const saveThemeBtn = document.getElementById('btn-save-theme');
        const exportThemeBtn = document.getElementById('btn-export-theme');
        const importThemeBtn = document.getElementById('btn-import-theme');
        const themeFileInput = document.getElementById('theme-file-input');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        presetBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                if (theme !== 'auto') {
                    localStorage.setItem('currentTheme', theme);
                }
            });
        });

        // Color inputs
        ['primary', 'secondary', 'success', 'danger', 'warning', 'background'].forEach(color => {
            const input = document.getElementById(`color-${color}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    document.documentElement.style.setProperty(`--color-${color}`, e.target.value);
                });
            }
        });

        if (saveThemeBtn) {
            saveThemeBtn.addEventListener('click', () => this.saveCustomTheme());
        }

        if (exportThemeBtn) {
            exportThemeBtn.addEventListener('click', () => this.exportTheme());
        }

        if (importThemeBtn) {
            importThemeBtn.addEventListener('click', () => themeFileInput?.click());
        }

        if (themeFileInput) {
            themeFileInput.addEventListener('change', (e) => this.importTheme(e.target.files[0]));
        }

        this.loadSavedThemes();
    }

    // Save custom theme
    saveCustomTheme() {
        const name = document.getElementById('theme-name')?.value;
        if (!name) {
            notificationManager?.warning('Theme Name', 'Please enter a theme name');
            return;
        }

        const colors = {
            primary: document.getElementById('color-primary')?.value || '#3498db',
            secondary: document.getElementById('color-secondary')?.value || '#9b59b6',
            success: document.getElementById('color-success')?.value || '#2ecc71',
            danger: document.getElementById('color-danger')?.value || '#e74c3c',
            warning: document.getElementById('color-warning')?.value || '#f39c12',
            background: document.getElementById('color-background')?.value || '#ffffff'
        };

        themeManager.createTheme(name, colors);
        themeManager.applyTheme(name);
        document.getElementById('theme-name').value = '';
        this.loadSavedThemes();
        notificationManager?.success('Theme Saved', `Theme "${name}" created successfully`);
    }

    // Load saved themes
    loadSavedThemes() {
        const container = document.getElementById('saved-themes-list');
        if (!container) return;

        container.innerHTML = '';
        const themes = themeManager.getAllThemes();

        themes.forEach(theme => {
            const item = document.createElement('div');
            item.className = 'saved-theme-item';
            item.innerHTML = `
                <div class="theme-info">
                    <div class="theme-name">${theme.name}</div>
                    <div class="theme-colors">
                        ${Object.entries(theme.colors).slice(0, 3).map(([_, color]) => 
                            `<div class="color-dot" style="background: ${color};"></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="theme-actions">
                    <button class="btn-apply" title="Apply">✓</button>
                    <button class="btn-delete" title="Delete">🗑️</button>
                </div>
            `;

            item.querySelector('.btn-apply').addEventListener('click', () => {
                themeManager.applyTheme(theme.name);
                notificationManager?.success('Theme Applied', `Theme "${theme.name}" applied`);
            });

            item.querySelector('.btn-delete').addEventListener('click', () => {
                themeManager.deleteTheme(theme.name);
                this.loadSavedThemes();
                notificationManager?.info('Theme Deleted', `Theme "${theme.name}" removed`);
            });

            container.appendChild(item);
        });
    }

    // Export theme
    exportTheme() {
        const themeName = document.getElementById('theme-name')?.value || 'custom-theme';
        const colors = {
            primary: document.getElementById('color-primary')?.value || '#3498db',
            secondary: document.getElementById('color-secondary')?.value || '#9b59b6',
            success: document.getElementById('color-success')?.value || '#2ecc71',
            danger: document.getElementById('color-danger')?.value || '#e74c3c',
            warning: document.getElementById('color-warning')?.value || '#f39c12',
            background: document.getElementById('color-background')?.value || '#ffffff'
        };

        const theme = { name: themeName, colors };
        const json = JSON.stringify(theme, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${themeName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Import theme
    importTheme(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = themeManager.importTheme(e.target.result);
            if (success) {
                notificationManager?.success('Theme Imported', 'Theme imported successfully');
                this.loadSavedThemes();
            } else {
                notificationManager?.error('Import Error', 'Failed to import theme');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize theme customizer
const themeCustomizer = new ThemeCustomizer();

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add theme customizer button to settings
    const settingsModal = document.querySelector('.settings-panel');
    if (settingsModal) {
        const customizeBtn = document.createElement('button');
        customizeBtn.className = 'btn btn-primary';
        customizeBtn.innerHTML = '🎨 Customize Theme';
        customizeBtn.addEventListener('click', () => themeCustomizer.toggle());
        settingsModal.appendChild(customizeBtn);
    }

    // Apply auto theme based on system preference
    const savedTheme = localStorage.getItem('currentTheme');
    if (!savedTheme || savedTheme === 'auto') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
});

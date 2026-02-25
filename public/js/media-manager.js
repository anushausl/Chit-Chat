/* ============================================
   FILE SHARING & MEDIA SYSTEM
   ============================================ */

class MediaManager {
    constructor() {
        this.mediaCache = new Map(); // messageId -> media array
        this.uploadQueue = [];
        this.maxFileSize = 25 * 1024 * 1024; // 25MB
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg'
        ];
    }

    // Validate file
    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                error: `File too large. Max size: ${this.formatFileSize(this.maxFileSize)}`
            };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'File type not allowed'
            };
        }

        return { valid: true };
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Get file type icon
    getFileTypeIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word')) return '📝';
        return '📎';
    }

    // Create file preview
    createFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'media-preview';

        const icon = this.getFileTypeIcon(file.type);
        const size = this.formatFileSize(file.size);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                    <div class="preview-overlay">
                        <div class="preview-name">${file.name}</div>
                        <div class="preview-size">${size}</div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            preview.innerHTML = `
                <div class="media-thumbnail">
                    <span class="media-icon">🎥</span>
                </div>
                <div class="preview-info">
                    <div class="preview-name">${file.name}</div>
                    <div class="preview-size">${size}</div>
                </div>
            `;
        } else {
            preview.innerHTML = `
                <div class="media-thumbnail">
                    <span class="media-icon">${icon}</span>
                </div>
                <div class="preview-info">
                    <div class="preview-name">${file.name}</div>
                    <div class="preview-size">${size}</div>
                </div>
            `;
        }

        return preview;
    }

    // Add media to message
    addMediaToMessage(messageId, files) {
        const validFiles = [];
        
        for (let file of files) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                notificationManager?.error('File Error', validation.error);
            }
        }

        if (validFiles.length > 0) {
            this.mediaCache.set(messageId, validFiles);
            return validFiles;
        }
        return [];
    }

    // Get media for message
    getMedia(messageId) {
        return this.mediaCache.get(messageId) || [];
    }

    // Create media gallery
    createMediaGallery(messageId) {
        const media = this.getMedia(messageId);
        if (media.length === 0) return null;

        const gallery = document.createElement('div');
        gallery.className = 'media-gallery';

        media.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = index;

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    item.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}" class="gallery-image">
                        <div class="gallery-overlay">
                            <button class="btn-view" title="View">👁️</button>
                            <button class="btn-download" title="Download">⬇️</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                item.innerHTML = `
                    <div class="video-placeholder">
                        <span class="video-icon">🎥</span>
                    </div>
                    <div class="gallery-overlay">
                        <button class="btn-play" title="Play">▶️</button>
                        <button class="btn-download" title="Download">⬇️</button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div class="file-placeholder">
                        <span class="file-icon">${this.getFileTypeIcon(file.type)}</span>
                    </div>
                    <div class="file-name">${file.name}</div>
                    <div class="gallery-overlay">
                        <button class="btn-download" title="Download">⬇️</button>
                    </div>
                `;
            }

            gallery.appendChild(item);
        });

        return gallery;
    }

    // Create file input
    createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = this.allowedTypes.join(',');
        return input;
    }

    // Clear media
    clearMedia(messageId) {
        this.mediaCache.delete(messageId);
    }

    // Clear all media
    clearAllMedia() {
        this.mediaCache.clear();
    }
}

// Initialize media manager
const mediaManager = new MediaManager();

// ============================================
// AUDIO RECORDER
// ============================================

class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingTime = 0;
        this.recordingTimer = null;
    }

    // Check if browser supports recording
    supportsRecording() {
        return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    }

    // Start recording
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.recordingTime = 0;
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();

            // Start recording timer
            this.recordingTimer = setInterval(() => {
                this.recordingTime++;
                this.updateRecordingUI();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Recording error:', error);
            notificationManager?.error('Recording Error', 'Could not access microphone');
            return false;
        }
    }

    // Stop recording
    stopRecording() {
        if (!this.mediaRecorder) return null;

        this.isRecording = false;
        clearInterval(this.recordingTimer);

        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

                // Stop all tracks
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

                resolve(audioFile);
            };

            this.mediaRecorder.stop();
        });
    }

    // Update recording UI
    updateRecordingUI() {
        const seconds = this.recordingTime % 60;
        const minutes = Math.floor(this.recordingTime / 60);
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const recordingIndicator = document.querySelector('.recording-time');
        if (recordingIndicator) {
            recordingIndicator.textContent = timeStr;
        }
    }

    // Get recording duration
    getRecordingDuration() {
        return this.recordingTime;
    }

    // Format recording duration
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Initialize audio recorder
const audioRecorder = new AudioRecorder();

// ============================================
// SCREEN SHARE & SCREEN RECORDING
// ============================================

class ScreenShareManager {
    constructor() {
        this.screenStream = null;
        this.isSharing = false;
    }

    // Check support
    supportsScreenShare() {
        return navigator.mediaDevices && 
               (navigator.mediaDevices.getDisplayMedia || 
                navigator.mediaDevices.getUserMedia);
    }

    // Start screen share
    async startScreenShare() {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            this.isSharing = true;

            // Handle stop event
            this.screenStream.getTracks()[0].addEventListener('ended', () => {
                this.stopScreenShare();
            });

            return this.screenStream;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                notificationManager?.info('Screen Share', 'Cancelled');
            } else {
                notificationManager?.error('Screen Share Error', error.message);
            }
            return null;
        }
    }

    // Stop screen share
    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            this.isSharing = false;
        }
    }

    // Capture screenshot
    async captureScreenshot() {
        try {
            const canvas = await html2canvas(document.querySelector('.chat-messages'), {
                backgroundColor: '#ffffff',
                scale: 2
            });
            return canvas.toBlob((blob) => {
                const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
                return file;
            });
        } catch (error) {
            console.error('Screenshot error:', error);
            return null;
        }
    }
}

// Initialize screen share manager
const screenShareManager = new ScreenShareManager();

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add file input listener
    const chatInput = document.querySelector('.chat-input-box');
    if (chatInput) {
        chatInput.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            const files = [];

            for (let item of items) {
                if (item.kind === 'file') {
                    files.push(item.getAsFile());
                }
            }

            if (files.length > 0) {
                const preview = document.createElement('div');
                preview.className = 'paste-preview';
                files.forEach(file => {
                    preview.appendChild(mediaManager.createFilePreview(file));
                });
                chatInput.parentElement.appendChild(preview);
            }
        });
    }
});

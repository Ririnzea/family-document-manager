class DocumentManager {
    constructor() {
        this.currentUser = null;
        this.files = [];
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!AuthManager.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = AuthManager.getCurrentUser();
        this.loadUserFiles();
        this.bindEvents();
        this.renderFiles();
        this.updateUserInfo();
    }

    loadUserFiles() {
        // Load files specific to current user
        const userFilesKey = `adminFiles_${this.currentUser.id}`;
        this.files = JSON.parse(localStorage.getItem(userFilesKey)) || [];
    }

    updateUserInfo() {
        document.getElementById('userName').textContent = this.currentUser.fullName;
    }

    bindEvents() {
        // Upload form
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFileUpload();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterFiles();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.filterFiles();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                AuthManager.logout();
            }
        });
    }

    handleFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;

        if (!fileInput.files[0]) {
            alert('Silakan pilih berkas terlebih dahulu!');
            return;
        }

        const file = fileInput.files[0];
        
        // Create file reader to convert file to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                id: Date.now(),
                name: fileName,
                originalName: file.name,
                category: category,
                description: description,
                fileType: file.type,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                data: e.target.result // Base64 data
            };

            this.files.push(fileData);
            this.saveToStorage();
            this.renderFiles();
            this.resetForm();
            
            alert('Berkas berhasil diupload!');
        };

        reader.readAsDataURL(file);
    }

    saveToStorage() {
        // Save files specific to current user
        const userFilesKey = `adminFiles_${this.currentUser.id}`;
        localStorage.setItem(userFilesKey, JSON.stringify(this.files));
    }

    resetForm() {
        document.getElementById('uploadForm').reset();
    }

    renderFiles(filesToRender = this.files) {
        const filesList = document.getElementById('filesList');
        
        if (filesToRender.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <h3>Belum ada berkas tersimpan</h3>
                    <p>Upload berkas pertama Anda untuk memulai</p>
                </div>
            `;
            return;
        }

        filesList.innerHTML = filesToRender.map(file => `
            <div class="file-card" data-id="${file.id}">
                <div class="file-header">
                    <div class="file-icon">${this.getFileIcon(file.fileType)}</div>
                    <div class="file-info">
                        <h3>${file.name}</h3>
                        <span class="file-category">${this.getCategoryName(file.category)}</span>
                    </div>
                </div>
                
                ${file.description ? `<div class="file-description">${file.description}</div>` : ''}
                
                <div class="file-date">
                    Diupload: ${new Date(file.uploadDate).toLocaleDateString('id-ID')}
                </div>
                
                <div class="file-actions">
                    <button class="btn-secondary" onclick="documentManager.downloadFile(${file.id})">
                        📥 Download
                    </button>
                    <button class="btn-secondary" onclick="documentManager.viewFile(${file.id})">
                        👁️ Lihat
                    </button>
                    <button class="btn-secondary btn-danger" onclick="documentManager.deleteFile(${file.id})">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('text')) return '📃';
        return '📁';
    }

    getCategoryName(category) {
        const categories = {
            'ktp': 'KTP & Identitas',
            'kk': 'Kartu Keluarga',
            'akta': 'Akta Kelahiran',
            'ijazah': 'Ijazah & Sertifikat',
            'surat-kerja': 'Surat Kerja',
            'pajak': 'Dokumen Pajak',
            'asuransi': 'Asuransi',
            'properti': 'Dokumen Properti',
            'keuangan': 'Dokumen Keuangan',
            'lainnya': 'Lainnya'
        };
        return categories[category] || category;
    }

    filterFiles() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('filterCategory').value;

        let filteredFiles = this.files;

        // Filter by search term
        if (searchTerm) {
            filteredFiles = filteredFiles.filter(file => 
                file.name.toLowerCase().includes(searchTerm) ||
                file.description.toLowerCase().includes(searchTerm) ||
                this.getCategoryName(file.category).toLowerCase().includes(searchTerm)
            );
        }

        // Filter by category
        if (categoryFilter) {
            filteredFiles = filteredFiles.filter(file => file.category === categoryFilter);
        }

        this.renderFiles(filteredFiles);
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        // Create download link
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    viewFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        // Open file in new window
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head>
                    <title>${file.name}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        img { max-width: 100%; height: auto; }
                        .file-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="file-info">
                        <h2>${file.name}</h2>
                        <p><strong>Kategori:</strong> ${this.getCategoryName(file.category)}</p>
                        <p><strong>Deskripsi:</strong> ${file.description || 'Tidak ada deskripsi'}</p>
                        <p><strong>Tanggal Upload:</strong> ${new Date(file.uploadDate).toLocaleDateString('id-ID')}</p>
                    </div>
                    ${file.fileType.includes('image') ? 
                        `<img src="${file.data}" alt="${file.name}">` : 
                        `<iframe src="${file.data}" width="100%" height="600px"></iframe>`
                    }
                </body>
            </html>
        `);
    }

    deleteFile(fileId) {
        if (confirm('Apakah Anda yakin ingin menghapus berkas ini?')) {
            this.files = this.files.filter(f => f.id !== fileId);
            this.saveToStorage();
            this.renderFiles();
            alert('Berkas berhasil dihapus!');
        }
    }

    // Export all files as JSON backup
    exportData() {
        const dataStr = JSON.stringify(this.files, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `backup-berkas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import files from JSON backup
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedFiles = JSON.parse(e.target.result);
                if (confirm(`Import ${importedFiles.length} berkas? Data yang ada akan digabungkan.`)) {
                    this.files = [...this.files, ...importedFiles];
                    this.saveToStorage();
                    this.renderFiles();
                    alert('Data berhasil diimport!');
                }
            } catch (error) {
                alert('File backup tidak valid!');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
const documentManager = new DocumentManager();
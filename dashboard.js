class FamilyDocumentManager {
    constructor() {
        this.currentUser = null;
        this.familyMembers = [];
        this.documents = [];
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!AuthManager.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = AuthManager.getCurrentUser();
        this.loadData();
        this.bindEvents();
        this.updateUI();
        this.showSection('dashboard');
    }

    loadData() {
        // Load family members and documents for current user
        const userDataKey = `familyData_${this.currentUser.id}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey)) || {
            familyMembers: [],
            documents: []
        };
        
        this.familyMembers = userData.familyMembers;
        this.documents = userData.documents;
    }

    saveData() {
        const userDataKey = `familyData_${this.currentUser.id}`;
        const userData = {
            familyMembers: this.familyMembers,
            documents: this.documents
        };
        localStorage.setItem(userDataKey, JSON.stringify(userData));
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        // Logout
        document.getElementById('sidebarLogout').addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                AuthManager.logout();
            }
        });

        // Add family member
        document.getElementById('addFamilyBtn').addEventListener('click', () => {
            this.showFamilyModal();
        });

        // Add document
        document.getElementById('addDocumentBtn').addEventListener('click', () => {
            this.showDocumentModal();
        });

        // Family form
        document.getElementById('familyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFamilySubmit();
        });

        // Document form
        document.getElementById('documentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDocumentSubmit();
        });

        // Modal close events
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Search functionality
        document.getElementById('globalSearch').addEventListener('input', () => {
            this.performSearch();
        });

        document.getElementById('searchMemberFilter').addEventListener('change', () => {
            this.performSearch();
        });

        document.getElementById('searchCategoryFilter').addEventListener('change', () => {
            this.performSearch();
        });

        // Document filters
        document.getElementById('memberFilter').addEventListener('change', () => {
            this.filterDocuments();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterDocuments();
        });

        // Category cards click
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.querySelector('.category-count').dataset.category;
                this.showSection('documents');
                document.getElementById('categoryFilter').value = category;
                this.filterDocuments();
            });
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).parentElement.classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            family: 'Anggota Keluarga',
            documents: 'Kelola Berkas',
            categories: 'Kategori',
            search: 'Pencarian'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        this.currentSection = sectionName;
        this.updateSectionContent(sectionName);
    }

    updateSectionContent(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'family':
                this.renderFamilyList();
                break;
            case 'documents':
                this.renderDocuments();
                break;
            case 'categories':
                this.updateCategoryCounts();
                break;
            case 'search':
                this.updateSearchFilters();
                break;
        }
    }

    updateUI() {
        // Update user info
        document.getElementById('sidebarUserName').textContent = this.currentUser.fullName;
        
        // Update header stats
        document.getElementById('totalMembers').textContent = this.familyMembers.length;
        document.getElementById('totalFiles').textContent = this.documents.length;
    }

    updateDashboard() {
        // Update dashboard stats
        document.getElementById('dashTotalMembers').textContent = this.familyMembers.length;
        document.getElementById('dashTotalFiles').textContent = this.documents.length;
        
        const recentFiles = this.documents
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);
        document.getElementById('dashRecentFiles').textContent = recentFiles.length;

        // Update recent activity
        this.renderRecentActivity();
        
        // Update family overview
        this.renderFamilyOverview();
    }

    renderRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        const recentFiles = this.documents
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);

        if (recentFiles.length === 0) {
            recentActivity.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>Belum ada aktivitas</h3>
                    <p>Upload berkas pertama untuk melihat aktivitas</p>
                </div>
            `;
            return;
        }

        recentActivity.innerHTML = recentFiles.map(doc => {
            const member = this.familyMembers.find(m => m.id === doc.memberId);
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="activity-content">
                        <p><strong>${doc.name}</strong> diupload untuk ${member ? member.name : 'Unknown'}</p>
                        <small>${this.formatDate(doc.uploadDate)}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderFamilyOverview() {
        const familyOverview = document.getElementById('familyOverview');
        
        if (this.familyMembers.length === 0) {
            familyOverview.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Belum ada anggota keluarga</h3>
                    <p>Tambahkan anggota keluarga untuk memulai</p>
                </div>
            `;
            return;
        }

        familyOverview.innerHTML = this.familyMembers.slice(0, 4).map(member => `
            <div class="family-card">
                <div class="family-header">
                    <div class="family-avatar">
                        ${member.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="family-info">
                        <h4>${member.name}</h4>
                        <span class="family-relation">${this.getRelationName(member.relation)}</span>
                    </div>
                </div>
                <div class="family-details">
                    ${member.birthDate ? `Lahir: ${this.formatDate(member.birthDate)}` : ''}
                </div>
            </div>
        `).join('');
    }

    renderFamilyList() {
        const familyList = document.getElementById('familyList');
        
        if (this.familyMembers.length === 0) {
            familyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Belum ada anggota keluarga</h3>
                    <p>Klik tombol "Tambah Anggota" untuk menambahkan anggota keluarga pertama</p>
                </div>
            `;
            return;
        }

        familyList.innerHTML = this.familyMembers.map(member => {
            const memberDocs = this.documents.filter(doc => doc.memberId === member.id);
            return `
                <div class="family-card">
                    <div class="family-header">
                        <div class="family-avatar">
                            ${member.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="family-info">
                            <h4>${member.name}</h4>
                            <span class="family-relation">${this.getRelationName(member.relation)}</span>
                        </div>
                    </div>
                    <div class="family-details">
                        ${member.birthDate ? `Lahir: ${this.formatDate(member.birthDate)}<br>` : ''}
                        ${member.notes ? `Catatan: ${member.notes}<br>` : ''}
                        <strong>${memberDocs.length} berkas tersimpan</strong>
                    </div>
                    <div class="family-actions">
                        <button class="btn-secondary" onclick="familyManager.editFamilyMember(${member.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-secondary btn-danger" onclick="familyManager.deleteFamilyMember(${member.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDocuments() {
        this.updateDocumentFilters();
        this.filterDocuments();
    }

    updateDocumentFilters() {
        const memberFilter = document.getElementById('memberFilter');
        const docMemberSelect = document.getElementById('docMember');
        
        const memberOptions = this.familyMembers.map(member => 
            `<option value="${member.id}">${member.name}</option>`
        ).join('');
        
        memberFilter.innerHTML = '<option value="">Semua Anggota</option>' + memberOptions;
        docMemberSelect.innerHTML = '<option value="">Pilih Anggota</option>' + memberOptions;
    }

    filterDocuments() {
        const memberFilter = document.getElementById('memberFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let filteredDocs = this.documents;
        
        if (memberFilter) {
            filteredDocs = filteredDocs.filter(doc => doc.memberId == memberFilter);
        }
        
        if (categoryFilter) {
            filteredDocs = filteredDocs.filter(doc => doc.category === categoryFilter);
        }
        
        this.renderDocumentGrid(filteredDocs);
    }

    renderDocumentGrid(documents) {
        const documentsGrid = document.getElementById('documentsGrid');
        
        if (documents.length === 0) {
            documentsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file"></i>
                    <h3>Tidak ada berkas ditemukan</h3>
                    <p>Upload berkas atau ubah filter pencarian</p>
                </div>
            `;
            return;
        }

        documentsGrid.innerHTML = documents.map(doc => {
            const member = this.familyMembers.find(m => m.id === doc.memberId);
            return `
                <div class="document-card">
                    <div class="document-header">
                        <div class="document-icon">
                            ${this.getFileIcon(doc.fileType)}
                        </div>
                        <div class="document-info">
                            <h4>${doc.name}</h4>
                            <small>${this.formatDate(doc.uploadDate)}</small>
                        </div>
                    </div>
                    <div class="document-meta">
                        <span class="document-tag tag-member">${member ? member.name : 'Unknown'}</span>
                        <span class="document-tag tag-category">${this.getCategoryName(doc.category)}</span>
                    </div>
                    ${doc.description ? `<div class="document-description">${doc.description}</div>` : ''}
                    <div class="document-actions">
                        <button class="btn-secondary" onclick="familyManager.viewDocument(${doc.id})">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                        <button class="btn-secondary" onclick="familyManager.downloadDocument(${doc.id})">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn-secondary btn-danger" onclick="familyManager.deleteDocument(${doc.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateCategoryCounts() {
        const categories = ['ktp', 'kk', 'akta', 'ijazah', 'surat-kerja', 'pajak', 'asuransi', 'properti', 'keuangan', 'lainnya'];
        
        categories.forEach(category => {
            const count = this.documents.filter(doc => doc.category === category).length;
            const countElement = document.querySelector(`[data-category="${category}"]`);
            if (countElement) {
                countElement.textContent = `${count} berkas`;
            }
        });
    }

    updateSearchFilters() {
        const searchMemberFilter = document.getElementById('searchMemberFilter');
        const memberOptions = this.familyMembers.map(member => 
            `<option value="${member.id}">${member.name}</option>`
        ).join('');
        searchMemberFilter.innerHTML = '<option value="">Semua Anggota</option>' + memberOptions;
    }

    performSearch() {
        const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
        const memberFilter = document.getElementById('searchMemberFilter').value;
        const categoryFilter = document.getElementById('searchCategoryFilter').value;
        
        let results = this.documents;
        
        if (searchTerm) {
            results = results.filter(doc => 
                doc.name.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm) ||
                this.getCategoryName(doc.category).toLowerCase().includes(searchTerm)
            );
        }
        
        if (memberFilter) {
            results = results.filter(doc => doc.memberId == memberFilter);
        }
        
        if (categoryFilter) {
            results = results.filter(doc => doc.category === categoryFilter);
        }
        
        this.renderSearchResults(results);
    }

    renderSearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Tidak ada hasil ditemukan</h3>
                    <p>Coba ubah kata kunci atau filter pencarian</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(doc => {
            const member = this.familyMembers.find(m => m.id === doc.memberId);
            return `
                <div class="document-card">
                    <div class="document-header">
                        <div class="document-icon">
                            ${this.getFileIcon(doc.fileType)}
                        </div>
                        <div class="document-info">
                            <h4>${doc.name}</h4>
                            <small>${this.formatDate(doc.uploadDate)}</small>
                        </div>
                    </div>
                    <div class="document-meta">
                        <span class="document-tag tag-member">${member ? member.name : 'Unknown'}</span>
                        <span class="document-tag tag-category">${this.getCategoryName(doc.category)}</span>
                    </div>
                    ${doc.description ? `<div class="document-description">${doc.description}</div>` : ''}
                    <div class="document-actions">
                        <button class="btn-secondary" onclick="familyManager.viewDocument(${doc.id})">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                        <button class="btn-secondary" onclick="familyManager.downloadDocument(${doc.id})">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showFamilyModal(memberId = null) {
        const modal = document.getElementById('familyModal');
        const form = document.getElementById('familyForm');
        const title = document.getElementById('familyModalTitle');
        
        if (memberId) {
            const member = this.familyMembers.find(m => m.id === memberId);
            title.textContent = 'Edit Anggota Keluarga';
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberRelation').value = member.relation;
            document.getElementById('memberBirthDate').value = member.birthDate || '';
            document.getElementById('memberNotes').value = member.notes || '';
            form.dataset.editId = memberId;
        } else {
            title.textContent = 'Tambah Anggota Keluarga';
            form.reset();
            delete form.dataset.editId;
        }
        
        modal.classList.add('active');
    }

    showDocumentModal() {
        if (this.familyMembers.length === 0) {
            alert('Tambahkan anggota keluarga terlebih dahulu!');
            return;
        }
        
        const modal = document.getElementById('documentModal');
        modal.classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    handleFamilySubmit() {
        const form = document.getElementById('familyForm');
        const formData = new FormData(form);
        
        const memberData = {
            name: document.getElementById('memberName').value,
            relation: document.getElementById('memberRelation').value,
            birthDate: document.getElementById('memberBirthDate').value,
            notes: document.getElementById('memberNotes').value,
            createdAt: new Date().toISOString()
        };

        if (form.dataset.editId) {
            // Edit existing member
            const memberId = parseInt(form.dataset.editId);
            const memberIndex = this.familyMembers.findIndex(m => m.id === memberId);
            this.familyMembers[memberIndex] = { ...this.familyMembers[memberIndex], ...memberData };
        } else {
            // Add new member
            memberData.id = Date.now();
            this.familyMembers.push(memberData);
        }

        this.saveData();
        this.updateUI();
        this.closeModals();
        
        if (this.currentSection === 'family') {
            this.renderFamilyList();
        }
        
        alert('Anggota keluarga berhasil disimpan!');
    }

    handleDocumentSubmit() {
        const fileInput = document.getElementById('docFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Pilih berkas terlebih dahulu!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const documentData = {
                id: Date.now(),
                name: document.getElementById('docName').value,
                memberId: parseInt(document.getElementById('docMember').value),
                category: document.getElementById('docCategory').value,
                description: document.getElementById('docDescription').value,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                data: e.target.result
            };

            this.documents.push(documentData);
            this.saveData();
            this.updateUI();
            this.closeModals();
            
            if (this.currentSection === 'documents') {
                this.renderDocuments();
            }
            
            alert('Berkas berhasil diupload!');
        };

        reader.readAsDataURL(file);
    }

    editFamilyMember(memberId) {
        this.showFamilyModal(memberId);
    }

    deleteFamilyMember(memberId) {
        const member = this.familyMembers.find(m => m.id === memberId);
        const memberDocs = this.documents.filter(doc => doc.memberId === memberId);
        
        let confirmMessage = `Apakah Anda yakin ingin menghapus ${member.name}?`;
        if (memberDocs.length > 0) {
            confirmMessage += `\n\nPerhatian: ${memberDocs.length} berkas milik ${member.name} juga akan ikut terhapus!`;
        }
        
        if (confirm(confirmMessage)) {
            this.familyMembers = this.familyMembers.filter(m => m.id !== memberId);
            this.documents = this.documents.filter(doc => doc.memberId !== memberId);
            this.saveData();
            this.updateUI();
            this.renderFamilyList();
            alert('Anggota keluarga berhasil dihapus!');
        }
    }

    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        const member = this.familyMembers.find(m => m.id === doc.memberId);
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head>
                    <title>${doc.name}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        img { max-width: 100%; height: auto; }
                        .file-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="file-info">
                        <h2>${doc.name}</h2>
                        <p><strong>Anggota:</strong> ${member ? member.name : 'Unknown'}</p>
                        <p><strong>Kategori:</strong> ${this.getCategoryName(doc.category)}</p>
                        <p><strong>Deskripsi:</strong> ${doc.description || 'Tidak ada deskripsi'}</p>
                        <p><strong>Tanggal Upload:</strong> ${this.formatDate(doc.uploadDate)}</p>
                    </div>
                    ${doc.fileType.includes('image') ? 
                        `<img src="${doc.data}" alt="${doc.name}">` : 
                        `<iframe src="${doc.data}" width="100%" height="600px"></iframe>`
                    }
                </body>
            </html>
        `);
    }

    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    deleteDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        if (confirm(`Apakah Anda yakin ingin menghapus berkas "${doc.name}"?`)) {
            this.documents = this.documents.filter(d => d.id !== docId);
            this.saveData();
            this.updateUI();
            
            if (this.currentSection === 'documents') {
                this.filterDocuments();
            } else if (this.currentSection === 'search') {
                this.performSearch();
            }
            
            alert('Berkas berhasil dihapus!');
        }
    }

    // Utility functions
    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
        if (fileType.includes('image')) return '<i class="fas fa-file-image"></i>';
        if (fileType.includes('word') || fileType.includes('document')) return '<i class="fas fa-file-word"></i>';
        if (fileType.includes('text')) return '<i class="fas fa-file-alt"></i>';
        return '<i class="fas fa-file"></i>';
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

    getRelationName(relation) {
        const relations = {
            'suami': 'Suami',
            'istri': 'Istri',
            'ayah': 'Ayah',
            'ibu': 'Ibu',
            'anak': 'Anak',
            'kakek': 'Kakek',
            'nenek': 'Nenek',
            'saudara': 'Saudara',
            'lainnya': 'Lainnya'
        };
        return relations[relation] || relation;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID');
    }
}

// Initialize the family document manager
const familyManager = new FamilyDocumentManager();
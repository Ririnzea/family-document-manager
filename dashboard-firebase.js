import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where, 
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from './firebase-config.js';

class FirebaseFamilyDocumentManager {
    constructor() {
        this.currentUser = null;
        this.familyMembers = [];
        this.documents = [];
        this.currentSection = 'dashboard';
        this.unsubscribers = [];
        this.init();
    }

    init() {
        // Check authentication state
        onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                this.currentUser = user;
                this.loadData();
                this.bindEvents();
                this.updateUI();
                this.showSection('dashboard');
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    loadData() {
        if (!this.currentUser) return;

        // Real-time listeners for family members
        const familyQuery = query(
            collection(db, 'familyMembers'),
            where('userId', '==', this.currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubFamily = onSnapshot(familyQuery, (snapshot) => {
            this.familyMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateUI();
            this.updateSectionContent(this.currentSection);
        });

        // Real-time listeners for documents
        const documentsQuery = query(
            collection(db, 'documents'),
            where('userId', '==', this.currentUser.uid),
            orderBy('uploadDate', 'desc')
        );

        const unsubDocs = onSnapshot(documentsQuery, (snapshot) => {
            this.documents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateUI();
            this.updateSectionContent(this.currentSection);
        });

        this.unsubscribers.push(unsubFamily, unsubDocs);
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
        document.getElementById('sidebarLogout').addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                await FirebaseAuthManager.logout();
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

    async handleFamilySubmit() {
        const form = document.getElementById('familyForm');
        
        const memberData = {
            userId: this.currentUser.uid,
            name: document.getElementById('memberName').value,
            relation: document.getElementById('memberRelation').value,
            birthDate: document.getElementById('memberBirthDate').value || null,
            notes: document.getElementById('memberNotes').value,
            createdAt: new Date()
        };

        try {
            if (form.dataset.editId) {
                // Edit existing member
                const memberRef = doc(db, 'familyMembers', form.dataset.editId);
                await updateDoc(memberRef, memberData);
                this.showMessage('Anggota keluarga berhasil diperbarui!', 'success');
            } else {
                // Add new member
                await addDoc(collection(db, 'familyMembers'), memberData);
                this.showMessage('Anggota keluarga berhasil ditambahkan!', 'success');
            }

            this.closeModals();
        } catch (error) {
            console.error('Error saving family member:', error);
            this.showMessage('Terjadi kesalahan saat menyimpan data', 'error');
        }
    }

    async handleDocumentSubmit() {
        const fileInput = document.getElementById('docFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Pilih berkas terlebih dahulu!', 'error');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('Ukuran file maksimal 10MB!', 'error');
            return;
        }

        try {
            this.showMessage('Sedang mengupload berkas...', 'info');

            // Upload file to Firebase Storage
            const fileName = `${this.currentUser.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `documents/${fileName}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save document metadata to Firestore
            const documentData = {
                userId: this.currentUser.uid,
                name: document.getElementById('docName').value,
                familyMemberId: document.getElementById('docMember').value,
                category: document.getElementById('docCategory').value,
                description: document.getElementById('docDescription').value,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                downloadURL: downloadURL,
                storagePath: fileName,
                uploadDate: new Date()
            };

            await addDoc(collection(db, 'documents'), documentData);

            this.showMessage('Berkas berhasil diupload!', 'success');
            this.closeModals();

        } catch (error) {
            console.error('Error uploading document:', error);
            this.showMessage('Terjadi kesalahan saat mengupload berkas', 'error');
        }
    }

    async deleteFamilyMember(memberId) {
        const member = this.familyMembers.find(m => m.id === memberId);
        const memberDocs = this.documents.filter(doc => doc.familyMemberId === memberId);
        
        let confirmMessage = `Apakah Anda yakin ingin menghapus ${member.name}?`;
        if (memberDocs.length > 0) {
            confirmMessage += `\n\nPerhatian: ${memberDocs.length} berkas milik ${member.name} juga akan ikut terhapus!`;
        }
        
        if (confirm(confirmMessage)) {
            try {
                // Delete all documents of this member
                for (const doc of memberDocs) {
                    await this.deleteDocument(doc.id, false); // Don't show individual confirmations
                }

                // Delete family member
                await deleteDoc(doc(db, 'familyMembers', memberId));
                
                this.showMessage('Anggota keluarga berhasil dihapus!', 'success');
            } catch (error) {
                console.error('Error deleting family member:', error);
                this.showMessage('Terjadi kesalahan saat menghapus data', 'error');
            }
        }
    }

    async deleteDocument(docId, showConfirm = true) {
        const document = this.documents.find(d => d.id === docId);
        if (!document) return;

        if (showConfirm && !confirm(`Apakah Anda yakin ingin menghapus berkas "${document.name}"?`)) {
            return;
        }

        try {
            // Delete file from Storage
            if (document.storagePath) {
                const storageRef = ref(storage, `documents/${document.storagePath}`);
                await deleteObject(storageRef);
            }

            // Delete document metadata from Firestore
            await deleteDoc(doc(db, 'documents', docId));
            
            if (showConfirm) {
                this.showMessage('Berkas berhasil dihapus!', 'success');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            if (showConfirm) {
                this.showMessage('Terjadi kesalahan saat menghapus berkas', 'error');
            }
        }
    }

    downloadDocument(docId) {
        const document = this.documents.find(d => d.id === docId);
        if (!document) return;

        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = document.downloadURL;
        link.download = document.originalName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    viewDocument(docId) {
        const document = this.documents.find(d => d.id === docId);
        if (!document) return;

        // Open document in new window
        window.open(document.downloadURL, '_blank');
    }

    showMessage(text, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = text;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 9999;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;

        if (type === 'success') {
            messageEl.style.background = '#c6f6d5';
            messageEl.style.color = '#22543d';
            messageEl.style.border = '1px solid #9ae6b4';
        } else if (type === 'error') {
            messageEl.style.background = '#fed7d7';
            messageEl.style.color = '#742a2a';
            messageEl.style.border = '1px solid #fc8181';
        } else if (type === 'info') {
            messageEl.style.background = '#bee3f8';
            messageEl.style.color = '#2a4365';
            messageEl.style.border = '1px solid #90cdf4';
        }

        document.body.appendChild(messageEl);

        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // Copy other methods from dashboard.js (showSection, updateUI, etc.)
    // ... (keeping the same structure but using Firebase data)

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

    updateUI() {
        if (!this.currentUser) return;

        // Update user info
        document.getElementById('sidebarUserName').textContent = 
            this.currentUser.displayName || this.currentUser.email;
        
        // Update header stats
        document.getElementById('totalMembers').textContent = this.familyMembers.length;
        document.getElementById('totalFiles').textContent = this.documents.length;
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

    // Add other methods from dashboard.js...
    // (renderFamilyList, renderDocuments, etc.)

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
            this.showMessage('Tambahkan anggota keluarga terlebih dahulu!', 'error');
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

    // Utility methods
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

    // Cleanup when page unloads
    destroy() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
    }
}

// Initialize the Firebase family document manager
const firebaseFamilyManager = new FirebaseFamilyDocumentManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    firebaseFamilyManager.destroy();
});

// Export for global access
window.firebaseFamilyManager = firebaseFamilyManager;
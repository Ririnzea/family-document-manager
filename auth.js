class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Form switching
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
    }

    showRegisterForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.querySelector('.auth-switch').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.querySelector('.register-switch').classList.remove('hidden');
        this.clearMessage();
    }

    showLoginForm() {
        document.getElementById('registerForm').classList.add('hidden');
        document.querySelector('.register-switch').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        document.querySelector('.auth-switch').classList.remove('hidden');
        this.clearMessage();
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('Harap isi semua field!', 'error');
            return;
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username);

        if (!user) {
            this.showMessage('Username tidak ditemukan!', 'error');
            return;
        }

        // Simple password check (in real app, use proper hashing)
        if (user.password !== this.hashPassword(password)) {
            this.showMessage('Password salah!', 'error');
            return;
        }

        // Login successful
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        this.showMessage('Login berhasil! Mengalihkan...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value.trim();

        // Validation
        if (!username || !password || !confirmPassword || !fullName) {
            this.showMessage('Harap isi semua field!', 'error');
            return;
        }

        if (username.length < 3) {
            this.showMessage('Username minimal 3 karakter!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password minimal 6 karakter!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Password tidak cocok!', 'error');
            return;
        }

        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.username === username)) {
            this.showMessage('Username sudah digunakan!', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            password: this.hashPassword(password),
            fullName: fullName,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.showMessage('Registrasi berhasil! Silakan login.', 'success');
        
        // Clear form and switch to login
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            this.showLoginForm();
        }, 2000);
    }

    hashPassword(password) {
        // Simple hash function (in real app, use proper hashing like bcrypt)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    checkExistingSession() {
        const currentUser = localStorage.getItem('currentUser');
        const loginTime = localStorage.getItem('loginTime');
        
        if (currentUser && loginTime) {
            // Check if session is still valid (24 hours)
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                // Session still valid, redirect to main app
                window.location.href = 'dashboard.html';
                return;
            } else {
                // Session expired, clear it
                this.logout();
            }
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        this.currentUser = null;
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.classList.remove('hidden');
    }

    clearMessage() {
        const messageEl = document.getElementById('message');
        messageEl.classList.add('hidden');
    }

    // Static method to check if user is logged in (for other pages)
    static isLoggedIn() {
        const currentUser = localStorage.getItem('currentUser');
        const loginTime = localStorage.getItem('loginTime');
        
        if (!currentUser || !loginTime) return false;
        
        // Check if session is still valid (24 hours)
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        return hoursDiff < 24;
    }

    // Static method to get current user info
    static getCurrentUser() {
        if (AuthManager.isLoggedIn()) {
            return JSON.parse(localStorage.getItem('currentUser'));
        }
        return null;
    }

    // Static method to logout from any page
    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// Initialize auth manager
const authManager = new AuthManager();
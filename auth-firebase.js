import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config.js';

class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Form switching
        const showRegister = document.getElementById('showRegister');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
    }

    checkAuthState() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                // Redirect to dashboard if on login page
                if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
                    window.location.href = 'dashboard.html';
                }
            } else {
                this.currentUser = null;
                // Redirect to login if not on login page
                if (!window.location.pathname.includes('login.html') && window.location.pathname !== '/') {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    async handleLogin() {
        const email = document.getElementById('username').value.trim(); // Using email as username
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showMessage('Harap isi semua field!', 'error');
            return;
        }

        try {
            this.showMessage('Sedang login...', 'info');
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                this.showMessage('Silakan verifikasi email Anda terlebih dahulu!', 'error');
                await signOut(auth);
                return;
            }

            this.showMessage('Login berhasil! Mengalihkan...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Terjadi kesalahan saat login';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email tidak terdaftar';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password salah';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    async handleRegister() {
        const email = document.getElementById('regUsername').value.trim(); // Using email
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value.trim();

        // Validation
        if (!email || !password || !confirmPassword || !fullName) {
            this.showMessage('Harap isi semua field!', 'error');
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

        try {
            this.showMessage('Sedang mendaftar...', 'info');
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: fullName
            });

            // Save additional user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                fullName: fullName,
                createdAt: new Date(),
                role: 'user'
            });

            // Send email verification
            await sendEmailVerification(user);

            this.showMessage('Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
            
            // Sign out user until email is verified
            await signOut(auth);
            
            setTimeout(() => {
                this.showLoginForm();
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Terjadi kesalahan saat registrasi';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email sudah terdaftar';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password terlalu lemah';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
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

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `message ${type}`;
            messageEl.classList.remove('hidden');
        }
    }

    clearMessage() {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.classList.add('hidden');
        }
    }

    // Static methods for other pages
    static getCurrentUser() {
        return auth.currentUser;
    }

    static isLoggedIn() {
        return !!auth.currentUser;
    }

    static async logout() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize auth manager
const firebaseAuthManager = new FirebaseAuthManager();

// Export for use in other files
window.FirebaseAuthManager = FirebaseAuthManager;
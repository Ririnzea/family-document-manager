// Firebase Configuration
// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Demo Firebase Config - Ganti dengan config Anda
const firebaseConfig = {
    apiKey: "AIzaSyDemo-Replace-With-Your-Actual-Key",
    authDomain: "family-docs-demo.firebaseapp.com",
    projectId: "family-docs-demo",
    storageBucket: "family-docs-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};

// Check if config is still demo
const isDemoConfig = firebaseConfig.apiKey.includes('Demo');

if (isDemoConfig) {
    console.warn('🔥 Firebase: Menggunakan demo config. Silakan update firebase-config.js dengan config Firebase Anda yang sebenarnya.');
    
    // Show setup instructions
    const setupInstructions = `
    🔥 SETUP FIREBASE:
    
    1. Buka: https://console.firebase.google.com/
    2. Klik "Create a project" atau "Add project"
    3. Nama project: "family-document-manager"
    4. Aktifkan Authentication → Email/Password
    5. Buat Firestore Database (test mode)
    6. Aktifkan Storage
    7. Project Settings → Add Web App
    8. Copy config dan ganti di firebase-config.js
    
    Setelah setup, refresh halaman ini.
    `;
    
    // Create setup modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: monospace;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 600px;
        white-space: pre-line;
        text-align: left;
    `;
    
    content.innerHTML = `
        <h2 style="color: #ff6b35; margin-bottom: 1rem;">🔥 Firebase Setup Required</h2>
        <pre style="background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto;">${setupInstructions}</pre>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: #4285f4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
        ">OK, Saya Mengerti</button>
        <button onclick="window.open('https://console.firebase.google.com/', '_blank')" style="
            background: #34a853;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
            margin-left: 10px;
        ">Buka Firebase Console</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Initialize Firebase
let app, auth, db, storage;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    if (!isDemoConfig) {
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Firebase setup error. Please check your configuration.');
}

export { auth, db, storage };
export default app;
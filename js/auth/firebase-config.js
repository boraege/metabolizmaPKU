// Firebase Configuration
// Import Firebase modules from CDN (we'll use CDN instead of npm for GitHub Pages)

const firebaseConfig = {
    apiKey: "AIzaSyAZnRBfqjgZzy3NWGCvJH9wNmYXCq2lhgs",
    authDomain: "metabolizmapku.firebaseapp.com",
    projectId: "metabolizmapku",
    storageBucket: "metabolizmapku.firebasestorage.app",
    messagingSenderId: "872140676264",
    appId: "1:872140676264:web:b05cb328150e28d1db769d",
    measurementId: "G-1K5N0CZQGC"
};

// Initialize Firebase (will be done after Firebase SDK loads)
let app;
let auth;
let db;
let analytics;

function initializeFirebase() {
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Analytics is optional
        if (typeof firebase.analytics !== 'undefined') {
            analytics = firebase.analytics();
        }
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;

// Authentication Manager
// Handles user registration, login, logout, and session management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onAuthStateChangedCallback = null;
    }

    // Initialize auth state listener
    init() {
        firebase.auth().onAuthStateChanged((user) => {
            this.currentUser = user;
            
            if (user) {
                console.log('✅ User logged in:', user.email);
                this.onUserLoggedIn(user);
            } else {
                console.log('❌ User logged out');
                this.onUserLoggedOut();
            }

            // Call custom callback if set
            if (this.onAuthStateChangedCallback) {
                this.onAuthStateChangedCallback(user);
            }
        });
    }

    // Register new user
    async register(email, password, displayName) {
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile with display name
            await user.updateProfile({
                displayName: displayName
            });

            // Create user document in Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                email: email,
                displayName: displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'dietitian',
                termsAccepted: true,
                termsAcceptedDate: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ User registered successfully:', email);
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Login user
    async login(email, password, rememberMe = false) {
        try {
            // Set persistence
            const persistence = rememberMe 
                ? firebase.auth.Auth.Persistence.LOCAL 
                : firebase.auth.Auth.Persistence.SESSION;
            
            await firebase.auth().setPersistence(persistence);
            
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('✅ User logged in successfully:', email);
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Login with Google
    async loginWithGoogle(createIfNew = true) {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            const userCredential = await firebase.auth().signInWithPopup(provider);
            const user = userCredential.user;

            // Check if this is a new user
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            
            const isNewUser = !userDoc.exists;
            
            if (isNewUser && createIfNew) {
                // Create user document for new Google users (only from register page)
                await firebase.firestore().collection('users').doc(user.uid).set({
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'dietitian',
                    provider: 'google',
                    termsAccepted: true,
                    termsAcceptedDate: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            console.log('✅ User logged in with Google:', user.email);
            return { success: true, user: user, isNewUser: isNewUser };
        } catch (error) {
            console.error('❌ Google login error:', error);
            
            // Handle popup closed by user
            if (error.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Giriş penceresi kapatıldı.' };
            }
            
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Logout user
    async logout() {
        try {
            await firebase.auth().signOut();
            console.log('✅ User logged out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            console.log('✅ Password reset email sent to:', email);
            return { success: true };
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user display name
    getUserDisplayName() {
        return this.currentUser?.displayName || this.currentUser?.email || 'Kullanıcı';
    }

    // Called when user logs in
    async onUserLoggedIn(user) {
        // Check if user exists in Firestore before redirecting
        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            
            // Only redirect if user exists in Firestore
            if (userDoc.exists) {
                // Redirect to main app if on login page
                if (window.location.pathname.includes('login.html') || 
                    window.location.pathname.includes('register.html')) {
                    window.location.href = 'app.html';
                }
            } else {
                // User not in Firestore, don't redirect
                console.log('⚠️ User authenticated but not registered in Firestore');
            }
        } catch (error) {
            console.error('❌ Error checking user in Firestore:', error);
        }
    }

    // Called when user logs out
    onUserLoggedOut() {
        // Redirect to login if on protected pages
        if (window.location.pathname.includes('app.html') ||
            window.location.pathname.includes('patients.html') ||
            window.location.pathname.includes('patient-detail.html')) {
            window.location.href = 'login.html';
        }
    }

    // Get user-friendly error messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.',
            'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor.',
            'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter olmalıdır.',
            'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
            'auth/user-not-found': 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.',
            'auth/wrong-password': 'Hatalı şifre.',
            'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
            'auth/network-request-failed': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.'
        };

        return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
}

// Create global instance
window.authManager = new AuthManager();

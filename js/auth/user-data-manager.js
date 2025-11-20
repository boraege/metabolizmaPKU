// User Data Manager
// Handles saving and loading user data to/from Firestore

class UserDataManager {
    constructor() {
        this.userId = null;
        this.userDataCache = null;
    }

    // Set current user
    setUser(userId) {
        this.userId = userId;
        this.userDataCache = null;
    }

    // Save patient calculation to Firestore
    async saveCalculation(calculationData) {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            const docRef = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('calculations')
                .add({
                    ...calculationData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('✅ Calculation saved:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Error saving calculation:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all calculations for current user
    async getCalculations(limit = 50) {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('calculations')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const calculations = [];
            snapshot.forEach(doc => {
                calculations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${calculations.length} calculations`);
            return { success: true, data: calculations };
        } catch (error) {
            console.error('❌ Error loading calculations:', error);
            return { success: false, error: error.message };
        }
    }

    // Update existing calculation
    async updateCalculation(calculationId, calculationData) {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('calculations')
                .doc(calculationId)
                .update({
                    ...calculationData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('✅ Calculation updated:', calculationId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating calculation:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete calculation
    async deleteCalculation(calculationId) {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('calculations')
                .doc(calculationId)
                .delete();

            console.log('✅ Calculation deleted:', calculationId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting calculation:', error);
            return { success: false, error: error.message };
        }
    }

    // Save user preferences
    async savePreferences(preferences) {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .update({
                    preferences: preferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('✅ Preferences saved');
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user preferences
    async getPreferences() {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .get();

            if (doc.exists) {
                const preferences = doc.data().preferences || {};
                console.log('✅ Preferences loaded');
                return { success: true, data: preferences };
            } else {
                return { success: true, data: {} };
            }
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            return { success: false, error: error.message };
        }
    }

    // Migrate localStorage data to Firestore (one-time migration)
    async migrateLocalStorageData() {
        if (!this.userId) {
            console.error('❌ No user logged in');
            return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        try {
            // Get history from localStorage
            const historyData = localStorage.getItem('calculationHistory');
            if (!historyData) {
                console.log('ℹ️ No localStorage data to migrate');
                return { success: true, migrated: 0 };
            }

            const history = JSON.parse(historyData);
            let migratedCount = 0;

            // Save each history item to Firestore
            for (const item of history) {
                await this.saveCalculation(item);
                migratedCount++;
            }

            console.log(`✅ Migrated ${migratedCount} items from localStorage`);
            
            // Optionally clear localStorage after migration
            // localStorage.removeItem('calculationHistory');
            
            return { success: true, migrated: migratedCount };
        } catch (error) {
            console.error('❌ Error migrating data:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.userDataManager = new UserDataManager();

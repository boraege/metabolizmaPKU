// Patient Management System
class PatientManager {
    constructor() {
        this.db = null;
        this.currentUserId = null;
    }

    init(userId) {
        this.db = firebase.firestore();
        this.currentUserId = userId;
        console.log('✅ PatientManager başlatıldı:', userId);
    }

    // Yeni hasta ekle
    async addPatient(patientData) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        const patientRef = this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc();

        const patient = {
            id: patientRef.id,
            name: patientData.name,
            birthDate: patientData.birthDate,
            gender: patientData.gender,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await patientRef.set(patient);
        console.log('✅ Hasta eklendi:', patient.id);
        return patient;
    }

    // Hastaya ölçüm ekle
    async addMeasurement(patientId, measurementData) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        const measurementRef = this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .collection('measurements').doc();

        // Clean data - remove undefined values
        const cleanCalculations = {};
        if (measurementData.calculations) {
            Object.keys(measurementData.calculations).forEach(key => {
                const value = measurementData.calculations[key];
                cleanCalculations[key] = (value !== undefined && value !== null) ? value : 0;
            });
        }

        const measurement = {
            id: measurementRef.id,
            date: measurementData.date || new Date().toISOString(),
            height: measurementData.height || 0,
            weight: measurementData.weight || 0,
            percentileSource: measurementData.percentileSource || 'manual',
            percentileData: measurementData.percentileData || {},
            calculations: cleanCalculations,
            dailyIntake: measurementData.dailyIntake || [],
            mealPlan: measurementData.mealPlan || [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await measurementRef.set(measurement);

        // Hastanın son güncelleme tarihini güncelle
        await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMeasurement: {
                    date: measurement.date,
                    height: measurement.height,
                    weight: measurement.weight
                }
            });

        console.log('✅ Ölçüm eklendi:', measurement.id);
        return measurement;
    }

    // Tüm hastaları getir
    async getAllPatients() {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        const snapshot = await this.db.collection('users').doc(this.currentUserId)
            .collection('patients')
            .orderBy('updatedAt', 'desc')
            .get();

        const patients = [];
        snapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ ${patients.length} hasta getirildi`);
        return patients;
    }

    // Tek hasta getir
    async getPatient(patientId) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        const doc = await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .get();

        if (!doc.exists) {
            throw new Error('Hasta bulunamadı');
        }

        return { id: doc.id, ...doc.data() };
    }

    // Hastanın tüm ölçümlerini getir
    async getPatientMeasurements(patientId) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        const snapshot = await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .collection('measurements')
            .orderBy('date', 'desc')
            .get();

        const measurements = [];
        snapshot.forEach(doc => {
            measurements.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ ${measurements.length} ölçüm getirildi`);
        return measurements;
    }

    // Hasta güncelle
    async updatePatient(patientId, updates) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        console.log('✅ Hasta güncellendi:', patientId);
    }

    // Hasta sil
    async deletePatient(patientId) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        // Önce tüm ölçümleri sil
        const measurements = await this.getPatientMeasurements(patientId);
        const batch = this.db.batch();

        measurements.forEach(measurement => {
            const ref = this.db.collection('users').doc(this.currentUserId)
                .collection('patients').doc(patientId)
                .collection('measurements').doc(measurement.id);
            batch.delete(ref);
        });

        await batch.commit();

        // Sonra hastayı sil
        await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .delete();

        console.log('✅ Hasta silindi:', patientId);
    }

    // Ölçüm sil
    async deleteMeasurement(patientId, measurementId) {
        if (!this.currentUserId) throw new Error('Kullanıcı girişi yapılmamış');

        await this.db.collection('users').doc(this.currentUserId)
            .collection('patients').doc(patientId)
            .collection('measurements').doc(measurementId)
            .delete();

        console.log('✅ Ölçüm silindi:', measurementId);
    }
}

// Global instance
const patientManager = new PatientManager();

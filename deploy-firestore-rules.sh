#!/bin/bash

# Firestore Security Rules Deployment Script

echo "🔥 Firestore güvenlik kuralları deploy ediliyor..."
echo ""
echo "⚠️  Bu script'i çalıştırmadan önce:"
echo "1. Firebase CLI'nin yüklü olduğundan emin olun: npm install -g firebase-tools"
echo "2. Firebase'e giriş yapın: firebase login"
echo "3. Projenizi seçin: firebase use --add"
echo ""
echo "Devam etmek için ENTER'a basın, iptal için Ctrl+C..."
read

# Deploy firestore rules
firebase deploy --only firestore:rules

echo ""
echo "✅ Firestore güvenlik kuralları başarıyla deploy edildi!"
echo ""
echo "📋 Yeni kurallar:"
echo "- Kullanıcılar sadece kendi verilerine erişebilir"
echo "- Hasta kayıtları ve ölçümler korunur"
echo "- Kimlik doğrulaması zorunludur"

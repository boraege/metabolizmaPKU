#!/bin/bash

# Metabolizma Hesaplayıcı - Başlatma Scripti

echo "🚀 Metabolizma Hesaplayıcı Başlatılıyor..."
echo ""

# Port kontrolü
PORT=8000

# Port kullanımda mı kontrol et
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT zaten kullanımda!"
    echo "💡 Farklı port deneyin veya mevcut sunucuyu kapatın"
    echo ""
    read -p "Farklı port kullanmak ister misiniz? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PORT=8001
        echo "✅ Port $PORT kullanılacak"
    else
        exit 1
    fi
fi

# Python kontrolü
if command -v python3 &> /dev/null; then
    echo "✅ Python3 bulundu"
    echo "🌐 Sunucu başlatılıyor: http://localhost:$PORT"
    echo ""
    echo "📖 Tarayıcınızda açın: http://localhost:$PORT/index.html"
    echo ""
    echo "⏹️  Durdurmak için: Ctrl + C"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Tarayıcıda otomatik aç (macOS)
    sleep 2
    open "http://localhost:$PORT/index.html" 2>/dev/null || true
    
    # Sunucuyu başlat
    python3 -m http.server $PORT
    
elif command -v python &> /dev/null; then
    echo "✅ Python bulundu"
    echo "🌐 Sunucu başlatılıyor: http://localhost:$PORT"
    echo ""
    echo "📖 Tarayıcınızda açın: http://localhost:$PORT/index.html"
    echo ""
    echo "⏹️  Durdurmak için: Ctrl + C"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Tarayıcıda otomatik aç (macOS)
    sleep 2
    open "http://localhost:$PORT/index.html" 2>/dev/null || true
    
    # Sunucuyu başlat
    python -m SimpleHTTPServer $PORT
    
else
    echo "❌ Python bulunamadı!"
    echo ""
    echo "Python yüklemek için:"
    echo "  brew install python3"
    echo ""
    echo "Veya manuel olarak başlatın:"
    echo "  1. Terminal'de proje klasörüne gidin"
    echo "  2. Şu komutu çalıştırın: python3 -m http.server 8000"
    echo "  3. Tarayıcıda açın: http://localhost:8000/index.html"
    exit 1
fi

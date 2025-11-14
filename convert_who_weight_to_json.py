#!/usr/bin/env python3
"""
WHO Ağırlık Persentil Tablolarını JSON'a Çevirme
Excel dosyalarını okuyup JSON formatına çevirir
"""

import json
import sys

try:
    import openpyxl
except ImportError:
    print("❌ openpyxl modülü bulunamadı. Yükleniyor...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl"])
    import openpyxl

def excel_to_json(excel_file, output_file):
    """Excel dosyasını JSON'a çevir"""
    print(f"📖 Okunuyor: {excel_file}")
    
    try:
        # Excel dosyasını aç
        wb = openpyxl.load_workbook(excel_file)
        sheet = wb.active
        
        # Başlıkları al (ilk satır)
        headers = []
        for cell in sheet[1]:
            if cell.value:
                headers.append(str(cell.value).strip())
        
        print(f"📋 Sütunlar: {headers}")
        
        # Verileri oku
        data = []
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if row[0] is None:  # Boş satır
                continue
                
            row_data = {}
            for i, value in enumerate(row):
                if i < len(headers):
                    # Sayısal değerleri float'a çevir
                    if isinstance(value, (int, float)):
                        row_data[headers[i]] = float(value)
                    elif value is not None:
                        row_data[headers[i]] = value
            
            if row_data:
                data.append(row_data)
        
        # JSON'a kaydet
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Kaydedildi: {output_file} ({len(data)} kayıt)")
        return True
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False

if __name__ == "__main__":
    print("🔄 WHO Ağırlık Persentil Tabloları JSON'a Çevriliyor...\n")
    
    # Erkek ağırlık tablosu
    success1 = excel_to_json(
        "tablolar/ağırlık erkek who persentil tablosu .xlsx",
        "boys_who_weight_data.json"
    )
    
    print()
    
    # Kız ağırlık tablosu
    success2 = excel_to_json(
        "tablolar/ağırlık kız who persentil tablosu .xlsx.xlsx",
        "girls_who_weight_data.json"
    )
    
    print("\n" + "="*50)
    if success1 and success2:
        print("✅ Tüm dosyalar başarıyla dönüştürüldü!")
    else:
        print("⚠️ Bazı dosyalar dönüştürülemedi.")

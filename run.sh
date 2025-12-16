#!/bin/bash

# ============================================================
# SCRIPT UNTUK MENJALANKAN SISTEM DETEKSI HAMA
# ============================================================

# 1. Pindah ke direktori tempat script ini berada
# (Ini memastikan script jalan lancar meski dipanggil dari folder lain)
cd "$(dirname "$0")"

echo "=========================================="
echo "🌶️  SISTEM DETEKSI HAMA CABAI LAUNCHER"
echo "=========================================="

# 2. Cek apakah folder 'venv' sudah ada?
if [ -d "venv" ]; then
    echo "✅ Virtual Environment ditemukan."
    echo "   Mengaktifkan venv..."
    source venv/bin/activate
else
    echo "⚠️  Virtual Environment (venv) TIDAK ditemukan!"
    echo "⚙️  Sedang membuat venv baru..."
    python3 -m venv venv
    
    echo "   Mengaktifkan venv..."
    source venv/bin/activate

    echo "📦 Menginstall library yang dibutuhkan..."
    pip install flask pandas numpy scikit-learn joblib
    
    echo "✅ Instalasi selesai!"
fi

# 3. Cek apakah model .pkl sudah ada?
if [ ! -f "model_hama.pkl" ]; then
    echo "⚠️  File model 'model_hama.pkl' tidak ditemukan!"
    echo "⚙️  Menjalankan training model dulu..."
    
    # Cek apakah ada script training, jika ada jalankan
    if [ -f "train_model.py" ]; then
        python train_model.py
    else
        echo "❌ Error: File 'train_model.py' juga tidak ada."
        echo "   Pastikan Anda memiliki file training."
        exit 1
    fi
fi

# 4. Jalankan Aplikasi Flask
echo "🚀 Menjalankan Server Flask..."
echo "   Buka browser di: http://127.0.0.1:5000"
echo "   (Tekan CTRL+C untuk berhenti)"
echo "=========================================="

python app.py
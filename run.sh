#!/bin/bash

# Masuk ke folder script
cd "$(dirname "$0")"

echo "=========================================="
echo "🌶️  SISTEM DETEKSI HAMA (MODE CSV)"
echo "=========================================="

# 1. Cek Venv
if [ ! -d "venv" ]; then
    echo "⚙️  Membuat Virtual Environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# 2. Install Library (Pastikan pandas support csv)
pip install flask pandas numpy scikit-learn joblib

# 3. LOGIKA TRAINING (Cek CSV)
if [ -f "dataset.csv" ]; then
    echo "------------------------------------------"
    echo "📊 Ditemukan 'dataset.csv'. Melakukan Training..."
    
    if [ -f "train_csv.py" ]; then
        python train_csv.py
        
        if [ $? -ne 0 ]; then
            echo "❌ Training Gagal!"
            exit 1
        fi
    else
        echo "⚠️  File 'train_csv.py' tidak ditemukan!"
    fi
    
elif [ ! -f "model_hama.pkl" ]; then
    echo "❌ Error: Tidak ada dataset.csv dan tidak ada model_hama.pkl"
    exit 1
fi

# 4. Jalankan Server
echo "------------------------------------------"
echo "🚀 Menjalankan Server..."
echo "   http://127.0.0.1:5000"
echo "=========================================="

python app.py

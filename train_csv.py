import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, log_loss
import joblib
import sys
import os

# Konfigurasi File
FILE_DATASET = 'dataset.csv' # Pastikan nama file CSV Anda ini
FILE_MODEL = 'model_hama.pkl'

def train_model():
    print("="*50)
    print("🚀 TRAINING MODEL DARI CSV (Hama_Score 0-100)")
    print("="*50)

    # 1. CEK FILE
    if not os.path.exists(FILE_DATASET):
        print(f"❌ Error: File '{FILE_DATASET}' tidak ditemukan!")
        sys.exit(1)

    try:
        # 2. LOAD CSV
        df = pd.read_csv(FILE_DATASET)
        
        # Bersihkan nama kolom (hapus spasi yang tidak sengaja)
        df.columns = df.columns.str.strip()
        
        # Cek Header
        required = ['suara_dB', 'getaran_ms2', 'kelembaban_persen', 'Hama_Score']
        if not all(col in df.columns for col in required):
            print(f"❌ Header CSV salah! Harusnya: {required}")
            print(f"   Yang ditemukan: {list(df.columns)}")
            sys.exit(1)
            
        print(f"📂 Dataset dimuat: {len(df)} baris data.")

    except Exception as e:
        print(f"❌ Gagal membaca CSV: {e}")
        sys.exit(1)

    # 3. PREPROCESSING
    X = df[['suara_dB', 'getaran_ms2', 'kelembaban_persen']]
    
    # KONVERSI SKOR KE LABEL BINER
    # Skor 0-49  = 0 (Aman)
    # Skor 50-100 = 1 (Hama)
    # AI akan belajar polanya, dan nanti outputnya tetap berupa probabilitas %
    y = df['Hama_Score'].apply(lambda x: 1 if x >= 50 else 0)

    # 4. SPLIT DATA (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 5. TRAINING
    print("🧠 Sedang melatih Random Forest...")
    model = RandomForestClassifier(n_estimators=300, max_depth=15, random_state=42)
    model.fit(X_train, y_train)

    # 6. EVALUASI (TAMPILKAN KE TERMINAL)
    print("\n📊 HASIL EVALUASI MODEL:")
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred) * 100
    loss = log_loss(y_test, y_prob)

    print("-" * 30)
    print(f"✅ AKURASI (Accuracy) : {acc:.2f}%")
    print(f"📉 LOSS (Error Rate)  : {loss:.4f}")
    print("-" * 30)

    if acc < 80:
        print("⚠️  Akurasi masih di bawah 80%. Coba perbanyak data dataset.csv")

    # 7. SIMPAN MODEL
    joblib.dump(model, FILE_MODEL)
    print(f"\n💾 Model berhasil disimpan ke '{FILE_MODEL}'")
    print("="*50)

if __name__ == "__main__":
    train_model()

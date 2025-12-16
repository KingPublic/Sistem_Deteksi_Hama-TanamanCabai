import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ==========================================
# 1. MEMBUAT DATASET CERDAS (DENGAN AREA ABU-ABU)
# ==========================================
np.random.seed(42)
n_samples = 1000

# A. KONDISI AMAN (Label 0)
# Suara rendah (30-55), Getaran rendah (0-0.5)
aman_suara = np.random.normal(40, 5, 400)
aman_getar = np.random.normal(0.1, 0.1, 400)
aman_lembab = np.random.uniform(40, 90, 400)
label_aman = np.zeros(400)

# B. KONDISI HAMA JELAS (Label 1)
# Suara tinggi (70-90), Getaran tinggi (2.0-5.0)
hama_suara = np.random.normal(80, 5, 400)
hama_getar = np.random.normal(3.0, 1.0, 400)
hama_lembab = np.random.uniform(50, 95, 400)
label_hama = np.ones(400)

# C. KONDISI AMBIGU / WASPADA (Label 0 atau 1)
# Ini penting agar AI belajar memberi skor 40-60%
# Contoh: Suara agak tinggi tapi getaran rendah (Mungkin angin/kendaraan lewat)
ambigu_suara = np.random.normal(60, 5, 200) 
ambigu_getar = np.random.normal(0.8, 0.3, 200)
ambigu_lembab = np.random.uniform(40, 90, 200)
# Labelnya kita buat acak (noise) agar model tidak terlalu yakin di area ini
label_ambigu = np.random.choice([0, 1], 200)

# GABUNGKAN SEMUA DATA
X = pd.DataFrame({
    'suara_dB': np.concatenate([aman_suara, hama_suara, ambigu_suara]),
    'getaran_ms2': np.concatenate([aman_getar, hama_getar, ambigu_getar]),
    'kelembaban_persen': np.concatenate([aman_lembab, hama_lembab, ambigu_lembab])
})
y = np.concatenate([label_aman, label_hama, label_ambigu])

# ==========================================
# 2. TRAINING MODEL
# ==========================================
print("Sedang melatih model dengan data variatif...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Gunakan n_estimators lebih banyak untuk probabilitas yang lebih halus
model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# ==========================================
# 3. EVALUASI & SIMPAN
# ==========================================
y_pred = model.predict(X_test)
print(f"Akurasi Model: {accuracy_score(y_test, y_pred)*100:.2f}%")

# Simpan Model
joblib.dump(model, 'model_hama.pkl')
print("✅ Model baru berhasil disimpan sebagai 'model_hama.pkl'")
print("   Model ini sekarang mendukung output probabilitas (0-100%)")
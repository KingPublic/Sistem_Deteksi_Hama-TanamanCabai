import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ==========================================
# 1. GENERATE DATASET CERDAS (SCENARIO BASED)
# ==========================================
# Kita akan membuat total 600 sampel agar lebih akurat dari 500
np.random.seed(42)

# --- SKENARIO 1: KONDISI AMAN / TENANG (200 Data) ---
# Tidak ada apa-apa. Suara sepi, getaran nyaris nol.
# Label: 0 (Aman)
aman_suara = np.random.normal(35, 5, 200)      # 30-40 dB
aman_getar = np.random.normal(0.05, 0.02, 200) # Diam
aman_lembab = np.random.uniform(40, 85, 200)   # Normal
label_aman = np.zeros(200)

# --- SKENARIO 2: AKTIVITAS HAMA (200 Data) ---
# Hama biasanya tidak seberisik angin, tapi getarannya spesifik (gerakan di batang).
# Label: 1 (Hama)
hama_suara = np.random.normal(55, 8, 200)      # 45-65 dB (Suara gesekan/kunyah)
hama_getar = np.random.normal(1.8, 0.5, 200)   # 1.3 - 2.3 ms2 (Gerakan kecil tapi intens)
hama_lembab = np.random.uniform(50, 90, 200)   # Hama suka agak lembab
label_hama = np.ones(200)

# --- SKENARIO 3: GANGGUAN ALAM / FALSE ALARM (100 Data) ---
# INI PENTING! Agar AI tidak salah sangka Angin/Hujan sebagai Hama.
# Angin/Hujan = Suara Keras & Getaran Keras, TAPI Labelnya 0 (Aman dari Hama).
gangguan_suara = np.random.normal(85, 5, 100)    # > 80 dB (Berisik sekali)
gangguan_getar = np.random.normal(4.0, 0.8, 100) # > 3.0 ms2 (Goyang kencang kena angin)
gangguan_lembab = np.random.uniform(60, 99, 100)
label_gangguan = np.zeros(100) # Tetap 0 karena ini cuma angin/hujan, bukan hama

# --- SKENARIO 4: HAMA TERSEMBUNYI (100 Data) ---
# Kasus sulit: Suara pelan, tapi getaran ada sedikit.
# Label: 1 (Hama)
sulit_suara = np.random.normal(40, 3, 100)     # Sepi
sulit_getar = np.random.normal(1.2, 0.2, 100)  # Ada getaran halus
sulit_lembab = np.random.uniform(60, 90, 100)
label_sulit = np.ones(100)

# GABUNGKAN SEMUA DATA
X = pd.DataFrame({
    'suara_dB': np.concatenate([aman_suara, hama_suara, gangguan_suara, sulit_suara]),
    'getaran_ms2': np.concatenate([aman_getar, hama_getar, gangguan_getar, sulit_getar]),
    'kelembaban_persen': np.concatenate([aman_lembab, hama_lembab, gangguan_lembab, sulit_lembab])
})
y = np.concatenate([label_aman, label_hama, label_gangguan, label_sulit])

# Acak urutan data agar training merata
df_final = pd.concat([X, pd.Series(y, name='label')], axis=1)
df_final = df_final.sample(frac=1, random_state=42).reset_index(drop=True)

X = df_final[['suara_dB', 'getaran_ms2', 'kelembaban_persen']]
y = df_final['label']

print(f"Total Dataset: {len(df_final)} sampel")

# ==========================================
# 2. TRAINING MODEL (Random Forest)
# ==========================================
print("Sedang melatih model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Kita perbanyak 'n_estimators' jadi 300 pohon keputusan agar lebih teliti
model = RandomForestClassifier(n_estimators=300, max_depth=15, random_state=42)
model.fit(X_train, y_train)

# ==========================================
# 3. EVALUASI
# ==========================================
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Akurasi Model Baru: {acc*100:.2f}%")
print("\nLaporan Detail:")
print(classification_report(y_test, y_pred))

# ==========================================
# 4. TES KASUS JEBAKAN (UNTUK MEMBUKTIKAN KECERDASAN)
# ==========================================
print("\n--- UJI COBA KASUS SULIT ---")
test_cases = [
    [35, 0.05, 60], # 1. Aman total
    [85, 4.5, 95],  # 2. Hujan Badai (Suara keras, Getar kencang) -> Harusnya AMAN (0)
    [55, 1.8, 70],  # 3. Hama Standar -> Harusnya HAMA (1)
    [40, 1.2, 65]   # 4. Hama Diam-diam -> Harusnya HAMA (1)
]

for i, case in enumerate(test_cases):
    prob = model.predict_proba([case])[0][1] * 100
    pred = "HAMA" if prob > 50 else "AMAN"
    print(f"Kasus {i+1} {case}: Prediksi AI = {pred} (Yakin: {prob:.1f}%)")

# ==========================================
# 5. SIMPAN MODEL
# ==========================================
joblib.dump(model, 'model_hama.pkl')
print("\n✅ Model berhasil disimpan ulang ke 'model_hama.pkl'")

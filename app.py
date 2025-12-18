from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# --- KONFIGURASI ---
MODEL_FILE = 'model_hama.pkl'

# 1. LOAD MODEL SAAT SERVER NYALA
model = None
if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        print(f"✅ Model '{MODEL_FILE}' berhasil dimuat!")
    except Exception as e:
        print(f"❌ Gagal memuat model: {e}")
else:
    print(f"⚠️  Peringatan: File '{MODEL_FILE}' tidak ditemukan. Pastikan sudah training.")

# 2. ROUTE HALAMAN UTAMA
@app.route('/')
def home():
    return render_template('index.html')

# 3. ROUTE API PREDIKSI
@app.route('/predict', methods=['POST'])
def predict():
    # Cek apakah model ada
    if not model:
        return jsonify({'status': 'error', 'message': 'Model belum siap/tidak ditemukan di server.'})

    try:
        # --- [BAGIAN INI YANG MUNGKIN HILANG SEBELUMNYA] ---
        # Ambil data JSON yang dikirim oleh JavaScript
        data = request.get_json()
        
        # Definisi Variabel (Agar tidak error 'not defined')
        suara = float(data['suara'])
        getaran = float(data['getaran'])
        kelembaban = float(data['kelembaban'])
        # ---------------------------------------------------

        # --- LOGIKA AI (PREDIKSI) ---
        # Input harus array 2D: [[suara, getaran, kelembaban]]
        input_data = [[suara, getaran, kelembaban]]
        
        # Ambil probabilitas (keyakinan) model. 
        # index [1] artinya probabilitas kelas "1" (Hama)
        probabilitas = model.predict_proba(input_data)[0][1]
        
        # Ubah ke skala 0-100 (1 digit desimal)
        confidence_score = round(probabilitas * 100, 1)

        # Tentukan Status Teks berdasarkan skor
        if confidence_score >= 75:
            status_text = "BAHAYA"
            hama_detected = True
        elif confidence_score >= 40:
            status_text = "WASPADA"
            hama_detected = False
        else:
            status_text = "AMAN"
            hama_detected = False

        # --- LOGIKA HUJAN (MANUAL) ---
        # Sesuai request Anda: Hujan jika kelembaban >= 70
        hujan = True if kelembaban >= 70 else False

        # Kirim Balasan ke JavaScript
        return jsonify({
            'status': 'success',
            'confidence': confidence_score,
            'status_text': status_text,
            'hama_detected': hama_detected,
            'hujan': hujan,
            'suara': suara,         # Variabel ini dikirim balik agar JS bisa baca
            'getaran': getaran,
            'kelembaban': kelembaban
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

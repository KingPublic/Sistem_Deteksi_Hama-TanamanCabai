from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load Model
try:
    model = joblib.load('model_hama.pkl')
    print("✅ Model loaded successfully")
except:
    print("⚠️ Model not found")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        suara = float(data['suara'])
        getaran = float(data['getaran'])
        kelembaban = float(data['kelembaban'])

        # --- LOGIKA AI (SCORING SYSTEM) ---
        input_data = [[suara, getaran, kelembaban]]
        
        # Ambil probabilitas kelas 1 (Hama) -> Hasilnya 0.0 s/d 1.0
        probabilitas = model.predict_proba(input_data)[0][1]
        
        # Ubah ke persen (0-100)
        confidence_score = round(probabilitas * 100, 1)

        # Tentukan Status Berdasarkan Skor
        if confidence_score >= 75:
            status = "BAHAYA"
            hama_detected = True
        elif confidence_score >= 40:
            status = "WASPADA"
            hama_detected = False # Belum tentu hama, tapi mencurigakan
        else:
            status = "AMAN"
            hama_detected = False

        # Logika Hujan (Rule Based)
        hujan = True if kelembaban >= 90 else False

        return jsonify({
            'status': 'success',
            'confidence': confidence_score, # Output baru: Skor 0-100
            'status_text': status,          # Output baru: Teks Status
            'hama_detected': hama_detected,
            'hujan': hujan,
            'suara': suara,
            'getaran': getaran,
            'kelembaban': kelembaban
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
// BACKGROUND SLIDESHOW (Sama seperti sebelumnya)
let currentImageIndex = 0
const images = document.querySelectorAll(".bg-image")
const totalImages = images.length
function changeBackgroundImage() {
  if(totalImages === 0) return;
  images[currentImageIndex].classList.remove("active")
  let nextIndex
  do { nextIndex = Math.floor(Math.random() * totalImages) } while (nextIndex === currentImageIndex && totalImages > 1)
  currentImageIndex = nextIndex
  images[currentImageIndex].classList.add("active")
}
setInterval(changeBackgroundImage, 4000)

// FORM HANDLING
const sensorForm = document.getElementById("sensorForm")
const outputSection = document.getElementById("outputSection")

sensorForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const suara = parseFloat(document.getElementById("suara").value)
  const getaran = parseFloat(document.getElementById("getaran").value)
  const kelembaban = parseFloat(document.getElementById("kelembaban").value)
  
  analyzeData(suara, getaran, kelembaban)
  outputSection.style.display = "block"
  outputSection.scrollIntoView({ behavior: "smooth", block: "nearest" })
})

// ==========================================
// LOGIKA UTAMA (TERHUBUNG KE AI)
// ==========================================
async function analyzeData(suara, getaran, kelembaban) {
    // Reset tampilan loading
    document.getElementById("scoreText").innerText = "..."
    document.getElementById("hamaStatus").innerText = "Menganalisis..."
    
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suara, getaran, kelembaban })
        });

        const result = await response.json();

        if (result.status === 'success') {
            // TERIMA DATA DARI PYTHON
            const confidence = result.confidence; // Skor 0-100
            const statusText = result.status_text; // AMAN/WASPADA/BAHAYA
            const hujan = result.hujan;
            
            updateUI(confidence, statusText, hujan, suara, getaran, kelembaban);
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Gagal koneksi ke server Python.");
    }
}

function updateUI(confidence, statusText, hujan, suara, getaran, kelembaban) {
    const hamaCard = document.getElementById("hamaCard");
    const progressBar = document.getElementById("progressBar");
    const scoreText = document.getElementById("scoreText");
    const hamaStatus = document.getElementById("hamaStatus");
    const hamaIcon = document.getElementById("hamaIcon");
    const hamaDesc = document.getElementById("hamaDescription");

    // 1. UPDATE METERAN & WARNA
    scoreText.innerText = confidence + "%";
    progressBar.style.width = confidence + "%";
    
    hamaCard.classList.remove("safe", "warning", "danger");
    progressBar.classList.remove("bg-safe", "bg-warning", "bg-danger");

    if (confidence >= 75) {
        // BAHAYA
        hamaCard.classList.add("danger");
        progressBar.style.backgroundColor = "#dc2626"; // Merah
        hamaIcon.innerText = "🐛";
        hamaStatus.innerText = "BAHAYA TERDETEKSI";
        hamaStatus.style.color = "#dc2626";
        hamaDesc.innerText = "Sinyal sensor sangat kuat menunjukkan aktivitas hama.";
    } else if (confidence >= 40) {
        // WASPADA
        hamaCard.classList.add("warning");
        progressBar.style.backgroundColor = "#d97706"; // Oranye
        hamaIcon.innerText = "⚠️";
        hamaStatus.innerText = "WASPADA";
        hamaStatus.style.color = "#d97706";
        hamaDesc.innerText = "Pola mencurigakan terdeteksi. Lakukan pengecekan manual.";
    } else {
        // AMAN
        hamaCard.classList.add("safe");
        progressBar.style.backgroundColor = "#16a34a"; // Hijau
        hamaIcon.innerText = "✅";
        hamaStatus.innerText = "KONDISI AMAN";
        hamaStatus.style.color = "#16a34a";
        hamaDesc.innerText = "Tidak ada aktivitas hama yang signifikan.";
    }

    // 2. UPDATE CUACA
    const cuacaStatus = document.getElementById("cuacaStatus");
    const cuacaIcon = document.getElementById("cuacaIcon");
    const cuacaDesc = document.getElementById("cuacaDescription");
    const cuacaCard = document.getElementById("cuacaCard");

    if (hujan) {
        cuacaCard.className = "result-card warning";
        cuacaIcon.innerText = "🌧️";
        cuacaStatus.innerText = "HUJAN";
        cuacaDesc.innerText = `Kelembaban tinggi (${kelembaban}%).`;
    } else {
        cuacaCard.className = "result-card";
        cuacaIcon.innerText = "☀️";
        cuacaStatus.innerText = "CERAH / BERAWAN";
        cuacaDesc.innerText = `Kelembaban normal (${kelembaban}%).`;
    }

    // 3. REKOMENDASI
    const rekCard = document.getElementById("rekomendasiCard");
    const rekContent = document.getElementById("rekomendasiContent");
    let html = "";

    if (confidence >= 75 && !hujan) {
        rekCard.style.background = "#fee2e2"; 
        html = `<strong>🚨 SEGERA SEMPROT PESTISIDA!</strong><br>Skor risiko hama sangat tinggi (${confidence}%). Cuaca mendukung penyemprotan.`;
    } else if (confidence >= 75 && hujan) {
        rekCard.style.background = "#fef3c7";
        html = `<strong>⚠️ TUNDA PENYEMPROTAN</strong><br>Hama terdeteksi (${confidence}%), namun kondisi hujan membuat pestisida tidak efektif. Tunggu reda.`;
    } else if (confidence >= 40) {
        rekCard.style.background = "#ffedd5";
        html = `<strong>👀 MONITORING KETAT</strong><br>AI mendeteksi anomali (${confidence}%). Periksa daun secara manual sebelum mengambil tindakan.`;
    } else {
        rekCard.style.background = "#d1fae5";
        html = `<strong>✅ PERAWATAN RUTIN</strong><br>Tanaman sehat. Lanjutkan pemupukan dan penyiraman seperti biasa.`;
    }
    
    html += `<hr style="margin:10px 0; opacity:0.3"> <small>Data: Suara ${suara}dB | Getar ${getaran} | Lembab ${kelembaban}%</small>`;
    rekContent.innerHTML = html;
}

function resetForm() {
    sensorForm.reset();
    outputSection.style.display = "none";
    sensorForm.scrollIntoView({ behavior: "smooth", block: "start" });
}
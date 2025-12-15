// ==========================================
// BACKGROUND SLIDESHOW
// ==========================================
let currentImageIndex = 0
const images = document.querySelectorAll(".bg-image")
const totalImages = images.length

function changeBackgroundImage() {
  // Remove active class from current image
  images[currentImageIndex].classList.remove("active")

  // Get random next image (not the same as current)
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * totalImages)
  } while (nextIndex === currentImageIndex && totalImages > 1)

  currentImageIndex = nextIndex

  // Add active class to next image
  images[currentImageIndex].classList.add("active")
}

// Change background every 4 seconds with random selection
setInterval(changeBackgroundImage, 4000)

// ==========================================
// FORM HANDLING
// ==========================================
const sensorForm = document.getElementById("sensorForm")
const outputSection = document.getElementById("outputSection")

sensorForm.addEventListener("submit", (e) => {
  e.preventDefault()

  // Get input values
  const suara = Number.parseFloat(document.getElementById("suara").value)
  const getaran = Number.parseFloat(document.getElementById("getaran").value)
  const kelembaban = Number.parseFloat(document.getElementById("kelembaban").value)

  // Validate inputs
  if (isNaN(suara) || isNaN(getaran) || isNaN(kelembaban)) {
    alert("Mohon masukkan nilai yang valid untuk semua sensor!")
    return
  }

  // Analyze data
  analyzeData(suara, getaran, kelembaban)

  // Show output section with animation
  outputSection.style.display = "block"
  outputSection.scrollIntoView({ behavior: "smooth", block: "nearest" })
})

// ==========================================
// ANALYSIS LOGIC (SIMPLIFIED MODEL)
// ==========================================
function analyzeData(suara, getaran, kelembaban) {
  // Simplified detection logic based on thresholds
  // In real implementation, this would call the Flask API

  // 1. PEST DETECTION
  let hamaDetected = false
  let hamaScore = 0

  // High sound suggests pest activity
  if (suara > 60) hamaScore += 1

  // High vibration suggests pest movement
  if (getaran > 1.5) hamaScore += 1

  // High humidity creates favorable pest conditions
  if (kelembaban > 80) hamaScore += 0.5

  hamaDetected = hamaScore >= 1.5

  // 2. WEATHER DETECTION
  const hujan = kelembaban >= 90

  // 3. UPDATE UI
  updateHamaStatus(hamaDetected, hamaScore, suara, getaran)
  updateCuacaStatus(hujan, kelembaban)
  generateRecommendation(hamaDetected, hujan, suara, getaran, kelembaban)
}

// ==========================================
// UPDATE PEST STATUS
// ==========================================
function updateHamaStatus(detected, score, suara, getaran) {
  const hamaCard = document.getElementById("hamaCard")
  const hamaIcon = document.getElementById("hamaIcon")
  const hamaStatus = document.getElementById("hamaStatus")
  const hamaDescription = document.getElementById("hamaDescription")

  if (detected) {
    hamaCard.classList.remove("warning")
    hamaCard.classList.add("danger")
    hamaIcon.textContent = "🐛"
    hamaStatus.textContent = "⚠️ HAMA TERDETEKSI"
    hamaStatus.className = "result-status danger"

    const details = []
    if (suara > 60) details.push("Suara tinggi")
    if (getaran > 1.5) details.push("Getaran signifikan")

    hamaDescription.textContent = `Indikasi hama aktif. ${details.join(", ")}.`
  } else if (score > 0.5) {
    hamaCard.classList.remove("danger")
    hamaCard.classList.add("warning")
    hamaIcon.textContent = "⚠️"
    hamaStatus.textContent = "WASPADA"
    hamaStatus.className = "result-status warning"
    hamaDescription.textContent = "Kondisi menunjukkan potensi hama. Perlu monitoring ketat."
  } else {
    hamaCard.classList.remove("danger", "warning")
    hamaIcon.textContent = "✅"
    hamaStatus.textContent = "AMAN"
    hamaStatus.className = "result-status safe"
    hamaDescription.textContent = "Tidak ada indikasi hama terdeteksi. Tanaman dalam kondisi baik."
  }
}

// ==========================================
// UPDATE WEATHER STATUS
// ==========================================
function updateCuacaStatus(hujan, kelembaban) {
  const cuacaCard = document.getElementById("cuacaCard")
  const cuacaIcon = document.getElementById("cuacaIcon")
  const cuacaStatus = document.getElementById("cuacaStatus")
  const cuacaDescription = document.getElementById("cuacaDescription")

  if (hujan) {
    cuacaCard.classList.add("warning")
    cuacaIcon.textContent = "🌧️"
    cuacaStatus.textContent = "HUJAN"
    cuacaStatus.className = "result-status warning"
    cuacaDescription.textContent = `Kelembaban ${kelembaban.toFixed(1)}%. Kondisi basah terdeteksi.`
  } else if (kelembaban > 80) {
    cuacaCard.classList.remove("warning")
    cuacaIcon.textContent = "☁️"
    cuacaStatus.textContent = "LEMBAB"
    cuacaStatus.className = "result-status warning"
    cuacaDescription.textContent = `Kelembaban ${kelembaban.toFixed(1)}%. Udara cukup lembab.`
  } else {
    cuacaCard.classList.remove("warning")
    cuacaIcon.textContent = "☀️"
    cuacaStatus.textContent = "CERAH"
    cuacaStatus.className = "result-status safe"
    cuacaDescription.textContent = `Kelembaban ${kelembaban.toFixed(1)}%. Kondisi optimal untuk pertanian.`
  }
}

// ==========================================
// GENERATE RECOMMENDATIONS
// ==========================================
function generateRecommendation(hamaDetected, hujan, suara, getaran, kelembaban) {
  const rekomendasiContent = document.getElementById("rekomendasiContent")
  const rekomendasiCard = document.getElementById("rekomendasiCard")

  const recommendations = []

  if (hamaDetected && !hujan) {
    // Pest detected, weather is good for spraying
    rekomendasiCard.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
    rekomendasiCard.style.borderColor = "#fca5a5"

    const currentHour = new Date().getHours()
    let sprayTime

    if (currentHour < 6 || currentHour > 18) {
      sprayTime = "pagi hari (06:00 - 08:00)"
    } else if (currentHour < 10) {
      sprayTime = "sore hari (16:00 - 18:00)"
    } else {
      sprayTime = "besok pagi (06:00 - 08:00)"
    }

    recommendations.push(`<strong>🚨 TINDAKAN SEGERA DIPERLUKAN!</strong>`)
    recommendations.push(`<strong>Semprot pestisida pada ${sprayTime}</strong> untuk mengendalikan hama.`)

    recommendations.push(`<ul class="recommendation-list">`)
    recommendations.push(`<li>Gunakan pestisida yang sesuai untuk hama pada cabai</li>`)
    recommendations.push(`<li>Semprot pada suhu 20-30°C untuk efektivitas maksimal</li>`)
    recommendations.push(`<li>Pastikan nozzle sprayer mengarah ke bagian bawah daun</li>`)
    recommendations.push(`<li>Monitor kondisi tanaman 24-48 jam setelah penyemprotan</li>`)
    recommendations.push(`</ul>`)
  } else if (hamaDetected && hujan) {
    // Pest detected but raining
    rekomendasiCard.style.background = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
    rekomendasiCard.style.borderColor = "#fcd34d"

    recommendations.push(`<strong>⚠️ HAMA TERDETEKSI - TUNDA PENYEMPROTAN</strong>`)
    recommendations.push(`Kondisi hujan/basah tidak ideal untuk penyemprotan pestisida.`)

    recommendations.push(`<ul class="recommendation-list">`)
    recommendations.push(`<li>Tunggu hingga kelembaban turun di bawah 85%</li>`)
    recommendations.push(`<li>Pastikan tidak ada hujan dalam 2-3 jam ke depan</li>`)
    recommendations.push(`<li>Lakukan inspeksi visual kondisi tanaman</li>`)
    recommendations.push(`<li>Siapkan peralatan penyemprotan untuk tindakan cepat</li>`)
    recommendations.push(`</ul>`)
  } else if (!hamaDetected && kelembaban > 80) {
    // No pest but high humidity
    rekomendasiCard.style.background = "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
    rekomendasiCard.style.borderColor = "#93c5fd"

    recommendations.push(`<strong>✅ KONDISI AMAN - MONITORING PREVENTIF</strong>`)
    recommendations.push(`Kelembaban tinggi dapat memicu pertumbuhan hama. Lakukan tindakan preventif:`)

    recommendations.push(`<ul class="recommendation-list">`)
    recommendations.push(`<li>Tingkatkan sirkulasi udara di sekitar tanaman</li>`)
    recommendations.push(`<li>Periksa bagian bawah daun secara berkala</li>`)
    recommendations.push(`<li>Pastikan drainase tanah berfungsi baik</li>`)
    recommendations.push(`<li>Monitoring sensor setiap 4-6 jam</li>`)
    recommendations.push(`</ul>`)
  } else {
    // All good
    rekomendasiCard.style.background = "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
    rekomendasiCard.style.borderColor = "#6ee7b7"

    recommendations.push(`<strong>✅ KONDISI OPTIMAL</strong>`)
    recommendations.push(`Tanaman cabai dalam kondisi baik. Tidak ada tindakan khusus diperlukan.`)

    recommendations.push(`<ul class="recommendation-list">`)
    recommendations.push(`<li>Lanjutkan monitoring rutin setiap 6-8 jam</li>`)
    recommendations.push(`<li>Pastikan sistem irigasi berfungsi normal</li>`)
    recommendations.push(`<li>Lakukan pemupukan sesuai jadwal</li>`)
    recommendations.push(`<li>Catat kondisi tanaman untuk analisis jangka panjang</li>`)
    recommendations.push(`</ul>`)
  }

  // Add data summary
  recommendations.push(`<hr style="margin: 1rem 0; border: none; border-top: 2px solid rgba(0,0,0,0.1);">`)
  recommendations.push(`<strong>📊 Data Sensor:</strong>`)
  recommendations.push(
    `<p style="margin-top: 0.5rem;">Suara: ${suara.toFixed(1)} dB | Getaran: ${getaran.toFixed(2)} m/s² | Kelembaban: ${kelembaban.toFixed(1)}%</p>`,
  )

  rekomendasiContent.innerHTML = recommendations.join("")
}

// ==========================================
// RESET FORM
// ==========================================
function resetForm() {
  sensorForm.reset()
  outputSection.style.display = "none"

  // Scroll back to form
  sensorForm.scrollIntoView({ behavior: "smooth", block: "start" })
}

// ==========================================
// INITIALIZE
// ==========================================
console.log("🌶️ Sistem Deteksi Hama Cabai - Ready!")
console.log("📊 Total background images: " + totalImages)

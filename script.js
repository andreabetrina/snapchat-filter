document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photoContainer = document.getElementById('photo-container');
    const startCameraBtn = document.getElementById('start-camera');
    const takePhotoBtn = document.getElementById('take-photo');
    const downloadBtn = document.getElementById('download-btn');
    const useHeartFilter = document.getElementById('use-heart-filter');

    let stream = null;
    let currentPhoto = null;

    // 🟣 Load heart filter image
    const heartImage = new Image();
    heartImage.src = 'heart-arch.png';  // This file must be in the same folder as this HTML

    // 🎥 Start camera
    startCameraBtn.addEventListener('click', async function () {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            video.srcObject = stream;
            takePhotoBtn.disabled = false;
            startCameraBtn.disabled = true;
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please ensure you've granted permission.");
        }
    });

    // 📸 Take photo
    takePhotoBtn.addEventListener('click', function () {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 🧠 Apply heart filter if selected
        if (useHeartFilter.checked) {
            if (heartImage.complete) {
                drawHeartFilter(context, canvas.width, canvas.height);
                showPhoto();
            } else {
                heartImage.onload = () => {
                    drawHeartFilter(context, canvas.width, canvas.height);
                    showPhoto();
                };
            }
        } else {
            showPhoto();
        }

        // ⬇️ Show captured image
        function showPhoto() {
            currentPhoto = new Image();
            currentPhoto.src = canvas.toDataURL('image/png');
            currentPhoto.style.maxWidth = '100%';

            photoContainer.innerHTML = '';
            photoContainer.appendChild(currentPhoto);
            downloadBtn.disabled = false;
        }
    });

    // 💖 Draw heart overlay
    function drawHeartFilter(context, width, height) {
        const heartWidth = width * 0.6;
        const heartHeight = heartWidth * (heartImage.height / heartImage.width);
        const x = (width - heartWidth) / 2;
        const y = height * 0.05; // Slightly below the top

        context.drawImage(heartImage, x, y, heartWidth, heartHeight);
    }

    // 💾 Download photo
    downloadBtn.addEventListener('click', function () {
        if (!currentPhoto) return;

        const link = document.createElement('a');
        link.download = 'photo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // 🧹 Stop camera on page unload
    window.addEventListener('beforeunload', function () {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
});

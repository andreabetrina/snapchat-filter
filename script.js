document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photoContainer = document.getElementById('photo-container');
    const startCameraBtn = document.getElementById('start-camera');
    const takePhotoBtn = document.getElementById('take-photo');
    const downloadBtn = document.getElementById('download-btn');
    const backgroundFilter = document.getElementById('background-filter');
    
    let stream = null;
    let currentPhoto = null;

    
    // Start camera
    startCameraBtn.addEventListener('click', async function() {
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
    
    // Take photo
    takePhotoBtn.addEventListener('click', function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply selected filter
        applyFilter(context, canvas.width, canvas.height);
        
        // Display the photo
        currentPhoto = new Image();
        currentPhoto.src = canvas.toDataURL('image/png');
        currentPhoto.style.maxWidth = '100%';
        
        // Clear previous photos
        photoContainer.innerHTML = '';
        photoContainer.appendChild(currentPhoto);
        
        // Enable download button
        downloadBtn.disabled = false;
    });
    
    // Apply filter based on selection
    function applyFilter(context, width, height) {
        const filter = backgroundFilter.value;
        
        if (filter === 'none') return;
        
        // Get the image data
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Define color ranges for the filter
        let targetR, targetG, targetB, range;
        
        if (filter === 'green') {
            targetR = 0;
            targetG = 255;
            targetB = 0;
            range = 100;
        } else if (filter === 'blue') {
            targetR = 0;
            targetG = 0;
            targetB = 255;
            range = 100;
        }
        
        // Change background color
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if pixel is close to the target color
            if (Math.abs(r - targetR) < range && 
                Math.abs(g - targetG) < range && 
                Math.abs(b - targetB) < range) {
                
                // Make background transparent or change color
                // Here we're making it transparent
                data[i + 3] = 0; // Alpha channel
            }
        }
        
        context.putImageData(imageData, 0, 0);
        
        // If you want to replace with a solid color instead of transparent:
        /*
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = '#ff0000'; // Red background example
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = 'source-over';
        */
    }
    
    // Download photo
    downloadBtn.addEventListener('click', function() {
        if (!currentPhoto) return;
        
        const link = document.createElement('a');
        link.download = 'photo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    // Clean up when leaving the page
    window.addEventListener('beforeunload', function() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
});
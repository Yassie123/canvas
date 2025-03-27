import './styles/reset.css';
import './styles/style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Canvas Setup
    const canvas = document.getElementById('mural-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const colorPicker = document.getElementById('color-picker');
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

    // Check if all required elements exist
    if (!canvas || !ctx || !colorPicker || !brushSizeSlider || !clearBtn || !saveBtn) {
        console.error('One or more required elements are missing');
        return;
    }

    // Ensure canvas is the correct size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Improved drawing function with more accurate positioning
    function draw(e) {
        if (!isDrawing) return;

        // Prevent default to stop scrolling/zooming on touch devices
        e.preventDefault();

        // Get precise coordinates
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeSlider.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

    // Mouse Event Listeners with improved accuracy
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        lastX = (e.clientX - rect.left) * scaleX;
        lastY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Touch Event Listeners with improved accuracy
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        lastX = (touch.clientX - rect.left) * scaleX;
        lastY = (touch.clientY - rect.top) * scaleY;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeSlider.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }, { passive: false });

    canvas.addEventListener('touchend', () => isDrawing = false);

    // Update brush size display
    brushSizeSlider.addEventListener('input', (e) => {
        const brushSizeDisplay = document.getElementById('brush-size-display');
        if (brushSizeDisplay) {
            brushSizeDisplay.textContent = `Brush Size: ${e.target.value}px`;
        }
    });

    // Clear Canvas
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Save Artwork
    saveBtn.addEventListener('click', () => {
        const artworkData = canvas.toDataURL();
        const artworks = JSON.parse(localStorage.getItem('communityArtworks') || '[]');
        
        // Generate unique ID for artwork
        const artworkId = Date.now().toString();
        
        artworks.push({
            id: artworkId,
            data: artworkData
        });

        localStorage.setItem('communityArtworks', JSON.stringify(artworks));
        
        // Redirect to gallery
        window.location.href = 'gallery.html';
    });
});
// Artwork Loading Function
document.addEventListener('DOMContentLoaded', () => {
    function loadArtworks() {
        const artworkContainer = document.getElementById('artwork-container');
        
        // Check if artwork container exists
        if (!artworkContainer) {
            console.error('Artwork container not found');
            return;
        }

        // Clear existing artworks
        artworkContainer.innerHTML = '';

        // Retrieve artworks from localStorage
        const artworks = JSON.parse(localStorage.getItem('communityArtworks') || '[]');

        // Create gallery items
        artworks.forEach(artwork => {
            const artworkElement = document.createElement('div');
            artworkElement.classList.add('gallery-item');

            const img = document.createElement('img');
            img.src = artwork.data;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn');
            deleteBtn.addEventListener('click', () => {
                const updatedArtworks = artworks.filter(a => a.id !== artwork.id);
                localStorage.setItem('communityArtworks', JSON.stringify(updatedArtworks));
                loadArtworks();
            });

            artworkElement.appendChild(img);
            artworkElement.appendChild(deleteBtn);
            artworkContainer.appendChild(artworkElement);
        });
    }

    // Load artworks when page loads
    loadArtworks();
});
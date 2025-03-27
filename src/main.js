import './styles/reset.css';
import './styles/style.css';


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

document.addEventListener('DOMContentLoaded', () => {
    // Canvas Setup
    const canvas = document.getElementById('mural-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const colorPicker = document.getElementById('color-picker');
    const brushSizeInput = document.getElementById('brush-size');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

    // Check if all required elements exist
    if (!canvas || !ctx || !colorPicker || !brushSizeInput || !clearBtn || !saveBtn) {
        console.error('One or more required elements are missing');
        return;
    }

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Drawing Function
    function draw(e) {
        if (!isDrawing) return;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // Canvas Event Listeners
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

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
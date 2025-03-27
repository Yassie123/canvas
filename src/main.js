import './styles/reset.css';
import './styles/style.css';


function loadArtworks() {
    const artworkContainer = document.getElementById('artwork-container');
    const artworks = JSON.parse(localStorage.getItem('communityArtworks') || '[]');

    // Clear existing artworks
    artworkContainer.innerHTML = '';

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
window.onload = loadArtworks;


// Canvas Setup
const canvas = document.getElementById('mural-canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const brushSizeInput = document.getElementById('brush-size');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');

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
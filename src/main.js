import './styles/reset.css';
import './styles/style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Canvas Setup
    const canvas = document.getElementById('mural-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const colorPicker = document.getElementById('color-picker');
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const brushTypeSelect = document.getElementById('brush-type-select');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

//fotobrush
const photoUploadInput = document.createElement('input');
photoUploadInput.type = 'file';
photoUploadInput.id = 'photo-upload';
photoUploadInput.accept = 'image/*';
photoUploadInput.style.display = 'none';

const photoUploadLabel = document.createElement('label');
    photoUploadLabel.htmlFor = 'photo-upload';
    photoUploadLabel.classList.add('btn');
    photoUploadLabel.textContent = 'Upload een foto voor de photobrush';

    const controlsContainer = document.getElementById('uploadphoto');
    if (controlsContainer) {
        controlsContainer.appendChild(photoUploadInput);
        controlsContainer.appendChild(photoUploadLabel);
    }
    let photoBrushImage = null;

    // Check if all required elements exist
    if (!canvas || !ctx || !colorPicker || !brushSizeSlider || !brushTypeSelect || !clearBtn || !saveBtn) {
        console.error('One or more required elements are missing');
        return;
    }

    // Ensure canvas is the correct size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Brush types with custom drawing methods
    const brushTypes = {
        pencil: (ctx, x, y, lastX, lastY, color, size) => {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        },
        marker: (ctx, x, y, lastX, lastY, color, size) => {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 2;
            ctx.lineCap = 'square';
            ctx.lineJoin = 'miter';
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        },
        sprayPaint: (ctx, x, y, lastX, lastY, color, size) => {
            const density = size * 2;
            for (let i = 0; i < density; i++) {
                const offsetX = (Math.random() - 0.5) * size * 2;
                const offsetY = (Math.random() - 0.5) * size * 2;
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, Math.random() * (size / 4), 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        },
        calligraphyBrush: (ctx, x, y, lastX, lastY, color, size) => {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 2;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            ctx.setLineDash([size, size / 2]); // Creates a dashed line effect
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        },
        eraser: (ctx, x, y, lastX, lastY, color, size) => {
            // Erase by drawing with a white background color
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#ffff'; // Match the background color
            ctx.lineWidth = size * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        },
        photoBrush: (ctx, x, y, lastX, lastY, color, size) => {
            // If no photo is uploaded, show an alert and revert to pencil
            if (!photoBrushImage) {
                alert('Please upload a photo first to use the Photo Brush');
                brushTypeSelect.value = 'pencil';
                return;
            }
            
            // Calculate distance between current and last point
            const dx = x - lastX;
            const dy = y - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Determine spacing based on brush size
            const spacing = size / 2;
            
            // If distance is very small, just draw one stamp
            if (distance < spacing) {
                const stampSize = size * 2;
                ctx.globalAlpha = 0.7; // Slightly transparent
                ctx.drawImage(
                    photoBrushImage, 
                    x - stampSize/2, 
                    y - stampSize/2, 
                    stampSize, 
                    stampSize
                );
                ctx.globalAlpha = 1;
                return;
            }
            
            // Draw multiple stamps along the line for smooth drawing
            const steps = Math.floor(distance / spacing);
            for (let i = 0; i <= steps; i++) {
                const t = steps === 0 ? 0 : i / steps;
                const stampX = lastX + dx * t;
                const stampY = lastY + dy * t;
                const stampSize = size * 2;
                
                ctx.globalAlpha = 0.7; // Slightly transparent
                ctx.drawImage(
                    photoBrushImage, 
                    stampX - stampSize/2, 
                    stampY - stampSize/2, 
                    stampSize, 
                    stampSize
                );
                ctx.globalAlpha = 1;
            }
        }
    };
 const photoBrushOption = document.createElement('option');
    photoBrushOption.value = 'photoBrush';
    photoBrushOption.textContent = 'Photo Brush';
    brushTypeSelect.appendChild(photoBrushOption);
    
    // Handle photo upload
    photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        // Create image from the uploaded file
        const reader = new FileReader();
        reader.onload = (event) => {
            photoBrushImage = new Image();
            photoBrushImage.onload = () => {
                // Auto-select photo brush when image is uploaded
                brushTypeSelect.value = 'photoBrush';
                alert('Photo loaded! You can now draw with it using the Photo Brush');
            };
            photoBrushImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    // Improved drawing function with brush type support
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

        // Get current brush type
        const currentBrushType = brushTypeSelect.value;
        const brushFunction = brushTypes[currentBrushType] || brushTypes.pencil;

        // Draw using selected brush type
        brushFunction(
            ctx, 
            x, 
            y, 
            lastX, 
            lastY, 
            colorPicker.value, 
            Number(brushSizeSlider.value)
        );

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

        // Get current brush type
        const currentBrushType = brushTypeSelect.value;
        const brushFunction = brushTypes[currentBrushType] || brushTypes.pencil;

        // Draw using selected brush type
        brushFunction(
            ctx, 
            x, 
            y, 
            lastX, 
            lastY, 
            colorPicker.value, 
            Number(brushSizeSlider.value)
        );

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

// Artwork Loading Function remains the same as in the previous code
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
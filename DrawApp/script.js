const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('gallery');

// Init
function resize() {
    const data = canvas.toDataURL();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Tools
let drawing = false;
let currentTool = 'brush';
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const lineStyle = document.getElementById('lineStyle');

// Toggle Active State
function setTool(tool) {
    currentTool = tool;
    brushBtn.classList.toggle('active', tool === 'brush');
    eraserBtn.classList.toggle('active', tool === 'eraser');
}

brushBtn.onclick = () => setTool('brush');
eraserBtn.onclick = () => setTool('eraser');

// Main Drawing Engine
canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('mousemove', draw);

function start(e) { drawing = true; draw(e); }
function stop() { drawing = false; ctx.beginPath(); }

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = lineWidth.value;
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : colorPicker.value;
    ctx.fillStyle = ctx.strokeStyle;

    if (currentTool === 'eraser' || lineStyle.value === 'pen') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else {
        // Graffiti Mode
        for (let i = 0; i < 25; i++) {
            const r = lineWidth.value * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            ctx.fillRect(x + r * Math.cos(theta), y + r * Math.sin(theta), 1, 1);
        }
    }
}

// Gallery & Logic
document.getElementById('saveBtn').onclick = () => {
    const drawings = JSON.parse(localStorage.getItem('myArtApp') || '[]');
    drawings.push(canvas.toDataURL());
    localStorage.setItem('myArtApp', JSON.stringify(drawings));
    renderGallery();
};

document.getElementById('clearBtn').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

document.getElementById('clearGalleryBtn').onclick = () => {
    if(confirm("Wipe the gallery?")) { localStorage.removeItem('myArtApp'); renderGallery(); }
}

function renderGallery() {
    gallery.innerHTML = '';
    const drawings = JSON.parse(localStorage.getItem('myArtApp') || '[]');
    drawings.reverse().forEach((imgData, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${imgData}"><button class="delete-btn" onclick="removeOne(${index})">Delete</button>`;
        gallery.appendChild(item);
    });
}

window.removeOne = (index) => {
    const drawings = JSON.parse(localStorage.getItem('myArtApp') || '[]');
    drawings.reverse(); // Match display order
    drawings.splice(index, 1);
    localStorage.setItem('myArtApp', JSON.stringify(drawings.reverse()));
    renderGallery();
};

renderGallery();
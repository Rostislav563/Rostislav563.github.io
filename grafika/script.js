const effects = [
    "Circle", "Diamond", "Blur", "Hue Shift", "Glow",
    "Zoom", "Fade", "Triangle", "Spin", "Bounce",
    "Mono", "Dashed", "Skew", "Gradient Overlay", "Invert",
    "Vivid", "Pulse", "Keyhole", "Overexpose", "3D Tilt"
];

const stage = document.getElementById('stage');
const target = document.getElementById('visual-target');
const controls = document.getElementById('controls');
const loader = document.getElementById('imageLoader');

// 1. Generate Effect Buttons
effects.forEach((effect, index) => {
    const btn = document.createElement('button');
    btn.innerText = effect;
    btn.onclick = () => {
        // Reset and apply new class
        stage.className = 'stage fx-' + (index + 1);
        
        // Handle active button state
        document.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
    controls.appendChild(btn);
});

// 2. Handle Image Upload
loader.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const url = event.target.result;
        
        // Update both the background and the CSS variable for the gradient effect
        target.style.backgroundImage = `url(${url})`;
        target.style.setProperty('--bg-img', `url(${url})`);
        
        document.getElementById('msg').innerText = "";
    }
    if(e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});
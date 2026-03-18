class PixelPuzzle {
    constructor() {
        this.imageInput = document.getElementById('imageInput');
        this.cutButton = document.getElementById('cutButton');
        this.difficultySelect = document.getElementById('difficulty');
        this.shapesSelect = document.getElementById('shapes');
        this.imageCanvas = document.getElementById('imageCanvas');
        this.assemblyGrid = document.getElementById('assemblyGrid');
        this.storageContainer = document.getElementById('storageContainer');
        this.statusText = document.getElementById('statusText');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.recordsDisplay = document.getElementById('recordsDisplay');
        this.recordsButton = document.getElementById('recordsButton');

        this.image = null;
        this.imageCtx = this.imageCanvas.getContext('2d');
        this.gridSize = 4;
        this.pieceSize = 100;
        this.shapeMode = 'squares';
        this.puzzlePieces = [];
        this.draggedPiece = null;
        this.draggedElement = null;
        this.draggedFromCell = null;
        this.correctPositions = {};
        this.pieceRotations = {}; // Store rotation angles for each piece

        // Timer & Leaderboard
        this.timerStarted = false;
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;

        // Sound & Audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.soundEnabled = true;

        // Snap-to-Grid
        this.SNAP_DISTANCE = 50;
        this.cellPositions = {};

        this.difficultyMap = {
            easy: { size: 3, pieceSize: 130 },
            medium: { size: 4, pieceSize: 130 },
            hard: { size: 5, pieceSize: 100 },
            extreme: { size: 10, pieceSize: 70 }
        };

        this.initEventListeners();
        this.loadRecords();
        this.displayBestRecord();
        this.initMusicPlayer();
    }

    initEventListeners() {
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.cutButton.addEventListener('click', () => this.cutPuzzle());
        this.difficultySelect.addEventListener('change', () => this.updateDifficulty());
        this.shapesSelect?.addEventListener('change', (e) => {
            this.shapeMode = e.target.value;
            if (this.image && this.puzzlePieces.length > 0) {
                this.cutPuzzle();
            }
        });
        this.recordsButton?.addEventListener('click', () => this.showRecordsModal());

        // Keyboard shortcuts for rotation
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'r' || e.key === 'R') && this.draggedFromCell) {
                e.preventDefault();
                this.rotatePiece(this.draggedFromCell);
            }
        });

        // Drag and drop for file upload
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.imageInput.files = files;
                this.handleImageUpload({ target: { files } });
            }
        });
    }

    // ===== TIMER & LEADERBOARD METHODS =====
    startTimer() {
        if (this.timerStarted) return;
        this.timerStarted = true;
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateTimerDisplay();
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        if (!this.timerDisplay) return;
        const seconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        this.timerDisplay.textContent = `⏱️ ${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
    }

    resetTimer() {
        this.stopTimer();
        this.timerStarted = false;
        this.startTime = null;
        this.elapsedTime = 0;
        if (this.timerDisplay) {
            this.timerDisplay.textContent = '⏱️ 00:00';
        }
    }

    saveRecord() {
        const records = this.loadRecords();
        const newRecord = {
            gridSize: this.gridSize,
            difficulty: this.difficultySelect.value,
            time: this.elapsedTime,
            date: new Date().toISOString(),
            shapes: 'squares' // Будет обновлено когда добавим custom shapes
        };
        
        records.push(newRecord);
        records.sort((a, b) => a.time - b.time);
        records = records.slice(0, 50); // Сохранять топ-50
        
        localStorage.setItem('pixelPuzzleRecords', JSON.stringify(records));
        return newRecord;
    }

    loadRecords() {
        const stored = localStorage.getItem('pixelPuzzleRecords');
        return stored ? JSON.parse(stored) : [];
    }

    displayBestRecord() {
        const records = this.loadRecords();
        if (records.length === 0) {
            if (this.recordsDisplay) {
                this.recordsDisplay.textContent = '🏆 No records yet';
            }
            return;
        }

        const bestRecord = records[0];
        const minutes = Math.floor(bestRecord.time / 60000);
        const seconds = Math.floor((bestRecord.time % 60000) / 1000);
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (this.recordsDisplay) {
            this.recordsDisplay.textContent = `🏆 Best: ${timeStr}`;
        }
    }

    showRecordsModal() {
        const records = this.loadRecords();
        if (records.length === 0) {
            alert('No records yet. Complete a puzzle to create one!');
            return;
        }

        const groupedByDifficulty = {};
        records.forEach(record => {
            if (!groupedByDifficulty[record.difficulty]) {
                groupedByDifficulty[record.difficulty] = [];
            }
            groupedByDifficulty[record.difficulty].push(record);
        });

        let modal = document.getElementById('recordsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'recordsModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        let content = '<div class="modal-content"><h2>🏆 Records</h2>';
        
        Object.keys(groupedByDifficulty).sort().forEach(difficulty => {
            content += `<h3>${difficulty.toUpperCase()}</h3><ul>`;
            groupedByDifficulty[difficulty].slice(0, 10).forEach((record, idx) => {
                const minutes = Math.floor(record.time / 60000);
                const seconds = Math.floor((record.time % 60000) / 1000);
                const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                const date = new Date(record.date).toLocaleDateString();
                content += `<li>#${idx + 1}: ${timeStr} (${record.gridSize}x${record.gridSize}) - ${date}</li>`;
            });
            content += '</ul>';
        });

        content += '<button onclick="document.getElementById(\'recordsModal\').style.display=\'none\'">Close</button>';
        content += '<button onclick="localStorage.removeItem(\'pixelPuzzleRecords\'); location.reload();">Clear All</button>';
        content += '</div>';

        modal.innerHTML = content;
        modal.style.display = 'flex';
    }

    // ===== SOUND EFFECTS METHODS =====
    playSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.soundEnabled) return;
        
        try {
            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
            
            oscillator.start(now);
            oscillator.stop(now + duration / 1000);
        } catch (err) {
            console.log('Audio context error:', err);
        }
    }

    playSnapSound() {
        this.playSound(523, 100, 'sine', 0.4); // C5
    }

    playClickSound() {
        this.playSound(600, 50, 'sine', 0.3);
    }

    playWrongSound() {
        this.playSound(200, 150, 'sine', 0.2);
    }

    playVictorySound() {
        // Arpeggio: C5-E5-G5-C6
        setTimeout(() => this.playSound(523, 150, 'sine', 0.3), 0);    // C5
        setTimeout(() => this.playSound(659, 150, 'sine', 0.3), 160);  // E5
        setTimeout(() => this.playSound(784, 150, 'sine', 0.3), 320);  // G5
        setTimeout(() => this.playSound(1047, 200, 'sine', 0.4), 480); // C6
    }

    // ===== MUSIC PLAYER METHODS =====
    initMusicPlayer() {
        this.musicSelect = document.getElementById('musicSelect');
        this.musicToggle = document.getElementById('musicToggle');
        this.volumeSlider = document.getElementById('volumeSlider');

        this.musicTracks = {
            ambient: this.generateAmbientTrack(),
            electronic: this.generateElectronicTrack(),
            minimal: this.generateMinimalTrack()
        };

        this.isPlaying = false;
        this.currentTrack = null;
        this.currentTrackTimeout = null;
        this.currentOscillators = []; // Store oscillators for stopping
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.connect(this.audioContext.destination);
        this.musicGainNode.gain.value = 0.5;

        this.musicSelect.addEventListener('change', () => this.loadMusicTrack());
        this.musicToggle.addEventListener('click', () => this.toggleMusic());
        this.volumeSlider.addEventListener('input', (e) => {
            this.musicGainNode.gain.value = e.target.value / 100;
        });

        this.loadSavedMusicSettings();
    }

    stopMusicTrack() {
        // Stop all current oscillators
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.currentOscillators = [];
        
        // Clear any pending timeouts
        if (this.currentTrackTimeout) {
            clearTimeout(this.currentTrackTimeout);
            this.currentTrackTimeout = null;
        }
    }

    generateAmbientTrack() {
        return {
            name: 'Ambient Chill',
            notes: [
                { freq: 196, duration: 1000 },
                { freq: 246, duration: 800 },
                { freq: 294, duration: 1200 },
                { freq: 246, duration: 800 },
            ],
            loop: true
        };
    }

    generateElectronicTrack() {
        return {
            name: 'Electronic Zen',
            notes: [
                { freq: 440, duration: 400 },
                { freq: 494, duration: 400 },
                { freq: 523, duration: 400 },
                { freq: 587, duration: 600 },
            ],
            loop: true
        };
    }

    generateMinimalTrack() {
        return {
            name: 'Minimal Focus',
            notes: [
                { freq: 329, duration: 500 },
                { freq: 392, duration: 500 },
                { freq: 329, duration: 500 },
                { freq: 392, duration: 500 },
            ],
            loop: true
        };
    }

    playMusicTrack(trackName) {
        if (!this.soundEnabled || !this.isPlaying) return;
        
        const track = this.musicTracks[trackName];
        if (!track) return;

        const playNotes = () => {
            if (!this.isPlaying) return; // Stop if music was turned off
            
            let currentTime = this.audioContext.currentTime;
            
            track.notes.forEach(note => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.musicGainNode);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(note.freq, currentTime);
                gainNode.gain.setValueAtTime(0.15, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration / 1000);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration / 1000);
                
                this.currentOscillators.push(oscillator);
                
                currentTime += note.duration / 1000;
            });

            if (track.loop && this.isPlaying) {
                const delay = currentTime * 1000 - this.audioContext.currentTime * 1000 + 100;
                this.currentTrackTimeout = setTimeout(playNotes, Math.max(0, delay));
            }
        };

        playNotes();
    }

    toggleMusic() {
        const selectedTrack = this.musicSelect.value;
        if (selectedTrack === 'none') {
            alert('Please select a music track first');
            return;
        }

        this.isPlaying = !this.isPlaying;
        this.musicToggle.textContent = this.isPlaying ? '⏸️' : '▶️';
        
        if (this.isPlaying) {
            this.playMusicTrack(selectedTrack);
            localStorage.setItem('pixelPuzzleMusicTrack', selectedTrack);
            localStorage.setItem('pixelPuzzleMusicPlaying', 'true');
        } else {
            this.stopMusicTrack();
            localStorage.setItem('pixelPuzzleMusicPlaying', 'false');
        }
    }

    loadMusicTrack() {
        // Stop current track when selecting a new one
        this.stopMusicTrack();
        this.isPlaying = false;
        this.musicToggle.textContent = '▶️';
        localStorage.setItem('pixelPuzzleMusicTrack', this.musicSelect.value);
    }

    loadSavedMusicSettings() {
        const savedTrack = localStorage.getItem('pixelPuzzleMusicTrack') || 'none';
        const wasPlaying = localStorage.getItem('pixelPuzzleMusicPlaying') === 'true';
        
        this.musicSelect.value = savedTrack;
        if (wasPlaying && savedTrack !== 'none') {
            this.toggleMusic();
        }
    }

    // ===== CONFETTI EXPLOSION METHODS =====
    triggerConfetti() {
        const confettiCount = 100;
        const confettiDuration = 3000;
        
        for (let i = 0; i < confettiCount; i++) {
            this.createConfetti();
        }
    }

    createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = this.getRandomColor();
        confetti.style.opacity = Math.random() * 0.7 + 0.3;
        confetti.style.width = Math.random() * 6 + 4 + 'px';
        confetti.style.height = Math.random() * 6 + 4 + 'px';
        
        const duration = Math.random() * 2000 + 1000;
        const delay = Math.random() * 0.3;
        
        confetti.style.animation = `fall ${duration}ms linear ${delay}s forwards`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), duration + delay * 1000 + 100);
    }

    getRandomColor() {
        const colors = ['#00d4ff', '#00ff88', '#ff00ff', '#ffff00', '#ff6600', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // ===== CUSTOM SHAPES METHODS =====
    cutPuzzleWithShapes() {
        if (!this.image) return;

        if (this.shapeMode === 'squares') {
            this.cutSquarePuzzle();
        } else if (this.shapeMode === 'triangles') {
            this.cutTrianglePuzzle();
        } else if (this.shapeMode === 'hexagons') {
            this.cutHexagonPuzzle();
        }
    }

    cutSquarePuzzle() {
        this.resetTimer();
        const cellWidth = this.imageCanvas.width / this.gridSize;
        const cellHeight = this.imageCanvas.height / this.gridSize;

        this.puzzlePieces = [];
        this.storageContainer.innerHTML = '';
        this.correctPositions = {};

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.pieceSize;
                tempCanvas.height = this.pieceSize;
                const ctx = tempCanvas.getContext('2d');

                ctx.drawImage(
                    this.imageCanvas,
                    col * cellWidth,
                    row * cellHeight,
                    cellWidth,
                    cellHeight,
                    0,
                    0,
                    this.pieceSize,
                    this.pieceSize
                );

                const pieceData = {
                    id: `piece-${row}-${col}`,
                    image: tempCanvas.toDataURL(),
                    row,
                    col,
                    correctIndex: row * this.gridSize + col,
                    shape: 'square'
                };

                this.puzzlePieces.push(pieceData);
                this.correctPositions[pieceData.id] = pieceData.correctIndex;
            }
        }

        this.shufflePieces();
        this.setupAssemblyField();
        this.populateStorage();
        
        const totalPieces = this.gridSize * this.gridSize;
        const difficulty = this.difficultySelect.value;
        this.statusText.textContent = `${difficulty.toUpperCase()}: ${totalPieces} pieces ready! Drag to assemble.`;
    }

    cutTrianglePuzzle() {
        this.resetTimer();
        this.puzzlePieces = [];
        this.storageContainer.innerHTML = '';
        this.correctPositions = {};

        const cellWidth = this.imageCanvas.width / this.gridSize;
        const cellHeight = this.imageCanvas.height / this.gridSize;
        let pieceIndex = 0;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                // Each square cell gets 2 triangles
                for (let tri = 0; tri < 2; tri++) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = this.pieceSize;
                    tempCanvas.height = this.pieceSize;
                    const ctx = tempCanvas.getContext('2d');

                    ctx.beginPath();
                    if (tri === 0) {
                        // Upper-left triangle
                        ctx.moveTo(0, 0);
                        ctx.lineTo(this.pieceSize, 0);
                        ctx.lineTo(0, this.pieceSize);
                    } else {
                        // Lower-right triangle
                        ctx.moveTo(this.pieceSize, 0);
                        ctx.lineTo(this.pieceSize, this.pieceSize);
                        ctx.lineTo(0, this.pieceSize);
                    }
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(
                        this.imageCanvas,
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight,
                        0,
                        0,
                        this.pieceSize,
                        this.pieceSize
                    );

                    const pieceData = {
                        id: `piece-${row}-${col}-${tri}`,
                        image: tempCanvas.toDataURL(),
                        row,
                        col,
                        triIndex: tri,
                        correctIndex: pieceIndex,
                        shape: 'triangle'
                    };

                    this.puzzlePieces.push(pieceData);
                    this.correctPositions[pieceData.id] = pieceData.correctIndex;
                    pieceIndex++;
                }
            }
        }

        this.shufflePieces();
        this.setupAssemblyField();
        this.populateStorage();
        
        const totalPieces = this.gridSize * this.gridSize * 2;
        const difficulty = this.difficultySelect.value;
        this.statusText.textContent = `${difficulty.toUpperCase()}: ${totalPieces} triangles ready! Drag to assemble.`;
    }

    cutHexagonPuzzle() {
        this.resetTimer();
        this.puzzlePieces = [];
        this.storageContainer.innerHTML = '';
        this.correctPositions = {};

        const cellWidth = this.imageCanvas.width / this.gridSize;
        const cellHeight = this.imageCanvas.height / this.gridSize;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.pieceSize;
                tempCanvas.height = this.pieceSize;
                const ctx = tempCanvas.getContext('2d');

                // Draw hexagon clip path
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = this.pieceSize / 2 + (this.pieceSize / 2) * Math.cos(angle);
                    const y = this.pieceSize / 2 + (this.pieceSize / 2) * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(
                    this.imageCanvas,
                    col * cellWidth,
                    row * cellHeight,
                    cellWidth,
                    cellHeight,
                    0,
                    0,
                    this.pieceSize,
                    this.pieceSize
                );

                const pieceData = {
                    id: `piece-${row}-${col}`,
                    image: tempCanvas.toDataURL(),
                    row,
                    col,
                    correctIndex: row * this.gridSize + col,
                    shape: 'hexagon'
                };

                this.puzzlePieces.push(pieceData);
                this.correctPositions[pieceData.id] = pieceData.correctIndex;
            }
        }

        this.shufflePieces();
        this.setupAssemblyField();
        this.populateStorage();
        
        const totalPieces = this.gridSize * this.gridSize;
        const difficulty = this.difficultySelect.value;
        this.statusText.textContent = `${difficulty.toUpperCase()}: ${totalPieces} hexagons ready! Drag to assemble.`;
    }

    updateDifficulty() {
        const difficulty = this.difficultySelect.value;
        const settings = this.difficultyMap[difficulty];
        this.gridSize = settings.size;
        this.pieceSize = settings.pieceSize;

        if (this.image && this.puzzlePieces.length > 0) {
            this.cutPuzzle();
        }
    }

    handleImageUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.setupCanvas();
                this.statusText.textContent = 'Image loaded. Ready to cut!';
                this.cutButton.disabled = false;
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
        this.statusText.textContent = 'Loading image...';
    }

    setupCanvas() {
        const containerWidth = this.imageCanvas.parentElement.offsetWidth - 10;
        const containerHeight = this.imageCanvas.parentElement.offsetHeight - 10;
        
        const scale = Math.min(containerWidth / this.image.width, containerHeight / this.image.height);
        const newWidth = this.image.width * scale;
        const newHeight = this.image.height * scale;

        this.imageCanvas.width = newWidth;
        this.imageCanvas.height = newHeight;

        this.imageCtx.drawImage(this.image, 0, 0, newWidth, newHeight);
    }

    cutPuzzle() {
        this.cutPuzzleWithShapes();
    }

    shufflePieces() {
        for (let i = this.puzzlePieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.puzzlePieces[i], this.puzzlePieces[j]] = [this.puzzlePieces[j], this.puzzlePieces[i]];
        }
    }

    populateStorage() {
        this.storageContainer.innerHTML = '';

        this.puzzlePieces.forEach((pieceData) => {
            const storagePiece = document.createElement('div');
            storagePiece.className = 'storage-piece';
            storagePiece.id = pieceData.id;
            storagePiece.dataset.pieceId = pieceData.id;
            storagePiece.style.backgroundImage = `url('${pieceData.image}')`;
            storagePiece.style.width = `${this.pieceSize}px`;
            storagePiece.style.height = `${this.pieceSize}px`;
            storagePiece.draggable = true;

            storagePiece.addEventListener('dragstart', (e) => {
                if (!this.timerStarted) this.startTimer();
                this.draggedPiece = pieceData;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/json', JSON.stringify(pieceData));
                storagePiece.style.opacity = '0.6';
            });

            storagePiece.addEventListener('dragend', () => {
                storagePiece.style.opacity = '1';
                this.draggedPiece = null;
            });

            this.storageContainer.appendChild(storagePiece);
        });
    }

    setupAssemblyField() {
        this.assemblyGrid.innerHTML = '';
        this.assemblyGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.assemblyGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        this.cellPositions = {};
        this.pieceRotations = {};

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'assembly-cell';
            cell.dataset.cellIndex = i;
            cell.style.width = `${this.pieceSize}px`;
            cell.style.height = `${this.pieceSize}px`;

            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                cell.classList.add('drag-over');
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drag-over');
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');

                try {
                    const data = e.dataTransfer.getData('application/json');
                    const pieceData = JSON.parse(data);
                    const fromCellIndex = e.dataTransfer.getData('cellIndex');
                    
                    if (fromCellIndex) {
                        // Moving from another cell
                        this.movePieceBetweenCells(cell, parseInt(fromCellIndex), pieceData);
                    } else {
                        // Moving from storage
                        this.placePieceInCell(cell, pieceData);
                    }
                } catch (err) {
                    console.error('Drop error:', err);
                }
            });

            cell.addEventListener('click', () => {
                if (cell.dataset.currentPiece) {
                    this.draggedFromCell = cell;
                    // Show rotate hint briefly
                    const hint = document.createElement('div');
                    hint.style.position = 'fixed';
                    hint.style.left = event.clientX + 'px';
                    hint.style.top = event.clientY + 'px';
                    hint.textContent = 'Press R to rotate';
                    hint.style.background = '#00d4ff';
                    hint.style.color = '#000';
                    hint.style.padding = '5px 10px';
                    hint.style.borderRadius = '4px';
                    hint.style.fontSize = '0.8em';
                    hint.style.fontWeight = 'bold';
                    hint.style.zIndex = '10000';
                    hint.style.pointerEvents = 'none';
                    document.body.appendChild(hint);
                    setTimeout(() => hint.remove(), 2000);
                }
            });

            // Store cell position for snap-to-grid
            const rect = cell.getBoundingClientRect();
            this.cellPositions[i] = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                element: cell
            };

            this.assemblyGrid.appendChild(cell);
        }
    }

    rotatePiece(cell) {
        const pieceId = cell.dataset.currentPiece;
        if (!pieceId) return;

        const currentRotation = this.pieceRotations[pieceId] || 0;
        const newRotation = (currentRotation + 90) % 360;
        this.pieceRotations[pieceId] = newRotation;

        const content = cell.querySelector('.assembly-cell-content');
        if (content) {
            content.style.transform = `rotate(${newRotation}deg)`;
        } else {
            const filter = cell.style.filter;
            cell.style.filter = filter ? filter + ` rotate(${newRotation}deg)` : `rotate(${newRotation}deg)`;
        }

        this.playClickSound();
        this.statusText.textContent = `Piece rotated: ${newRotation}°`;
    }

    movePieceBetweenCells(targetCell, sourceCellIndex, pieceData) {
        const sourceCell = this.assemblyGrid.querySelector(`[data-cell-index="${sourceCellIndex}"]`);
        if (!sourceCell) return;

        // If target has a piece, swap them
        if (targetCell.dataset.currentPiece) {
            const targetPieceId = targetCell.dataset.currentPiece;
            const targetPiece = this.puzzlePieces.find(p => p.id === targetPieceId);
            const targetRotation = this.pieceRotations[targetPieceId];
            
            // Place target piece in source
            this.placePieceInCell(sourceCell, targetPiece);
            if (targetRotation) {
                this.pieceRotations[pieceData.id] = targetRotation;
            }
        } else {
            // Clear source cell
            sourceCell.style.backgroundImage = '';
            sourceCell.classList.remove('active', 'correct');
            sourceCell.dataset.currentPiece = '';
        }

        // Place source piece in target
        const sourceRotation = this.pieceRotations[pieceData.id];
        this.placePieceInCell(targetCell, pieceData);
        if (sourceRotation) {
            this.pieceRotations[pieceData.id] = sourceRotation;
        }

        this.draggedFromCell = null;
    }

    placePieceInCell(cell, pieceData) {
        const cellIndex = parseInt(cell.dataset.cellIndex);
        
        // If cell already has a piece, return it to storage
        if (cell.dataset.currentPiece) {
            const oldPieceId = cell.dataset.currentPiece;
            const oldPiece = this.puzzlePieces.find(p => p.id === oldPieceId);
            if (oldPiece) {
                this.returnPieceToStorage(oldPiece, cell);
            }
        }

        // Place new piece
        cell.style.backgroundImage = `url('${pieceData.image}')`;
        cell.classList.add('active');
        cell.dataset.currentPiece = pieceData.id;
        
        // Make cell draggable for moving pieces between cells
        cell.draggable = true;
        
        // Store the cell index for drag operations
        cell.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(pieceData));
            e.dataTransfer.setData('cellIndex', cellIndex.toString());
            cell.style.opacity = '0.6';
        }, { once: false });
        
        cell.addEventListener('dragend', () => {
            cell.style.opacity = '1';
        }, { once: false });

        // Remove from storage
        const storagePiece = document.getElementById(pieceData.id);
        if (storagePiece && storagePiece.parentElement === this.storageContainer) {
            this.storageContainer.removeChild(storagePiece);
        }

        // Check if piece is in correct position
        const isCorrect = pieceData.correctIndex === cellIndex;
        if (isCorrect) {
            cell.classList.add('correct');
            this.playSnapSound();
        } else {
            cell.classList.remove('correct');
            this.playClickSound();
        }

        this.checkPuzzleComplete();
    }

    returnPieceToStorage(pieceData, cell) {
        cell.style.backgroundImage = '';
        cell.classList.remove('active', 'correct');
        cell.dataset.currentPiece = '';

        const storagePiece = document.createElement('div');
        storagePiece.className = 'storage-piece';
        storagePiece.id = pieceData.id;
        storagePiece.dataset.pieceId = pieceData.id;
        storagePiece.style.backgroundImage = `url('${pieceData.image}')`;
        storagePiece.style.width = `${this.pieceSize}px`;
        storagePiece.style.height = `${this.pieceSize}px`;
        storagePiece.draggable = true;

        storagePiece.addEventListener('dragstart', (e) => {
            this.draggedPiece = pieceData;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(pieceData));
            storagePiece.style.opacity = '0.6';
        });

        storagePiece.addEventListener('dragend', () => {
            storagePiece.style.opacity = '1';
            this.draggedPiece = null;
        });

        this.storageContainer.appendChild(storagePiece);
    }

    checkPuzzleComplete() {
        const cells = this.assemblyGrid.querySelectorAll('.assembly-cell');
        const correctCells = this.assemblyGrid.querySelectorAll('.assembly-cell.correct');

        if (correctCells.length === this.gridSize * this.gridSize) {
            this.stopTimer();
            this.saveRecord();
            this.displayBestRecord();
            this.playVictorySound();
            this.triggerConfetti();
            
            const minutes = Math.floor(this.elapsedTime / 60000);
            const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
            const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            this.statusText.textContent = `🎉 Puzzle Complete! Time: ${timeStr}`;
            this.statusText.style.color = '#00ff88';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PixelPuzzle();
});

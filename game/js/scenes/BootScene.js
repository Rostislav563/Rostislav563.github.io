// Boot Scene - Asset loading and sprite generation
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Show loading progress
        const progressBar = document.querySelector('.loading-progress');
        
        this.load.on('progress', (value) => {
            progressBar.style.width = (value * 100) + '%';
        });
        
        this.load.on('complete', () => {
            document.getElementById('loading-screen').classList.add('hidden');
        });
        
        // Generate all sprites programmatically
        this.generateSprites();
    }
    
    generateSprites() {
        // Player sprite sheet (8 frames: idle, run x4, jump, attack x3)
        this.generatePlayerSprite();
        
        // Enemy sprites
        this.generateEnemySprite('slime', GAME_CONFIG.COLORS.ENEMY, 24);
        this.generateEnemySprite('skeleton', 0xcccccc, 28);
        this.generateEnemySprite('bat', 0x8b5cf6, 20);
        this.generateEnemySprite('golem', 0x78716c, 32);
        this.generateEnemySprite('wolf', 0x5d4e37, 26);
        this.generateEnemySprite('goblin', 0x2d8a4e, 22);
        this.generateEnemySprite('demon', 0xdc2626, 28);
        this.generateEnemySprite('ghost', 0x9ca3af, 24);
        
        // Boss sprite
        this.generateBossSprite();
        
        // Collectibles
        this.generateCollectibleSprite('coin', GAME_CONFIG.COLORS.COIN, 16);
        this.generateCollectibleSprite('heart', GAME_CONFIG.COLORS.HEART, 16);
        this.generateCollectibleSprite('gem', 0xa855f7, 16);
        this.generateCollectibleSprite('crystal', GAME_CONFIG.COLORS.CRYSTAL, 20);
        
        // Portal
        this.generatePortalSprite();
        
        // Projectile
        this.generateProjectileSprite();
        
        // Tiles
        this.generateTileSprites();
    }
    
    generatePlayerSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frameWidth = 32;
        const frameHeight = 32;
        const frames = 8;
        
        canvas.width = frameWidth * frames;
        canvas.height = frameHeight;
        
        for (let i = 0; i < frames; i++) {
            const x = i * frameWidth;
            
            ctx.fillStyle = '#4ade80'; // Green hero
            
            // Body
            ctx.fillRect(x + 10, 8, 12, 16);
            
            // Head
            ctx.fillStyle = '#fcd34d';
            ctx.fillRect(x + 11, 2, 10, 10);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 13, 5, 2, 2);
            ctx.fillRect(x + 17, 5, 2, 2);
            
            // Legs (animated for run frames)
            ctx.fillStyle = '#4ade80';
            if (i >= 1 && i <= 4) {
                // Running animation
                const legOffset = Math.sin(i * Math.PI / 2) * 3;
                ctx.fillRect(x + 11, 24, 4, 6 + legOffset);
                ctx.fillRect(x + 17, 24, 4, 6 - legOffset);
            } else if (i === 4) {
                // Jump
                ctx.fillRect(x + 11, 22, 4, 6);
                ctx.fillRect(x + 17, 22, 4, 6);
            } else if (i >= 5) {
                // Attack frames
                ctx.fillRect(x + 11, 24, 4, 6);
                ctx.fillRect(x + 17, 24, 4, 6);
                // Sword
                ctx.fillStyle = '#60a5fa';
                ctx.fillRect(x + 24, 10 - (i - 5) * 4, 8, 4);
            } else {
                // Idle
                ctx.fillRect(x + 11, 24, 4, 6);
                ctx.fillRect(x + 17, 24, 4, 6);
            }
        }
        
        this.textures.addSpriteSheet('player', canvas, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    
    generateEnemySprite(name, color, size) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = 5;
        
        canvas.width = 32 * frames;
        canvas.height = 32;
        
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        
        for (let i = 0; i < frames; i++) {
            const x = i * 32;
            const bounce = Math.sin(i * Math.PI / 2) * 2;
            
            ctx.fillStyle = hexColor;
            
            if (name === 'slime') {
                // Blob shape
                ctx.beginPath();
                ctx.ellipse(x + 16, 24 - bounce, size / 2, size / 2.5 + bounce, 0, 0, Math.PI * 2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 10, 18, 4, 4);
                ctx.fillRect(x + 18, 18, 4, 4);
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 11, 19, 2, 2);
                ctx.fillRect(x + 19, 19, 2, 2);
            } else if (name === 'skeleton') {
                // Skeleton body
                ctx.fillRect(x + 12, 4, 8, 8); // Skull
                ctx.fillRect(x + 14, 12, 4, 12); // Spine
                ctx.fillRect(x + 8, 14, 16, 4); // Ribs
                ctx.fillRect(x + 12, 24, 3, 6); // Leg
                ctx.fillRect(x + 17, 24, 3, 6);
                // Eye sockets
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 13, 6, 2, 2);
                ctx.fillRect(x + 17, 6, 2, 2);
            } else if (name === 'bat') {
                // Bat body
                ctx.fillRect(x + 14, 14, 4, 6);
                // Wings
                const wingSpread = 6 + Math.sin(i * Math.PI) * 4;
                ctx.fillRect(x + 4, 12, wingSpread, 4);
                ctx.fillRect(x + 24 - wingSpread, 12, wingSpread, 4);
                // Eyes
                ctx.fillStyle = '#ff0';
                ctx.fillRect(x + 13, 12, 2, 2);
                ctx.fillRect(x + 17, 12, 2, 2);
            } else if (name === 'golem') {
                // Big rocky body
                ctx.fillRect(x + 8, 6, 16, 18);
                ctx.fillRect(x + 6, 10, 20, 10);
                ctx.fillRect(x + 10, 24, 5, 6);
                ctx.fillRect(x + 17, 24, 5, 6);
                // Eyes
                ctx.fillStyle = '#f00';
                ctx.fillRect(x + 11, 10, 3, 3);
                ctx.fillRect(x + 18, 10, 3, 3);
            } else if (name === 'wolf') {
                // Wolf body - quadruped
                ctx.fillRect(x + 6, 14, 20, 10); // Body
                ctx.fillRect(x + 22, 10, 8, 8); // Head
                // Legs
                const legMove = Math.sin(i * Math.PI) * 2;
                ctx.fillRect(x + 8, 24, 3, 6 + legMove);
                ctx.fillRect(x + 14, 24, 3, 6 - legMove);
                ctx.fillRect(x + 20, 24, 3, 6 + legMove);
                // Tail
                ctx.fillRect(x + 2, 12, 6, 3);
                // Eyes
                ctx.fillStyle = '#ff0';
                ctx.fillRect(x + 24, 11, 2, 2);
                // Ears
                ctx.fillStyle = hexColor;
                ctx.fillRect(x + 23, 6, 3, 4);
                ctx.fillRect(x + 27, 6, 3, 4);
            } else if (name === 'goblin') {
                // Small humanoid
                ctx.fillRect(x + 12, 8, 8, 8); // Head
                ctx.fillRect(x + 13, 16, 6, 10); // Body
                ctx.fillRect(x + 11, 26, 4, 5); // Legs
                ctx.fillRect(x + 17, 26, 4, 5);
                // Big ears
                ctx.fillRect(x + 8, 6, 4, 6);
                ctx.fillRect(x + 20, 6, 4, 6);
                // Eyes
                ctx.fillStyle = '#ff0';
                ctx.fillRect(x + 13, 10, 2, 2);
                ctx.fillRect(x + 17, 10, 2, 2);
                // Weapon (club)
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x + 22, 14 + bounce, 6, 4);
            } else if (name === 'demon') {
                // Demon with horns
                ctx.fillRect(x + 11, 10, 10, 10); // Head
                ctx.fillRect(x + 12, 20, 8, 10); // Body
                // Horns
                ctx.fillRect(x + 9, 4, 3, 8);
                ctx.fillRect(x + 20, 4, 3, 8);
                // Legs
                ctx.fillRect(x + 12, 30, 3, 4);
                ctx.fillRect(x + 17, 30, 3, 4);
                // Wings
                const wingSize = 4 + Math.sin(i * Math.PI) * 2;
                ctx.fillRect(x + 4, 18, wingSize, 6);
                ctx.fillRect(x + 24, 18, wingSize, 6);
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 13, 13, 2, 2);
                ctx.fillRect(x + 17, 13, 2, 2);
            } else if (name === 'ghost') {
                // Ghostly shape
                ctx.globalAlpha = 0.7;
                // Wavy body
                ctx.beginPath();
                ctx.ellipse(x + 16, 16, 10, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(x + 6, 14, 20, 12);
                // Wavy bottom
                for (let w = 0; w < 4; w++) {
                    const waveY = Math.sin((i + w) * Math.PI / 2) * 2;
                    ctx.fillRect(x + 6 + w * 5, 26 + waveY, 5, 4);
                }
                ctx.globalAlpha = 1;
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 11, 14, 3, 3);
                ctx.fillRect(x + 18, 14, 3, 3);
            }
        }
        
        // Add as spritesheet, not just canvas
        this.textures.addSpriteSheet('enemy_' + name, canvas, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    
    generateBossSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = 7;
        
        canvas.width = 64 * frames;
        canvas.height = 64;
        
        for (let i = 0; i < frames; i++) {
            const x = i * 64;
            
            // Dark mage body
            ctx.fillStyle = '#4c1d95';
            ctx.fillRect(x + 20, 16, 24, 32);
            
            // Robe
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(x + 16, 48);
            ctx.lineTo(x + 32, 20);
            ctx.lineTo(x + 48, 48);
            ctx.fill();
            
            // Hood
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.arc(x + 32, 18, 14, Math.PI, 0);
            ctx.fill();
            
            // Face (shadowed)
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 24, 14, 16, 12);
            
            // Glowing eyes
            ctx.fillStyle = i >= 2 && i <= 5 ? '#ff0' : '#f00';
            ctx.fillRect(x + 26, 18, 4, 3);
            ctx.fillRect(x + 34, 18, 4, 3);
            
            // Staff
            ctx.fillStyle = '#78350f';
            ctx.fillRect(x + 50, 8, 4, 48);
            // Crystal on staff
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.moveTo(x + 52, 8);
            ctx.lineTo(x + 46, 16);
            ctx.lineTo(x + 52, 24);
            ctx.lineTo(x + 58, 16);
            ctx.closePath();
            ctx.fill();
        }
        
        this.textures.addSpriteSheet('boss', canvas, {
            frameWidth: 64,
            frameHeight: 64
        });
    }
    
    generateCollectibleSprite(name, color, size) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = 4;
        
        canvas.width = 32 * frames;
        canvas.height = 32;
        
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        
        for (let i = 0; i < frames; i++) {
            const x = i * 32;
            const scale = 1 - Math.abs(i - 1.5) * 0.2; // Spinning effect
            
            ctx.fillStyle = hexColor;
            
            if (name === 'coin') {
                ctx.beginPath();
                ctx.ellipse(x + 16, 16, size / 2 * scale, size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.ellipse(x + 16, 16, size / 3 * scale, size / 3, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (name === 'heart') {
                ctx.beginPath();
                ctx.moveTo(x + 16, 24);
                ctx.bezierCurveTo(x + 8, 16, x + 8, 8, x + 16, 12);
                ctx.bezierCurveTo(x + 24, 8, x + 24, 16, x + 16, 24);
                ctx.fill();
            } else if (name === 'crystal') {
                ctx.beginPath();
                ctx.moveTo(x + 16, 6);
                ctx.lineTo(x + 8, 16);
                ctx.lineTo(x + 16, 26);
                ctx.lineTo(x + 24, 16);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#93c5fd';
                ctx.beginPath();
                ctx.moveTo(x + 16, 10);
                ctx.lineTo(x + 12, 16);
                ctx.lineTo(x + 16, 22);
                ctx.lineTo(x + 20, 16);
                ctx.closePath();
                ctx.fill();
            } else if (name === 'gem') {
                ctx.beginPath();
                ctx.moveTo(x + 16, 7);
                ctx.lineTo(x + 9, 15);
                ctx.lineTo(x + 13, 25);
                ctx.lineTo(x + 19, 25);
                ctx.lineTo(x + 23, 15);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ddd6fe';
                ctx.beginPath();
                ctx.moveTo(x + 16, 11);
                ctx.lineTo(x + 13, 16);
                ctx.lineTo(x + 16, 22);
                ctx.lineTo(x + 19, 16);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        this.textures.addSpriteSheet(name, canvas, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    
    generatePortalSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = 8;
        
        canvas.width = 48 * frames;
        canvas.height = 64;
        
        for (let i = 0; i < frames; i++) {
            const x = i * 48;
            const rotation = i * Math.PI / 4;
            
            // Outer ring
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(x + 24, 32, 20, 28, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner swirl
            ctx.fillStyle = '#c4b5fd';
            for (let j = 0; j < 3; j++) {
                const angle = rotation + j * (Math.PI * 2 / 3);
                const px = x + 24 + Math.cos(angle) * 10;
                const py = 32 + Math.sin(angle) * 14;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Center glow
            const gradient = ctx.createRadialGradient(x + 24, 32, 0, x + 24, 32, 15);
            gradient.addColorStop(0, 'rgba(167, 139, 250, 0.8)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + 24, 32, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.textures.addSpriteSheet('portal', canvas, {
            frameWidth: 48,
            frameHeight: 64
        });
    }
    
    generateProjectileSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 16;
        canvas.height = 16;
        
        // Purple energy ball
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, '#f0abfc');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#4c1d95');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        this.textures.addCanvas('projectile', canvas);
    }
    
    generateTileSprites() {
        // Ground tile
        const groundCanvas = document.createElement('canvas');
        const gCtx = groundCanvas.getContext('2d');
        groundCanvas.width = 32;
        groundCanvas.height = 32;
        
        gCtx.fillStyle = '#78716c';
        gCtx.fillRect(0, 0, 32, 32);
        gCtx.fillStyle = '#57534e';
        gCtx.fillRect(0, 0, 32, 4);
        gCtx.fillStyle = '#44403c';
        for (let i = 0; i < 5; i++) {
            gCtx.fillRect(Math.random() * 28, Math.random() * 28 + 4, 4, 4);
        }
        
        this.textures.addCanvas('ground', groundCanvas);
        
        // Platform tile
        const platCanvas = document.createElement('canvas');
        const pCtx = platCanvas.getContext('2d');
        platCanvas.width = 32;
        platCanvas.height = 32;
        
        pCtx.fillStyle = '#64748b';
        pCtx.fillRect(0, 0, 32, 32);
        pCtx.fillStyle = '#94a3b8';
        pCtx.fillRect(0, 0, 32, 6);
        pCtx.fillStyle = '#475569';
        pCtx.fillRect(0, 28, 32, 4);
        
        this.textures.addCanvas('platform', platCanvas);
        
        // Spike
        const spikeCanvas = document.createElement('canvas');
        const sCtx = spikeCanvas.getContext('2d');
        spikeCanvas.width = 32;
        spikeCanvas.height = 24;
        
        sCtx.fillStyle = '#dc2626';
        for (let i = 0; i < 4; i++) {
            sCtx.beginPath();
            sCtx.moveTo(i * 8, 24);
            sCtx.lineTo(i * 8 + 4, 4);
            sCtx.lineTo(i * 8 + 8, 24);
            sCtx.fill();
        }
        
        this.textures.addCanvas('spike', spikeCanvas);
        
        // Background far layer (simple gradient pattern)
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        bgCanvas.width = 64;
        bgCanvas.height = 64;
        
        // Simple pattern for tiling
        bgCtx.fillStyle = '#1a1a2e';
        bgCtx.fillRect(0, 0, 64, 64);
        bgCtx.fillStyle = '#16213e';
        bgCtx.fillRect(0, 32, 64, 32);
        
        // Some stars/dots
        bgCtx.fillStyle = '#ffffff';
        bgCtx.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
            const sx = Math.random() * 60 + 2;
            const sy = Math.random() * 60 + 2;
            bgCtx.fillRect(sx, sy, 2, 2);
        }
        bgCtx.globalAlpha = 1;
        
        this.textures.addCanvas('bg_far', bgCanvas);
    }
    
    create() {
        // Add frame data for sprite sheets
        this.textures.get('player').add(0, 0, 0, 0, 32, 32);
        for (let i = 0; i < 8; i++) {
            this.textures.get('player').add(i, 0, i * 32, 0, 32, 32);
        }
        
        ['slime', 'skeleton', 'bat', 'golem'].forEach(enemy => {
            for (let i = 0; i < 5; i++) {
                this.textures.get('enemy_' + enemy).add(i, 0, i * 32, 0, 32, 32);
            }
        });
        
        for (let i = 0; i < 7; i++) {
            this.textures.get('boss').add(i, 0, i * 64, 0, 64, 64);
        }
        
        ['coin', 'heart', 'crystal'].forEach(item => {
            for (let i = 0; i < 4; i++) {
                this.textures.get(item).add(i, 0, i * 32, 0, 32, 32);
            }
        });
        
        for (let i = 0; i < 8; i++) {
            this.textures.get('portal').add(i, 0, i * 48, 0, 48, 64);
        }
        
        // Start menu
        this.scene.start('MenuScene');
    }
}

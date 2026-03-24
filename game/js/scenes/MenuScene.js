// Menu Scene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    init(data) {
        this.gameOver = data?.gameOver || false;
        this.victory = data?.victory || false;
    }
    
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Background
        this.cameras.main.setBackgroundColor(0x0a0a15);
        
        // Animated background particles
        this.createParticles();
        
        // Decorative pixel border
        this.createBorder();
        
        // Title with retro style
        const title = this.add.text(centerX, 120, 'CRYSTAL', {
            fontSize: '48px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#8b5cf6',
            stroke: '#1a1a2e',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const titleQuest = this.add.text(centerX, 180, 'QUEST', {
            fontSize: '48px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#fbbf24',
            stroke: '#1a1a2e',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Pulsing effect
        this.tweens.add({
            targets: [title, titleQuest],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle / Status
        let subtitle = 'RETURN THE CRYSTAL OF LIGHT';
        let subtitleColor = '#a78bfa';
        
        if (this.gameOver) {
            subtitle = '- GAME OVER -';
            subtitleColor = '#ef4444';
        } else if (this.victory) {
            subtitle = '- VICTORY -';
            subtitleColor = '#4ade80';
        }
        
        this.add.text(centerX, 240, subtitle, {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: subtitleColor
        }).setOrigin(0.5);
        
        // Menu buttons with pixel style
        const buttonY = centerY + 60;
        
        // Play button
        const playBtnBg = this.add.rectangle(centerX, buttonY, 280, 55, 0x4c1d95);
        const playBtn = this.add.text(centerX, buttonY, this.gameOver || this.victory ? 'RETRY' : 'START GAME', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        playBtnBg.setInteractive({ useHandCursor: true });
        this.addButtonEffects(playBtnBg, playBtn, () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene', { level: 1 });
            });
        });
        
        // Controls info
        this.add.text(centerX, centerY + 140, 'CONTROLS', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#6366f1'
        }).setOrigin(0.5);
        
        const controls = [
            ['MOVE', '← →  or  A D'],
            ['JUMP', '↑  W  SPACE'],
            ['ATTACK', 'X  or  J'],
            ['DASH', 'SHIFT'],
            ['PAUSE', 'ESC']
        ];
        
        controls.forEach((ctrl, i) => {
            this.add.text(centerX - 140, centerY + 175 + i * 28, ctrl[0], {
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#9ca3af'
            });
            this.add.text(centerX + 140, centerY + 175 + i * 28, ctrl[1], {
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#d1d5db'
            }).setOrigin(1, 0);
        });
        
        // Version/Credits
        this.add.text(centerX, this.cameras.main.height - 30, 'v1.0  A FANTASY PLATFORMER', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#4b5563'
        }).setOrigin(0.5);
        
        // Press start blink
        const pressStart = this.add.text(centerX, buttonY + 80, '- PRESS ENTER TO START -', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#fbbf24'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: pressStart,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Keyboard start
        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene', { level: 1 });
            });
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene', { level: 1 });
            });
        });
    }
    
    createBorder() {
        const g = this.add.graphics();
        g.lineStyle(5, 0x4c1d95);
        g.strokeRect(25, 25, this.cameras.main.width - 50, this.cameras.main.height - 50);
        g.lineStyle(3, 0x8b5cf6);
        g.strokeRect(30, 30, this.cameras.main.width - 60, this.cameras.main.height - 60);
    }
    
    createParticles() {
        for (let i = 0; i < 30; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(40, this.cameras.main.width - 40),
                Phaser.Math.Between(40, this.cameras.main.height - 40),
                3, 3,
                0x8b5cf6,
                Phaser.Math.FloatBetween(0.2, 0.6)
            );
            
            this.tweens.add({
                targets: star,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
    
    addButtonEffects(bg, text, callback) {
        bg.on('pointerover', () => {
            bg.setFillStyle(0x6d28d9);
            text.setScale(1.1);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x4c1d95);
            text.setScale(1);
        });
        
        bg.on('pointerdown', callback);
    }
}

// UI Scene - HUD overlay with pixel perfect styling
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    init(data) {
        this.currentLevel = data?.level || 1;
        this.levelName = data?.levelName || '';
        this.playerHealth = data?.health || GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.playerCoins = data?.coins || 0;
        this.hasBoss = data?.hasBoss || false;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // ========== TOP LEFT: HP & GOLD ==========
        // Health background panel
        const hpPanel = this.add.graphics();
        hpPanel.fillStyle(0x000000, 0.7);
        hpPanel.fillRoundedRect(10, 10, 220, 55, 8);
        hpPanel.lineStyle(2, 0xf43f5e, 0.8);
        hpPanel.strokeRoundedRect(10, 10, 220, 55, 8);
        
        // HP Label
        this.add.text(20, 18, 'HP', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#f43f5e'
        });
        
        // Hearts
        this.hearts = [];
        for (let i = 0; i < GAME_CONFIG.PLAYER.MAX_HEALTH; i++) {
            const heart = this.add.text(55 + i * 32, 15, '♥', { 
                fontSize: '24px',
                color: '#f43f5e'
            });
            this.hearts.push(heart);
        }
        this.updateHealth(this.playerHealth);
        
        // Gold display
        this.add.text(20, 42, '💰', { fontSize: '16px' });
        this.coinText = this.add.text(45, 43, `${this.playerCoins}`, {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#fbbf24'
        });
        
        // ========== TOP CENTER: LEVEL NAME ==========
        const levelPanel = this.add.graphics();
        levelPanel.fillStyle(0x000000, 0.7);
        levelPanel.fillRoundedRect(width/2 - 120, 10, 240, 50, 8);
        levelPanel.lineStyle(2, 0x8b5cf6, 0.8);
        levelPanel.strokeRoundedRect(width/2 - 120, 10, 240, 50, 8);
        
        this.add.text(width / 2, 22, `LEVEL ${this.currentLevel}`, {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#8b5cf6'
        }).setOrigin(0.5, 0);
        
        this.add.text(width / 2, 42, this.levelName.toUpperCase(), {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#a78bfa'
        }).setOrigin(0.5, 0);

        // ========== LEVEL PROGRESS ==========
        const progressPanel = this.add.graphics();
        progressPanel.fillStyle(0x000000, 0.55);
        progressPanel.fillRoundedRect(width / 2 - 120, 64, 240, 16, 8);
        progressPanel.lineStyle(2, 0x38bdf8, 0.8);
        progressPanel.strokeRoundedRect(width / 2 - 120, 64, 240, 16, 8);

        this.progressText = this.add.text(width / 2, 57, 'PROGRESS 0%', {
            fontSize: '8px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#38bdf8'
        }).setOrigin(0.5, 0);

        this.progressFill = this.add.rectangle(width / 2 - 112, 72, 1, 8, 0x4ade80).setOrigin(0, 0.5);
        this.updateProgress(0);

        // ========== TOP RIGHT: TIME & KILLS ==========
        const timePanel = this.add.graphics();
        timePanel.fillStyle(0x000000, 0.7);
        timePanel.fillRoundedRect(width - 200, 10, 190, 55, 8);
        timePanel.lineStyle(2, 0x4ade80, 0.8);
        timePanel.strokeRoundedRect(width - 200, 10, 190, 55, 8);
        
        // Timer icon and text
        this.add.text(width - 190, 18, '⏱️', { fontSize: '14px' });
        this.timeText = this.add.text(width - 165, 20, '00:00', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#4ade80'
        });
        
        // Difficulty tier
        this.difficultyText = this.add.text(width - 20, 20, 'CALM', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#4ade80'
        }).setOrigin(1, 0);
        
        // Kill counter
        this.add.text(width - 190, 42, '💀', { fontSize: '14px' });
        this.killText = this.add.text(width - 165, 44, 'KILLS: 0/15', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#a78bfa'
        });
        
        // ========== WAVE INDICATOR (center screen, hidden) ==========
        this.waveIndicator = this.add.text(width / 2, height / 2 - 100, '', {
            fontSize: '24px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ef4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(100);
        
        // ========== BOSS HEALTH BAR (bottom, hidden) ==========
        this.bossContainer = this.add.container(width / 2, height - 70);
        this.bossContainer.setVisible(false);
        this.bossContainer.setDepth(50);
        
        // Boss bar background
        const bossPanel = this.add.graphics();
        bossPanel.fillStyle(0x000000, 0.85);
        bossPanel.fillRoundedRect(-250, -35, 500, 60, 10);
        bossPanel.lineStyle(3, 0x7c3aed, 1);
        bossPanel.strokeRoundedRect(-250, -35, 500, 60, 10);
        
        this.bossNameText = this.add.text(0, -25, '👑 МОРВИН ТЁМНЫЙ 👑', {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ff6b6b'
        }).setOrigin(0.5);
        
        this.bossHealthBg = this.add.rectangle(0, 5, 460, 22, 0x1f1f1f);
        this.bossHealthBar = this.add.rectangle(-230, 5, 460, 18, 0x7c3aed).setOrigin(0, 0.5);
        
        this.bossContainer.add([bossPanel, this.bossNameText, this.bossHealthBg, this.bossHealthBar]);
        
        if (this.hasBoss) {
            this.bossContainer.setVisible(true);
        }
        
        // ========== CONTROLS HINT (bottom) ==========
        this.controlsHint = this.add.text(width / 2, height - 20, 
            '← → MOVE  |  ↑ JUMP  |  X ATTACK  |  SHIFT DASH  |  ESC PAUSE', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#9ca3af'
        }).setOrigin(0.5).setAlpha(0.8);
        
        // Fade out hint
        this.time.delayedCall(6000, () => {
            this.tweens.add({
                targets: this.controlsHint,
                alpha: 0,
                duration: 1000
            });
        });
        
        // ========== PAUSE MENU ==========
        this.createPauseMenu();
        
        // Listen for game scene events
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('resume', () => this.hidePauseMenu());
        }
    }
    
    createPauseMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.pauseContainer = this.add.container(width / 2, height / 2);
        this.pauseContainer.setVisible(false);
        this.pauseContainer.setDepth(1000);
        
        // Dark overlay
        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.85);
        
        // Menu panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 1);
        panel.fillRoundedRect(-180, -140, 360, 280, 12);
        panel.lineStyle(4, 0x8b5cf6, 1);
        panel.strokeRoundedRect(-180, -140, 360, 280, 12);
        
        // Inner border
        panel.lineStyle(2, 0x6366f1, 0.5);
        panel.strokeRoundedRect(-170, -130, 340, 260, 8);
        
        // Pause title
        const pauseTitle = this.add.text(0, -100, '⏸️ ПАУЗА', {
            fontSize: '24px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Menu buttons
        const menuItems = [
            { text: '▶ ПРОДОЛЖИТЬ', action: () => this.scene.get('GameScene').togglePause() },
            { text: '🔊 ЗВУК: ВКЛ', action: (btn) => {
                const muted = soundManager.toggleMute();
                btn.setText(muted ? '🔇 ЗВУК: ВЫКЛ' : '🔊 ЗВУК: ВКЛ');
            }},
            { text: '🚪 ВЫХОД', action: () => {
                this.scene.stop('GameScene');
                soundManager.stopMusic();
                this.scene.start('MenuScene');
            }}
        ];
        
        this.menuButtons = [];
        menuItems.forEach((item, index) => {
            // Button background
            const btnBg = this.add.rectangle(0, -30 + index * 55, 280, 45, 0x4c1d95, 1);
            btnBg.setStrokeStyle(2, 0x8b5cf6);
            btnBg.setInteractive({ useHandCursor: true });
            
            const btnText = this.add.text(0, -30 + index * 55, item.text, {
                fontSize: '12px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x6d28d9);
                btnText.setScale(1.05);
            });
            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x4c1d95);
                btnText.setScale(1);
            });
            btnBg.on('pointerdown', () => item.action(btnText));
            
            this.menuButtons.push(btnBg, btnText);
        });
        
        // ESC hint
        const escHint = this.add.text(0, 115, 'ESC - ПРОДОЛЖИТЬ', {
            fontSize: '8px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#6b7280'
        }).setOrigin(0.5);
        
        this.pauseContainer.add([overlay, panel, pauseTitle, ...this.menuButtons, escHint]);
    }
    
    updateHealth(health) {
        this.playerHealth = health;
        this.hearts.forEach((heart, index) => {
            if (index < health) {
                heart.setText('♥');
                heart.setColor('#f43f5e');
                heart.setAlpha(1);
            } else {
                heart.setText('♡');
                heart.setColor('#4b5563');
                heart.setAlpha(0.4);
            }
        });
        
        // Low health warning pulse
        if (health === 1 && this.hearts[0]) {
            this.tweens.add({
                targets: this.hearts[0],
                alpha: 0.3,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    updateCoins(coins) {
        this.playerCoins = coins;
        this.coinText.setText(`${coins}`);
        
        // Bounce animation
        this.tweens.add({
            targets: this.coinText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });
    }

    updateProgress(progress) {
        const clamped = Phaser.Math.Clamp(progress, 0, 1);
        const barWidth = 224 * clamped;
        const color = clamped > 0.8 ? 0xf59e0b : clamped > 0.5 ? 0x60a5fa : 0x4ade80;

        this.progressFill.setFillStyle(color, 1);
        this.progressFill.setDisplaySize(Math.max(1, barWidth), 8);
        this.progressText.setText(`PROGRESS ${Math.floor(clamped * 100)}%`);
    }
    
    updateKills(current, required) {
        if (current >= required) {
            this.killText.setText('✅ ПОРТАЛ ОТКРЫТ!');
            this.killText.setColor('#4ade80');
        } else {
            this.killText.setText(`KILLS: ${current}/${required}`);
            this.killText.setColor('#a78bfa');
        }
    }
    
    updateGameTime(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        this.timeText.setText(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        
        // Update difficulty tier
        if (typeof difficultyManager !== 'undefined') {
            const tier = difficultyManager.getTimeTier();
            this.difficultyText.setText(tier.name.toUpperCase());
            this.difficultyText.setColor(tier.color);
        }
    }
    
    showWaveIndicator(waveNumber) {
        this.waveIndicator.setText(`⚔️ WAVE ${waveNumber} ⚔️`);
        
        this.tweens.add({
            targets: this.waveIndicator,
            alpha: 1,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            hold: 1000,
            onComplete: () => {
                this.waveIndicator.setAlpha(0);
                this.waveIndicator.setScale(1);
            }
        });
    }
    
    updateBossHealth(health, maxHealth) {
        const percentage = Math.max(0, health / maxHealth);
        
        this.tweens.add({
            targets: this.bossHealthBar,
            scaleX: percentage,
            duration: 300,
            ease: 'Power2'
        });
        
        // Color based on health
        if (percentage <= 0.25) {
            this.bossHealthBar.setFillStyle(0xef4444);
        } else if (percentage <= 0.5) {
            this.bossHealthBar.setFillStyle(0xfbbf24);
        } else {
            this.bossHealthBar.setFillStyle(0x7c3aed);
        }
    }
    
    showPauseMenu() {
        this.pauseContainer.setVisible(true);
        this.pauseContainer.setAlpha(0);
        this.pauseContainer.setScale(0.9);
        
        this.tweens.add({
            targets: this.pauseContainer,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.easeOut'
        });
    }
    
    hidePauseMenu() {
        this.tweens.add({
            targets: this.pauseContainer,
            alpha: 0,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            onComplete: () => this.pauseContainer.setVisible(false)
        });
    }
}

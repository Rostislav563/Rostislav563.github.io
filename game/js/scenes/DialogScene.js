// Dialog Scene - Story dialogues
class DialogScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DialogScene' });
    }
    
    init(data) {
        this.lines = data?.lines || [];
        this.currentLine = 0;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Semi-transparent background
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        
        // Dialog box
        this.dialogBox = this.add.container(width / 2, height - 100);
        
        const boxBg = this.add.rectangle(0, 0, width - 80, 120, 0x1e1b4b, 0.95);
        boxBg.setStrokeStyle(3, 0x8b5cf6);
        
        // Dialog text
        this.dialogText = this.add.text(0, -20, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 120 }
        }).setOrigin(0.5);
        
        // Continue prompt
        this.continuePrompt = this.add.text(0, 40, '▼ Нажмите, чтобы продолжить ▼', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#a78bfa'
        }).setOrigin(0.5);
        
        // Blinking effect
        this.tweens.add({
            targets: this.continuePrompt,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        this.dialogBox.add([boxBg, this.dialogText, this.continuePrompt]);
        
        // Show first line
        this.showLine();
        
        // Input
        this.input.on('pointerdown', () => this.nextLine());
        this.input.keyboard.on('keydown-SPACE', () => this.nextLine());
        this.input.keyboard.on('keydown-ENTER', () => this.nextLine());
        this.input.keyboard.on('keydown-X', () => this.nextLine());
    }
    
    showLine() {
        if (this.currentLine < this.lines.length) {
            const line = this.lines[this.currentLine];
            this.dialogText.setText('');
            
            // Typewriter effect
            let charIndex = 0;
            this.typeTimer = this.time.addEvent({
                delay: 30,
                repeat: line.length - 1,
                callback: () => {
                    this.dialogText.setText(line.substring(0, charIndex + 1));
                    charIndex++;
                }
            });
        }
    }
    
    nextLine() {
        // If still typing, complete immediately
        if (this.typeTimer && !this.typeTimer.hasDispatched) {
            this.typeTimer.remove();
            this.dialogText.setText(this.lines[this.currentLine]);
            return;
        }
        
        this.currentLine++;
        
        if (this.currentLine >= this.lines.length) {
            this.closeDialog();
        } else {
            this.showLine();
        }
    }
    
    closeDialog() {
        // Fade out and resume game
        this.tweens.add({
            targets: [this.overlay, this.dialogBox],
            alpha: 0,
            duration: 300,
            onComplete: () => {
                // Resume the game scene
                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    this.scene.resume('GameScene');
                }
                this.scene.stop();
            }
        });
    }
}

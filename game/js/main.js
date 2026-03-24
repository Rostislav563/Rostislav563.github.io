// Main entry point - Phaser game configuration
document.addEventListener('DOMContentLoaded', () => {
    const config = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        parent: 'game-container',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: GAME_CONFIG.GRAVITY },
                debug: false
            }
        },
        scene: [
            BootScene,
            MenuScene,
            GameScene,
            UIScene,
            DialogScene
        ],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            min: {
                width: 800,
                height: 450
            },
            max: {
                width: 1920,
                height: 1080
            }
        },
        render: {
            antialias: false,
            pixelArt: true,
            roundPixels: true
        }
    };
    
    const game = new Phaser.Game(config);
    
    // Handle window focus
    window.addEventListener('blur', () => {
        if (game.scene.isActive('GameScene')) {
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene && !gameScene.isPaused) {
                gameScene.togglePause();
            }
        }
    });
});

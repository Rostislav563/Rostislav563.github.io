// Collectible items
class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'coin') {
        super(scene, x, y, type);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.value = this.getValueByType();
        
        // Physics
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        
        // Static display - no animation needed
        this.setFrame(0);
    }
    
    getValueByType() {
        switch (this.type) {
            case 'coin': return 1;
            case 'gem': return 5;
            case 'heart': return 1;
            case 'crystal': return 10;
            default: return 1;
        }
    }
    
    // No update needed - static coins
    update(time) {
        // Static - do nothing
    }
    
    collect(player) {
        switch (this.type) {
            case 'coin':
            case 'gem':
            case 'crystal':
                player.collectCoin(this.value);
                break;
            case 'heart':
                player.heal(1);
                break;
        }
        
        // Simple pop effect
        this.scene.tweens.add({
            targets: this,
            y: this.y - 20,
            alpha: 0,
            scale: 1.3,
            duration: 150,
            onComplete: () => this.destroy()
        });
    }
}

// Projectile for boss attacks
class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, speed = 200) {
        super(scene, x, y, 'projectile');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = 1;
        this.body.setAllowGravity(false);
        this.body.setSize(16, 16);
        
        // Set velocity based on angle
        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        this.setRotation(angle);
        
        // Destroy after timeout
        scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        });
    }
    
    hitPlayer(player) {
        player.takeDamage(this.damage);
        this.destroy();
    }
}

// End level portal
class Portal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'portal');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        
        this.isActive = false;
        this.setAlpha(0.75);
        
        // Create animation
        if (!scene.anims.exists('portal_spin')) {
            scene.anims.create({
                key: 'portal_spin',
                frames: scene.anims.generateFrameNumbers('portal', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.anims.play('portal_spin', true);
    }
    
    activate() {
        if (this.isActive) return;
        this.isActive = true;
        this.setAlpha(1);
        
        // Pulse effect
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    enter(player) {
        if (!this.isActive) return;
        
        this.scene.events.emit('levelComplete');
    }
}

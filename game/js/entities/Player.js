// Player class
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics setup
        this.body.setSize(20, 28);
        this.body.setOffset(6, 4);
        this.setCollideWorldBounds(true);
        
        // Player state
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.isAttacking = false;
        this.isInvincible = false;
        this.facingRight = true;
        this.coins = 0;
        this.fallingToDeath = false;
        
        // Combat
        this.canAttack = true;
        this.attackCooldown = 300;
        this.comboCount = 0;
        this.lastAttackTime = 0;
        
        // Dash ability
        this.canDash = true;
        this.isDashing = false;
        this.dashSpeed = 400;
        this.dashDuration = 150;
        this.dashCooldown = 800;
        
        // Jump improvements (coyote time, jump buffer)
        this.coyoteTime = 100;
        this.lastGroundedTime = 0;
        this.jumpBufferTime = 100;
        this.lastJumpPressTime = 0;
        this.hasDoubleJump = true;
        this.canDoubleJump = true;
        this.jumpCutMultiplier = 0.55;
        
        // Create attack hitbox
        this.attackHitbox = scene.add.rectangle(0, 0, GAME_CONFIG.PLAYER.ATTACK_RANGE, 28, 0xffffff, 0);
        scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);
        this.attackHitbox.body.enable = false;
        
        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.attackKey2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // Animations
        this.createAnimations(scene);
    }
    
    createAnimations(scene) {
        if (!scene.anims.exists('player_idle')) {
            scene.anims.create({
                key: 'player_idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 1
            });
            
            scene.anims.create({
                key: 'player_run',
                frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            
            scene.anims.create({
                key: 'player_jump',
                frames: [{ key: 'player', frame: 4 }],
                frameRate: 1
            });
            
            scene.anims.create({
                key: 'player_attack',
                frames: scene.anims.generateFrameNumbers('player', { start: 5, end: 7 }),
                frameRate: 15
            });
        }
    }
    
    update(time, delta) {
        if (!this.active) return;
        
        const onGround = this.body.blocked.down;
        const speed = GAME_CONFIG.PLAYER.SPEED;
        
        // Track grounded state for coyote time
        if (onGround) {
            this.lastGroundedTime = time;
            this.canDoubleJump = this.hasDoubleJump;
        }
        
        // Don't allow movement during dash
        if (this.isDashing) {
            this.updateAnimation(onGround);
            return;
        }
        
        // Horizontal movement
        let moveX = 0;
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            moveX = -1;
            this.facingRight = false;
            this.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            moveX = 1;
            this.facingRight = true;
            this.setFlipX(false);
        }
        
        this.setVelocityX(moveX * speed);
        
        // Jump with coyote time and jump buffer
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.wasd.up) || 
                           Phaser.Input.Keyboard.JustDown(this.jumpKey);
        const jumpHeld = this.cursors.up.isDown || this.wasd.up.isDown || this.jumpKey.isDown;
        
        if (jumpPressed) {
            this.lastJumpPressTime = time;
        }
        
        const canCoyoteJump = (time - this.lastGroundedTime) < this.coyoteTime;
        const hasJumpBuffer = (time - this.lastJumpPressTime) < this.jumpBufferTime;
        
        if ((jumpPressed || hasJumpBuffer) && (onGround || canCoyoteJump)) {
            this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY);
            this.lastJumpPressTime = 0;
            this.createJumpEffect();
        } else if (jumpPressed && this.canDoubleJump && !onGround) {
            // Double jump
            this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY * 0.85);
            this.canDoubleJump = false;
            this.createJumpEffect();
        }

        // Variable jump height: releasing jump early cuts the ascent short
        if (!jumpHeld && this.body.velocity.y < 0 && !onGround && !this.isDashing) {
            this.setVelocityY(this.body.velocity.y * this.jumpCutMultiplier);
        }
        
        // Dash
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && this.canDash) {
            this.performDash();
        }
        
        // Attack
        if ((Phaser.Input.Keyboard.JustDown(this.attackKey) || 
             Phaser.Input.Keyboard.JustDown(this.attackKey2)) && this.canAttack) {
            this.attack(time);
        }
        
        // Update attack hitbox position
        const hitboxOffsetX = this.facingRight ? 30 : -30;
        this.attackHitbox.setPosition(this.x + hitboxOffsetX, this.y);
        
        // Animations
        this.updateAnimation(onGround);
        
        // Visual feedback for invincibility
        if (this.isInvincible) {
            this.setAlpha(Math.sin(time * 0.02) * 0.3 + 0.7);
        } else {
            this.setAlpha(1);
        }
    }
    
    createJumpEffect() {
        // Dust particles
        for (let i = 0; i < 5; i++) {
            const dust = this.scene.add.circle(
                this.x + Phaser.Math.Between(-10, 10),
                this.y + 14,
                Phaser.Math.Between(2, 4),
                0xffffff, 0.6
            );
            this.scene.tweens.add({
                targets: dust,
                y: dust.y + 20,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    performDash() {
        this.isDashing = true;
        this.canDash = false;
        this.isInvincible = true;
        
        const dashDir = this.facingRight ? 1 : -1;
        this.setVelocityX(this.dashSpeed * dashDir);
        this.setVelocityY(0);
        this.body.setAllowGravity(false);
        
        // Dash trail effect
        this.setTint(0x60a5fa);
        
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const ghost = this.scene.add.sprite(this.x, this.y, 'player');
                ghost.setFlipX(!this.facingRight);
                ghost.setAlpha(0.5 - i * 0.15);
                ghost.setTint(0x60a5fa);
                this.scene.tweens.add({
                    targets: ghost,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => ghost.destroy()
                });
            });
        }
        
        // End dash
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.body.setAllowGravity(true);
            this.clearTint();
            this.isInvincible = false;
        });
        
        // Cooldown
        this.scene.time.delayedCall(this.dashCooldown, () => {
            this.canDash = true;
        });
    }
    
    updateAnimation(onGround) {
        if (this.isAttacking) return;
        if (this.isDashing) return;
        
        if (!onGround) {
            this.anims.play('player_jump', true);
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.anims.play('player_run', true);
        } else {
            this.anims.play('player_idle', true);
        }
    }
    
    attack(time) {
        // Combo system
        if (time - this.lastAttackTime < 500) {
            this.comboCount = Math.min(this.comboCount + 1, 3);
        } else {
            this.comboCount = 1;
        }
        this.lastAttackTime = time;
        
        this.isAttacking = true;
        this.canAttack = false;
        this.anims.play('player_attack', true);
        
        // Enable hitbox
        this.attackHitbox.body.enable = true;
        
        // Attack visual effect
        this.createSlashEffect();
        
        // Slight forward momentum on attack
        const pushDir = this.facingRight ? 1 : -1;
        this.setVelocityX(pushDir * 100);
        
        this.scene.time.delayedCall(150, () => {
            this.attackHitbox.body.enable = false;
            this.isAttacking = false;
        });
        
        this.scene.time.delayedCall(this.attackCooldown - (this.comboCount * 30), () => {
            this.canAttack = true;
        });
    }
    
    createSlashEffect() {
        const slashX = this.x + (this.facingRight ? 25 : -25);
        const slash = this.scene.add.graphics();
        slash.lineStyle(3, 0x60a5fa);
        
        const startAngle = this.facingRight ? -0.5 : Math.PI + 0.5;
        slash.beginPath();
        slash.arc(slashX, this.y, 25, startAngle - 0.8, startAngle + 0.8);
        slash.strokePath();
        
        this.scene.tweens.add({
            targets: slash,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 150,
            onComplete: () => slash.destroy()
        });
    }
    
    takeDamage(amount = 1) {
        if (this.isInvincible || this.isDashing) return;
        
        this.health -= amount;
        this.isInvincible = true;
        
        // Screen shake
        this.scene.cameras.main.shake(150, 0.015);
        
        // Knockback
        const knockbackDir = this.facingRight ? -1 : 1;
        this.setVelocityX(knockbackDir * 250);
        this.setVelocityY(-200);
        
        // Flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => this.clearTint());
        
        // Invincibility frames
        this.scene.time.delayedCall(GAME_CONFIG.PLAYER.INVINCIBILITY_TIME, () => {
            this.isInvincible = false;
        });
        
        // Emit event for UI
        this.scene.events.emit('playerDamaged', this.health);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.scene.events.emit('playerDied');
        this.setActive(false);
        this.body.enable = false;
        this.attackHitbox.body.enable = false;
        this.canAttack = false;
        this.canDash = false;
        this.setVelocity(0, 0);
        
        // Death effect
        this.scene.cameras.main.shake(500, 0.02);
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 50,
            angle: 180,
            duration: 800,
            onComplete: () => {
                this.setVisible(false);
            }
        });
    }
    
    collectCoin(amount = 1) {
        this.coins += amount;
        this.scene.events.emit('coinCollected', this.coins);
    }
    
    heal(amount = 1) {
        this.health = Math.min(this.health + amount, GAME_CONFIG.PLAYER.MAX_HEALTH);
        this.scene.events.emit('playerHealed', this.health);
        
        // Heal effect
        this.setTint(0x4ade80);
        this.scene.time.delayedCall(200, () => this.clearTint());
    }
}

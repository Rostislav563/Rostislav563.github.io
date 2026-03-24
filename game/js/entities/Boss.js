// Boss class - Final boss of the game (Dark Mage Morvin)
class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Boss stats - scaled for difficulty
        this.maxHealth = GAME_CONFIG.BOSS.HEALTH * 2; // 20 HP total
        this.health = this.maxHealth;
        this.damage = GAME_CONFIG.BOSS.DAMAGE;
        this.speed = GAME_CONFIG.BOSS.SPEED;
        
        // Physics
        this.body.setSize(48, 56);
        this.setCollideWorldBounds(true);
        this.setScale(1.5);
        
        // Boss state machine
        this.state = 'intro';
        this.stateTimer = 0;
        this.attackCooldown = 0;
        this.phase = 1; // 3 phases total
        
        // Pattern system - varies by phase
        this.patternIndex = 0;
        this.patterns = {
            1: ['charge', 'projectile', 'teleport'],
            2: ['charge', 'summon', 'projectile', 'ground_slam'],
            3: ['charge', 'projectile', 'summon', 'teleport', 'ground_slam', 'laser']
        };
        
        // Teleport cooldown
        this.teleportCooldown = 0;
        
        // Create animations
        this.createAnimations(scene);
        
        // Start with intro animation
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scale: 1.5,
            duration: 1000,
            onComplete: () => {
                this.state = 'idle';
                this.showDialogue();
            }
        });
    }
    
    showDialogue() {
        // Boss dialogue
        if (STORY.BOSS && STORY.BOSS.length > 0) {
            const text = this.scene.add.text(
                this.x, 
                this.y - 80, 
                STORY.BOSS[0],
                {
                    fontSize: '12px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#ff4444',
                    backgroundColor: '#000000aa',
                    padding: { x: 8, y: 4 }
                }
            ).setOrigin(0.5);
            
            this.scene.tweens.add({
                targets: text,
                alpha: 0,
                y: text.y - 30,
                duration: 3000,
                onComplete: () => text.destroy()
            });
        }
    }
    
    createAnimations(scene) {
        if (!scene.anims.exists('boss_idle')) {
            scene.anims.create({
                key: 'boss_idle',
                frames: scene.anims.generateFrameNumbers('boss', { start: 0, end: 1 }),
                frameRate: 3,
                repeat: -1
            });
            
            scene.anims.create({
                key: 'boss_attack',
                frames: scene.anims.generateFrameNumbers('boss', { start: 2, end: 5 }),
                frameRate: 10
            });
            
            scene.anims.create({
                key: 'boss_hurt',
                frames: [{ key: 'boss', frame: 6 }],
                frameRate: 1
            });
        }
    }
    
    update(player, time, delta) {
        if (!this.active || !player || this.state === 'dead') return;
        if (this.state === 'intro') return;
        
        this.stateTimer += delta;
        this.attackCooldown -= delta;
        this.teleportCooldown -= delta;
        
        // Phase transitions
        if (this.health <= this.maxHealth * 0.66 && this.phase === 1) {
            this.enterPhase2();
        } else if (this.health <= this.maxHealth * 0.33 && this.phase === 2) {
            this.enterPhase3();
        }
        
        // State machine
        switch (this.state) {
            case 'idle':
                this.handleIdle(player);
                break;
            case 'charge':
                this.handleCharge(player);
                break;
            case 'summon':
                this.handleSummon();
                break;
            case 'projectile':
                this.handleProjectile(player);
                break;
            case 'teleport':
                this.handleTeleport(player);
                break;
            case 'ground_slam':
                this.handleGroundSlam(player);
                break;
            case 'laser':
                this.handleLaser(player);
                break;
            case 'stunned':
                this.handleStunned();
                break;
        }
        
        // Flip to face player
        this.setFlipX(player.x < this.x);
        
        // Update animation
        if (this.state === 'idle') {
            this.anims.play('boss_idle', true);
        }
    }
    
    handleIdle(player) {
        this.setVelocityX(0);
        
        // Choose next attack after cooldown
        if (this.attackCooldown <= 0) {
            this.chooseNextAttack(player);
        }
    }
    
    chooseNextAttack(player) {
        const phasePatterns = this.patterns[this.phase] || this.patterns[1];
        const pattern = phasePatterns[this.patternIndex % phasePatterns.length];
        this.patternIndex++;
        
        this.state = pattern;
        this.stateTimer = 0;
        
        if (pattern === 'charge') {
            this.chargeDirection = player.x > this.x ? 1 : -1;
        }
    }
    
    handleCharge(player) {
        this.anims.play('boss_attack', true);
        
        // Wind up
        if (this.stateTimer < 500) {
            this.setVelocityX(0);
            this.setTint(0xff6666);
            return;
        }
        
        this.clearTint();
        
        // Charge! Speed increases per phase
        if (this.stateTimer < 1500) {
            const chargeSpeed = 200 + (this.phase * 50);
            this.setVelocityX(this.chargeDirection * chargeSpeed);
            return;
        }
        
        // Recovery
        this.state = 'idle';
        this.attackCooldown = 1500 - (this.phase * 200);
    }
    
    handleSummon() {
        if (this.stateTimer < 300) {
            this.setTint(0x9966ff);
            return;
        }
        
        if (this.stateTimer >= 300 && this.stateTimer < 400) {
            // Summon enemies - more in later phases
            this.clearTint();
            const count = this.phase + 1;
            const enemyTypes = ['slime', 'skeleton', 'demon'];
            
            for (let i = 0; i < count; i++) {
                const spawnX = this.x + (Math.random() - 0.5) * 250;
                const spawnY = this.y;
                const type = enemyTypes[Math.min(this.phase - 1, enemyTypes.length - 1)];
                this.scene.spawnEnemy(spawnX, spawnY, type);
            }
            this.scene.events.emit('bossSummon');
            soundManager.play('enemyDeath', { playbackRate: 0.5 });
        }
        
        if (this.stateTimer >= 1000) {
            this.state = 'idle';
            this.attackCooldown = 2500 - (this.phase * 300);
        }
    }
    
    handleTeleport(player) {
        if (this.stateTimer < 200) {
            this.setAlpha(this.alpha - 0.05);
            this.setTint(0x8800ff);
            return;
        }
        
        if (this.stateTimer >= 200 && this.stateTimer < 300) {
            // Teleport behind or near player
            const teleportX = player.x + (Math.random() > 0.5 ? 150 : -150);
            const minX = 2100;
            const maxX = this.scene.physics.world.bounds.width - 200;
            this.setPosition(
                Phaser.Math.Clamp(teleportX, minX, maxX),
                this.y
            );
            
            // Spawn effect at new location
            if (this.scene.particles) {
                this.scene.particles.explosion(this.x, this.y, { color: 0x8800ff, count: 10 });
            }
        }
        
        if (this.stateTimer >= 300 && this.stateTimer < 500) {
            this.setAlpha(Math.min(1, this.alpha + 0.1));
        }
        
        if (this.stateTimer >= 500) {
            this.clearTint();
            this.setAlpha(1);
            this.state = 'idle';
            this.attackCooldown = 800;
        }
    }
    
    handleGroundSlam(player) {
        // Jump up
        if (this.stateTimer < 400) {
            this.setVelocityY(-400);
            this.setTint(0xff8800);
            return;
        }
        
        // Slam down
        if (this.stateTimer >= 400 && this.stateTimer < 800) {
            this.setVelocityY(500);
            return;
        }
        
        // Create shockwave on landing
        if (this.body.blocked.down && this.stateTimer >= 800 && this.stateTimer < 900) {
            this.clearTint();
            this.createShockwave();
        }
        
        if (this.stateTimer >= 1200) {
            this.state = 'idle';
            this.attackCooldown = 1800;
        }
    }
    
    createShockwave() {
        this.scene.cameras.main.shake(300, 0.03);
        
        // Visual shockwave
        const wave = this.scene.add.circle(this.x, this.y + 30, 10, 0xff4400, 0.6);
        this.scene.tweens.add({
            targets: wave,
            scaleX: 15,
            scaleY: 1,
            alpha: 0,
            duration: 400,
            onComplete: () => wave.destroy()
        });
        
        // Damage player if on ground and close
        const player = this.scene.player;
        if (player && player.body.blocked.down) {
            const dist = Math.abs(this.x - player.x);
            if (dist < 150) {
                player.takeDamage(this.damage);
            }
        }
        
        soundManager.play('hit', { playbackRate: 0.5 });
    }
    
    handleLaser(player) {
        // Charge laser (phase 3 only)
        if (this.stateTimer < 800) {
            this.setTint(0x00ffff);
            
            // Warning line
            if (!this.laserWarning) {
                this.laserWarning = this.scene.add.rectangle(
                    this.x + (player.x > this.x ? 200 : -200),
                    this.y,
                    400, 8, 0x00ffff, 0.3
                );
            }
            
            // Aim at player
            this.laserWarning.x = this.x + (player.x > this.x ? 200 : -200);
            this.laserWarning.y = player.y;
            return;
        }
        
        // Fire laser
        if (this.stateTimer >= 800 && this.stateTimer < 900) {
            this.clearTint();
            
            if (this.laserWarning) {
                // Replace warning with actual laser
                const laserY = this.laserWarning.y;
                this.laserWarning.destroy();
                this.laserWarning = null;
                
                const laser = this.scene.add.rectangle(
                    this.x + (player.x > this.x ? 300 : -300),
                    laserY,
                    600, 20, 0x00ffff
                );
                
                // Flash effect
                this.scene.tweens.add({
                    targets: laser,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => laser.destroy()
                });
                
                // Check hit
                if (Math.abs(player.y - laserY) < 30) {
                    player.takeDamage(this.damage * 2);
                }
                
                soundManager.play('attack', { playbackRate: 0.3 });
            }
        }
        
        if (this.stateTimer >= 1200) {
            this.state = 'idle';
            this.attackCooldown = 2000;
        }
    }
    
    handleProjectile(player) {
        this.anims.play('boss_attack', true);
        
        if (this.stateTimer < 400) {
            this.setTint(0x66ffff);
            return;
        }
        
        if (this.stateTimer >= 400 && this.stateTimer < 500) {
            this.clearTint();
            // Fire projectile - more per phase
            const projectileCount = this.phase + 1;
            for (let i = 0; i < projectileCount; i++) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                const spread = (i - Math.floor(projectileCount / 2)) * 0.25;
                const offsetDistance = 56;
                const spawnX = this.x + Math.cos(angle) * offsetDistance;
                const spawnY = this.y + Math.sin(angle) * offsetDistance;
                this.scene.spawnProjectile(spawnX, spawnY, angle + spread);
            }
        }
        
        if (this.stateTimer >= 800) {
            this.state = 'idle';
            this.attackCooldown = 1200 - (this.phase * 150);
        }
    }
    
    handleStunned() {
        this.setVelocityX(0);
        this.setTint(0xffff00);
        
        if (this.stateTimer >= 800) {
            this.clearTint();
            this.state = 'idle';
            this.attackCooldown = 500;
        }
    }
    
    enterPhase2() {
        this.phase = 2;
        this.speed *= 1.2;
        this.patternIndex = 0;
        
        // Visual effect for phase transition
        this.scene.cameras.main.shake(500, 0.02);
        this.setTint(0xff0000);
        this.scene.time.delayedCall(500, () => this.clearTint());
        
        // Phase 2 text
        this.showPhaseText('ФАЗА 2', 0xff8800);
        
        this.scene.events.emit('bossPhase2');
    }
    
    enterPhase3() {
        this.phase = 3;
        this.speed *= 1.2;
        this.patternIndex = 0;
        
        // Visual effect for phase transition - more intense
        this.scene.cameras.main.shake(800, 0.04);
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(800, () => this.clearTint());
        
        // Phase 3 text
        this.showPhaseText('ФИНАЛЬНАЯ ФАЗА', 0xff0000);
        
        // Heal slightly
        this.health = Math.min(this.health + 3, this.maxHealth * 0.4);
        this.scene.events.emit('bossHealthChanged', this.health, this.maxHealth);
        
        this.scene.events.emit('bossPhase3');
    }

    clearLaserWarning() {
        if (this.laserWarning) {
            this.laserWarning.destroy();
            this.laserWarning = null;
        }
    }
    
    showPhaseText(text, color) {
        const phaseText = this.scene.add.text(
            this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
            this.scene.cameras.main.scrollY + 150,
            text,
            {
                fontSize: '24px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#' + color.toString(16).padStart(6, '0')
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: phaseText,
            alpha: 0,
            scale: 2,
            duration: 1500,
            onComplete: () => phaseText.destroy()
        });
    }
    
    takeDamage(amount = 1) {
        this.health -= amount;
        
        // Flash white
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => this.clearTint());
        
        // Brief stun
        if (Math.random() < 0.3) {
            this.state = 'stunned';
            this.stateTimer = 0;
        }
        
        // Camera shake
        this.scene.cameras.main.shake(100, 0.01);
        
        // Update boss HP bar
        this.scene.events.emit('bossHealthChanged', this.health, this.maxHealth);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.state = 'dead';
        this.body.enable = false;
        this.setVelocity(0, 0);
        this.anims.stop();
        this.clearLaserWarning();
        this.scene.cameras.main.shake(1000, 0.03);
        
        // Epic death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.events.emit('bossDefeated');
                this.destroy();
            }
        });
    }
}

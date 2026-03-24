// Base Enemy class with improved AI
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'slime') {
        super(scene, x, y, 'enemy_' + type);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.damage = GAME_CONFIG.ENEMY.DAMAGE;
        this.speed = GAME_CONFIG.ENEMY.SPEED;
        
        // Physics
        this.body.setSize(24, 24);
        this.setCollideWorldBounds(true);
        
        // AI State machine
        this.state = 'patrol';
        this.stateTime = 0;
        this.startX = x;
        this.patrolDistance = GAME_CONFIG.ENEMY.PATROL_DISTANCE;
        this.direction = 1;
        
        // Combat
        this.aggroRange = 180;
        this.attackRange = 40;
        this.attackCooldown = 0;
        this.canAttack = true;
        this.isAttacking = false;
        
        // Advanced AI
        this.lastKnownPlayerPos = null;
        this.lostPlayerTime = 0;
        this.searchTime = 3000; // How long to search for player
        this.jumpCooldown = 0;
        
        // Visual
        this.isElite = false;
        
        // Animations
        this.createAnimations(scene);
        this.anims.play('enemy_' + type + '_idle', true);
    }
    
    getHealthByType() {
        switch (this.type) {
            case 'slime': return 2;
            case 'skeleton': return 4;
            case 'bat': return 1;
            case 'golem': return 8;
            case 'wolf': return 3;
            case 'goblin': return 2;
            case 'demon': return 5;
            case 'ghost': return 2;
            default: return 2;
        }
    }
    
    createAnimations(scene) {
        const key = 'enemy_' + this.type;
        
        if (!scene.anims.exists(key + '_idle')) {
            scene.anims.create({
                key: key + '_idle',
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
            
            scene.anims.create({
                key: key + '_move',
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            scene.anims.create({
                key: key + '_hurt',
                frames: [{ key: key, frame: 4 }],
                frameRate: 1
            });
        }
    }
    
    update(player, time, delta) {
        if (!this.active || !player) return;
        
        this.stateTime += delta;
        this.attackCooldown -= delta;
        this.jumpCooldown -= delta;
        
        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const canSeePlayer = this.canSeePlayer(player);
        
        // State machine
        switch (this.state) {
            case 'patrol':
                this.handlePatrol(player, distToPlayer, canSeePlayer);
                break;
            case 'chase':
                this.handleChase(player, distToPlayer, canSeePlayer);
                break;
            case 'attack':
                this.handleAttack(player);
                break;
            case 'search':
                this.handleSearch();
                break;
            case 'stunned':
                this.handleStunned();
                break;
        }
        
        // Update animation
        this.updateAnimation();
        
        // Flip sprite based on direction
        if (Math.abs(this.body.velocity.x) > 5) {
            this.setFlipX(this.body.velocity.x < 0);
        }
    }
    
    canSeePlayer(player) {
        // Simple line of sight check
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist > this.aggroRange * 1.5) return false;
        
        // Check if player is not behind a wall (simplified)
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        return Math.abs(this.y - player.y) < 100; // Can see if roughly same height
    }
    
    handlePatrol(player, distToPlayer, canSeePlayer) {
        // Check for aggro
        if (distToPlayer < this.aggroRange && canSeePlayer && player.active) {
            this.state = 'chase';
            this.stateTime = 0;
            
            // Alert effect
            this.showAlert();
            return;
        }
        
        // Simple back and forth patrol
        if (this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
        } else if (this.x < this.startX - this.patrolDistance) {
            this.direction = 1;
        }
        
        this.setVelocityX(this.speed * this.direction * 0.4);
        
        // Occasionally stop and look around
        if (this.stateTime > 2000 + Math.random() * 2000) {
            this.setVelocityX(0);
            if (this.stateTime > 3000 + Math.random() * 1000) {
                this.stateTime = 0;
            }
        }
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        if (!player.active) {
            this.state = 'patrol';
            return;
        }
        
        // Lost sight of player
        if (!canSeePlayer) {
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            this.state = 'search';
            this.lostPlayerTime = 0;
            return;
        }
        
        // Close enough to attack?
        if (distToPlayer < this.attackRange && this.attackCooldown <= 0) {
            this.state = 'attack';
            this.stateTime = 0;
            return;
        }
        
        // Chase player
        const dirToPlayer = player.x > this.x ? 1 : -1;
        this.setVelocityX(this.speed * dirToPlayer);
        
        // Jump if player is above and we can jump
        if (player.y < this.y - 40 && this.body.blocked.down && this.jumpCooldown <= 0) {
            this.setVelocityY(-300);
            this.jumpCooldown = 1000;
        }
        
        // Jump over obstacles
        if (this.body.blocked.left || this.body.blocked.right) {
            if (this.body.blocked.down && this.jumpCooldown <= 0) {
                this.setVelocityY(-300);
                this.jumpCooldown = 500;
            }
        }
    }
    
    handleSearch() {
        this.lostPlayerTime += 16; // Approximate delta
        
        if (this.lostPlayerTime > this.searchTime) {
            this.state = 'patrol';
            this.stateTime = 0;
            return;
        }
        
        // Move towards last known position
        if (this.lastKnownPlayerPos) {
            const dir = this.lastKnownPlayerPos.x > this.x ? 1 : -1;
            this.setVelocityX(this.speed * dir * 0.6);
            
            // Reached last position
            if (Math.abs(this.x - this.lastKnownPlayerPos.x) < 30) {
                this.setVelocityX(0);
                this.lastKnownPlayerPos = null;
            }
        }
    }
    
    handleAttack(player) {
        this.setVelocityX(0);
        this.isAttacking = true;
        
        // Wind up
        if (this.stateTime < 200) {
            this.setTint(0xff8888);
            return;
        }
        
        this.clearTint();
        
        // Attack happens here - actual damage is handled by collision
        // Return to chase
        if (this.stateTime > 400) {
            this.isAttacking = false;
            this.attackCooldown = 800;
            this.state = 'chase';
            this.stateTime = 0;
        }
    }
    
    handleStunned() {
        this.setVelocityX(0);
        
        if (this.stateTime > 500) {
            this.clearTint();
            this.state = 'chase';
            this.stateTime = 0;
        }
    }
    
    showAlert() {
        const alert = this.scene.add.text(this.x, this.y - 30, '!', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ff4444'
        }).setOrigin(0.5);
        
        gsap.to(alert, {
            y: alert.y - 20,
            alpha: 0,
            duration: 0.5,
            onComplete: () => alert.destroy()
        });
        
        soundManager.play('menuSelect', { playbackRate: 1.5 });
    }
    
    updateAnimation() {
        const key = 'enemy_' + this.type;
        
        if (this.isAttacking) {
            return;
        }
        
        if (Math.abs(this.body.velocity.x) > 5) {
            this.anims.play(key + '_move', true);
        } else {
            this.anims.play(key + '_idle', true);
        }
    }
    
    takeDamage(amount = 1) {
        this.health -= amount;
        
        // Visual feedback
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
        
        // Knockback
        const knockDir = this.body.velocity.x > 0 ? -1 : 1;
        this.setVelocityX(knockDir * 150);
        this.setVelocityY(-100);
        
        // Brief stun
        this.state = 'stunned';
        this.stateTime = 0;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Emit event
        this.scene.events.emit('enemyKilled');
        
        // Death effect using particle factory
        if (this.scene.particles) {
            this.scene.particles.explosion(this.x, this.y, {
                color: this.isElite ? 0xff6b6b : 0x8b5cf6,
                count: 15
            });
        }
        
        soundManager.play('enemyDeath');
        
        // Drop loot
        if (Math.random() < 0.4) {
            this.scene.spawnCoin(this.x, this.y);
        }
        
        // Elite drops heart
        if (this.isElite && Math.random() < 0.5) {
            const heart = new Collectible(this.scene, this.x, this.y - 20, 'heart');
            this.scene.hearts.add(heart);
        }
        
        // Destroy elite aura if exists
        if (this.eliteAura) {
            this.eliteAura.destroy();
        }
        
        this.destroy();
    }
}

// Bat enemy - flying type with swoop attack
class BatEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'bat');
        this.body.setAllowGravity(false);
        this.startY = y;
        this.floatOffset = 0;
        this.aggroRange = 200;
        this.speed = 100;
        
        // Swoop attack
        this.swoopTarget = null;
        this.isSwooping = false;
    }
    
    update(player, time, delta) {
        if (!this.active) return;
        
        // Floating motion when not swooping
        if (!this.isSwooping) {
            this.floatOffset += 0.03;
            const targetY = this.state === 'chase' ? player.y - 30 : this.startY;
            this.y = Phaser.Math.Linear(this.y, targetY + Math.sin(this.floatOffset) * 15, 0.02);
        }
        
        super.update(player, time, delta);
    }
    
    handleAttack(player) {
        // Swoop attack
        if (!this.isSwooping) {
            this.isSwooping = true;
            this.swoopTarget = { x: player.x, y: player.y };
            
            // Dive towards player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * 250,
                Math.sin(angle) * 250
            );
        }
        
        // Check if swoop is done
        if (this.stateTime > 600) {
            this.isSwooping = false;
            this.setVelocity(0, 0);
            this.state = 'chase';
            this.stateTime = 0;
            this.attackCooldown = 1500;
        }
    }
}

// Skeleton enemy - stronger, can throw bones
class SkeletonEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'skeleton');
        this.patrolDistance = 150;
        this.speed = 90;
        this.aggroRange = 220;
        this.attackRange = 50;
        
        // Ranged attack
        this.hasRangedAttack = true;
        this.rangedCooldown = 0;
    }
    
    update(player, time, delta) {
        super.update(player, time, delta);
        this.rangedCooldown -= delta;
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        // Try ranged attack if far enough
        if (distToPlayer > 100 && distToPlayer < 200 && this.rangedCooldown <= 0 && canSeePlayer) {
            this.throwBone(player);
            this.rangedCooldown = 2500;
        }
        
        super.handleChase(player, distToPlayer, canSeePlayer);
    }
    
    throwBone(player) {
        const bone = this.scene.add.rectangle(this.x, this.y, 12, 6, 0xcccccc);
        this.scene.physics.add.existing(bone);
        bone.body.setAllowGravity(false);
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        bone.body.setVelocity(
            Math.cos(angle) * 180,
            Math.sin(angle) * 180
        );
        bone.setRotation(angle);
        
        // Rotate while flying
        this.scene.tweens.add({
            targets: bone,
            angle: bone.angle + 720,
            duration: 1000
        });
        
        // Add to projectiles group
        this.scene.projectiles.add(bone);
        
        // Destroy after time
        this.scene.time.delayedCall(2000, () => {
            if (bone.active) bone.destroy();
        });
        
        soundManager.play('attack');
    }
}

// Golem enemy - slow but tanky with ground pound
class GolemEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'golem');
        this.speed = 45;
        this.damage = 2;
        this.body.setSize(32, 32);
        this.aggroRange = 150;
        this.attackRange = 60;
        this.setScale(1.2);
    }
    
    handleAttack(player) {
        this.setVelocityX(0);
        
        // Ground pound attack
        if (this.stateTime < 400) {
            // Raise up
            this.setVelocityY(-50);
            this.setTint(0xffaa00);
            return;
        }
        
        if (this.stateTime >= 400 && this.stateTime < 500) {
            // Slam down
            this.setVelocityY(300);
            return;
        }
        
        // Create shockwave when hitting ground
        if (this.body.blocked.down && this.stateTime >= 500 && this.stateTime < 600) {
            this.clearTint();
            this.createShockwave();
        }
        
        if (this.stateTime > 800) {
            this.attackCooldown = 2000;
            this.state = 'chase';
            this.stateTime = 0;
        }
    }
    
    createShockwave() {
        // Camera shake
        this.scene.cameras.main.shake(200, 0.02);
        
        // Visual shockwave
        if (this.scene.particles) {
            this.scene.particles.shockwave(this.x, this.y + 16, {
                color: 0x78716c,
                maxRadius: 80
            });
        }
        
        // Damage player if close to ground
        const player = this.scene.player;
        if (player && player.body.blocked.down) {
            const dist = Math.abs(this.x - player.x);
            if (dist < 100) {
                player.takeDamage(this.damage);
            }
        }
        
        soundManager.play('hit', { playbackRate: 0.5 });
    }
}

// Wolf enemy - fast and aggressive, hunts in packs
class WolfEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'wolf');
        this.speed = 140;
        this.damage = 1;
        this.aggroRange = 250;
        this.attackRange = 35;
        this.patrolDistance = 180;
        
        // Lunge attack
        this.canLunge = true;
        this.lungeCooldown = 0;
    }
    
    update(player, time, delta) {
        super.update(player, time, delta);
        this.lungeCooldown -= delta;
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        // Lunge attack when at medium range
        if (distToPlayer > 80 && distToPlayer < 150 && this.lungeCooldown <= 0 && this.body.blocked.down) {
            this.lunge(player);
            this.lungeCooldown = 2500;
            return;
        }
        
        super.handleChase(player, distToPlayer, canSeePlayer);
    }
    
    lunge(player) {
        const dirToPlayer = player.x > this.x ? 1 : -1;
        this.setVelocity(dirToPlayer * 300, -200);
        this.setTint(0xff8800);
        
        this.scene.time.delayedCall(400, () => {
            if (this.active) this.clearTint();
        });
        
        soundManager.play('dash');
    }
}

// Goblin enemy - weak but throws daggers
class GoblinEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'goblin');
        this.speed = 100;
        this.aggroRange = 200;
        this.attackRange = 40;
        this.patrolDistance = 120;
        
        // Ranged dagger throw
        this.throwCooldown = 0;
    }
    
    update(player, time, delta) {
        super.update(player, time, delta);
        this.throwCooldown -= delta;
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        // Throw dagger if at range
        if (distToPlayer > 60 && distToPlayer < 180 && this.throwCooldown <= 0 && canSeePlayer) {
            this.throwDagger(player);
            this.throwCooldown = 2000;
        }
        
        super.handleChase(player, distToPlayer, canSeePlayer);
    }
    
    throwDagger(player) {
        const dagger = this.scene.add.rectangle(this.x, this.y, 8, 4, 0x888888);
        this.scene.physics.add.existing(dagger);
        dagger.body.setAllowGravity(false);
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        dagger.body.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200
        );
        dagger.setRotation(angle);
        
        this.scene.projectiles.add(dagger);
        
        this.scene.time.delayedCall(1500, () => {
            if (dagger.active) dagger.destroy();
        });
        
        soundManager.play('attack', { playbackRate: 1.5 });
    }
}

// Demon enemy - flying with fire attacks
class DemonEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'demon');
        this.body.setAllowGravity(false);
        this.startY = y;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.speed = 80;
        this.damage = 2;
        this.aggroRange = 220;
        this.attackRange = 150; // Ranged
        
        this.fireballCooldown = 0;
    }
    
    update(player, time, delta) {
        if (!this.active) return;
        
        // Floating motion
        this.floatOffset += 0.02;
        const targetY = this.state === 'chase' ? player.y - 50 : this.startY;
        this.y = Phaser.Math.Linear(this.y, targetY + Math.sin(this.floatOffset) * 20, 0.03);
        
        this.fireballCooldown -= delta;
        super.update(player, time, delta);
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        // Fire projectile
        if (canSeePlayer && this.fireballCooldown <= 0) {
            this.shootFireball(player);
            this.fireballCooldown = 1800;
        }
        
        // Keep distance
        if (distToPlayer < 120) {
            const awayDir = player.x > this.x ? -1 : 1;
            this.setVelocityX(this.speed * awayDir);
        } else if (distToPlayer > 180) {
            const towardDir = player.x > this.x ? 1 : -1;
            this.setVelocityX(this.speed * towardDir * 0.5);
        } else {
            this.setVelocityX(0);
        }
    }
    
    shootFireball(player) {
        const fireball = this.scene.add.circle(this.x, this.y, 8, 0xff4400);
        this.scene.physics.add.existing(fireball);
        fireball.body.setAllowGravity(false);
        fireball.body.setCircle(8);
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        fireball.body.setVelocity(
            Math.cos(angle) * 160,
            Math.sin(angle) * 160
        );
        
        // Fire trail effect
        this.scene.tweens.add({
            targets: fireball,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            repeat: -1
        });
        
        this.scene.projectiles.add(fireball);
        
        this.scene.time.delayedCall(2500, () => {
            if (fireball.active) fireball.destroy();
        });
        
        this.setTint(0xffaa00);
        this.scene.time.delayedCall(200, () => {
            if (this.active) this.clearTint();
        });
        
        soundManager.play('attack', { playbackRate: 0.7 });
    }
}

// Ghost enemy - phases through platforms, hard to hit
class GhostEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'ghost');
        this.body.setAllowGravity(false);
        this.startY = y;
        this.speed = 60;
        this.aggroRange = 180;
        this.attackRange = 30;
        
        // Phasing ability
        this.isPhased = false;
        this.phaseTimer = 0;
        this.setAlpha(0.7);
    }
    
    update(player, time, delta) {
        if (!this.active) return;
        
        // Floating and phasing
        this.phaseTimer += delta;
        
        // Phase in and out
        if (this.phaseTimer > 2000) {
            this.isPhased = !this.isPhased;
            this.phaseTimer = 0;
            
            if (this.isPhased) {
                this.setAlpha(0.3);
                this.body.checkCollision.none = true;
            } else {
                this.setAlpha(0.7);
                this.body.checkCollision.none = false;
            }
        }
        
        // Sine wave movement
        const wave = Math.sin(time * 0.002) * 30;
        this.y = Phaser.Math.Linear(this.y, this.startY + wave, 0.05);
        
        super.update(player, time, delta);
    }
    
    handleChase(player, distToPlayer, canSeePlayer) {
        // Float towards player
        const dirToPlayer = player.x > this.x ? 1 : -1;
        this.setVelocityX(this.speed * dirToPlayer);
        
        // Move up/down towards player
        const yDir = player.y > this.y ? 1 : -1;
        this.setVelocityY(this.speed * yDir * 0.5);
        
        // Attack when close and not phased
        if (distToPlayer < this.attackRange && this.attackCooldown <= 0 && !this.isPhased) {
            this.state = 'attack';
            this.stateTime = 0;
        }
    }
    
    takeDamage(amount = 1) {
        // Can't be damaged while phased
        if (this.isPhased) {
            // Visual feedback that attack didn't work
            this.scene.add.text(this.x, this.y - 20, 'MISS', {
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#888888'
            }).setOrigin(0.5).setAlpha(0.8).destroy();
            
            this.scene.tweens.add({
                targets: this.scene.add.text(this.x, this.y - 20, 'MISS', {
                    fontSize: '10px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#888888'
                }).setOrigin(0.5),
                y: this.y - 40,
                alpha: 0,
                duration: 500,
                onComplete: function() { this.targets[0].destroy(); }
            });
            return;
        }
        
        super.takeDamage(amount);
    }
}

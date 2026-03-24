// Main Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data) {
        this.currentLevel = data?.level || 1;
        this.playerCoins = data?.coins || 0;
        this.sessionStartTime = Date.now();
    }
    
    create() {
        const levelData = LEVELS[this.currentLevel];
        if (!levelData) {
            this.scene.start('MenuScene', { victory: true });
            return;
        }
        
        // Add level number to config for spawn system
        levelData.levelNumber = this.currentLevel;
        
        // Initialize systems
        this.particles = new ParticleFactory(this);
        this.spawnSystem = new SpawnSystem(this, levelData);
        difficultyManager.resetAdaptive();
        
        // Setup world bounds
        this.levelHeight = levelData.height;
        this.pitDeathY = levelData.height + 80;
        this.physics.world.setBounds(0, 0, levelData.width, levelData.height + 320);
        
        // Groups (must be created before background decorations)
        this.platforms = this.add.group();
        this.enemies = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.hearts = this.physics.add.group();
        this.spikes = this.add.group();
        this.projectiles = this.physics.add.group();
        this.decorations = this.add.group();
        
        // Background with parallax
        this.cameras.main.setBackgroundColor(levelData.background);
        this.createParallaxBackground(levelData);
        
        // Build level with improved design
        this.buildLevel(levelData);
        
        // Create player
        const startPos = levelData.map.playerStart;
        this.player = new Player(this, startPos.x, startPos.y);
        this.player.coins = this.playerCoins;
        
        // Create portal (inactive initially unless no boss)
        const portalPos = levelData.map.portal;
        this.portal = new Portal(this, portalPos.x, portalPos.y);
        this.levelEndX = levelData.hasBoss ? (levelData.map.boss?.x || portalPos.x) : portalPos.x;
        if (!levelData.hasBoss) {
            this.portal.activate();
        }
        
        // Start spawn system (Risk of Rain style)
        if (!levelData.hasBoss) {
            this.spawnSystem.start();
        }
        
        // Collisions
        this.setupCollisions();
        
        // Camera with smooth follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, levelData.width, levelData.height);
        this.cameras.main.setDeadzone(100, 50);
        
        // Start UI scene
        this.scene.launch('UIScene', {
            level: this.currentLevel,
            levelName: levelData.name,
            health: this.player.health,
            coins: this.player.coins,
            hasBoss: levelData.hasBoss
        });
        
        // Show dialogue if exists
        if (levelData.dialogue && levelData.dialogue.length > 0) {
            this.showDialogue(levelData.dialogue);
        }
        
        // Events
        this.setupEvents();
        
        // Input
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-M', () => soundManager.toggleMute());
        
        // Track if paused
        this.isPaused = false;
        
        // Play level music
        soundManager.playMusic(levelData.theme.toLowerCase());
        
        // Game time tracking
        this.gameTime = 0;
        
        // Kill counter for wave clear - use level config or default
        this.killCount = 0;
        this.killsForPortal = levelData.killsRequired ?? (levelData.hasBoss ? 0 : 15);
        
        // Fade in
        this.cameras.main.fadeIn(500);
    }
    
    createParallaxBackground(levelData) {
        const width = levelData.width;
        const height = levelData.height;
        const theme = levelData.theme;
        
        // Far background layer
        this.bgFar = this.add.tileSprite(0, 0, width * 2, height, 'bg_far');
        this.bgFar.setOrigin(0, 0);
        this.bgFar.setScrollFactor(0.1);
        this.bgFar.setTint(Phaser.Display.Color.IntegerToColor(levelData.background).darken(30).color);
        this.bgFar.setAlpha(0.5);
        
        // Create procedural background elements
        this.createBackgroundDecorations(levelData);
    }
    
    createBackgroundDecorations(levelData) {
        const theme = levelData.theme;
        const width = levelData.width;
        const height = levelData.height;
        
        // Add themed decorations
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(100, height - 150);
            let deco;
            
            switch (theme) {
                case 'VILLAGE':
                    // Houses and trees
                    if (Math.random() > 0.5) {
                        deco = this.createHouseDecoration(x, y);
                    } else {
                        deco = this.createTreeDecoration(x, y, 0x228b22);
                    }
                    break;
                    
                case 'FOREST':
                    deco = this.createTreeDecoration(x, y, 0x0d4d0d);
                    break;
                    
                case 'CAVE':
                    deco = this.createCrystalDecoration(x, y);
                    break;
                    
                case 'MOUNTAIN':
                    deco = this.createMountainDecoration(x, y);
                    break;
                    
                case 'CASTLE':
                    deco = this.createCastleDecoration(x, y);
                    break;
            }
            
            if (deco) {
                deco.setScrollFactor(0.3 + Math.random() * 0.2);
                deco.setAlpha(0.3 + Math.random() * 0.3);
                this.decorations.add(deco);
            }
        }
    }
    
    createTreeDecoration(x, y, color) {
        const g = this.add.graphics();
        g.setPosition(x, y);
        
        // Trunk
        g.fillStyle(0x4a3728);
        g.fillRect(-5, 0, 10, 40);
        
        // Leaves (triangle)
        g.fillStyle(color);
        g.fillTriangle(0, -40, -25, 20, 25, 20);
        g.fillTriangle(0, -60, -20, 0, 20, 0);
        
        return g;
    }
    
    createHouseDecoration(x, y) {
        const g = this.add.graphics();
        g.setPosition(x, y);
        
        // House body
        g.fillStyle(0x8b7355);
        g.fillRect(-20, 0, 40, 35);
        
        // Roof
        g.fillStyle(0x6b4423);
        g.fillTriangle(0, -20, -25, 5, 25, 5);
        
        // Window
        g.fillStyle(0xffd700, 0.5);
        g.fillRect(-8, 10, 8, 8);
        g.fillRect(2, 10, 8, 8);
        
        return g;
    }
    
    createCrystalDecoration(x, y) {
        const g = this.add.graphics();
        g.setPosition(x, y);
        
        const colors = [0x60a5fa, 0x8b5cf6, 0x06b6d4];
        const color = Phaser.Utils.Array.GetRandom(colors);
        
        g.fillStyle(color, 0.6);
        g.fillTriangle(0, -30, -10, 10, 10, 10);
        
        g.fillStyle(color, 0.3);
        g.fillTriangle(15, -20, 5, 10, 25, 10);
        
        return g;
    }
    
    createMountainDecoration(x, y) {
        const g = this.add.graphics();
        g.setPosition(x, y);
        
        g.fillStyle(0x4b5563, 0.5);
        g.fillTriangle(0, -80, -60, 40, 60, 40);
        
        // Snow cap
        g.fillStyle(0xffffff, 0.4);
        g.fillTriangle(0, -80, -20, -40, 20, -40);
        
        return g;
    }
    
    createCastleDecoration(x, y) {
        const g = this.add.graphics();
        g.setPosition(x, y);
        
        // Tower
        g.fillStyle(0x374151);
        g.fillRect(-15, -60, 30, 80);
        
        // Battlements
        g.fillRect(-20, -70, 10, 15);
        g.fillRect(10, -70, 10, 15);
        
        // Window
        g.fillStyle(0xfcd34d, 0.3);
        g.fillRect(-5, -40, 10, 15);
        
        return g;
    }
    
    buildLevel(levelData) {
        const map = levelData.map;
        
        // Platforms with visual variety
        map.platforms.forEach((p, index) => {
            const platform = this.add.tileSprite(
                p.x + p.width / 2, 
                p.y + p.height / 2, 
                p.width, 
                p.height, 
                p.type === 'ground' ? 'ground' : 'platform'
            );
            
            // Add visual variety based on theme
            if (levelData.theme === 'CAVE') {
                platform.setTint(0x8888aa);
            } else if (levelData.theme === 'CASTLE') {
                platform.setTint(0x777799);
            }
            
            this.physics.add.existing(platform, true);
            platform.body.setSize(p.width, p.height);
            this.platforms.add(platform);
            
            // Add grass/moss on top of ground
            if (p.type === 'ground' && levelData.theme !== 'CAVE' && levelData.theme !== 'CASTLE') {
                this.addPlatformDetails(p);
            }
        });
        
        // Spikes with warning signs
        if (map.spikes) {
            map.spikes.forEach(s => {
                // Warning sign above spike
                const warning = this.add.text(s.x + s.width / 2, s.y - 30, '!', {
                    fontSize: '12px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#ff4444'
                }).setOrigin(0.5).setAlpha(0.7);
                
                gsap.to(warning, {
                    alpha: 0.3,
                    duration: 0.5,
                    yoyo: true,
                    repeat: -1
                });
                
                const spike = this.add.tileSprite(s.x + s.width / 2, s.y + 12, s.width, 24, 'spike');
                this.physics.add.existing(spike, true);
                spike.body.setSize(s.width - 8, 16);
                this.spikes.add(spike);
            });
        }
        
        // Initial enemies (before spawn system takes over)
        map.enemies.forEach(e => {
            this.spawnEnemy(e.x, e.y, e.type);
        });
        
        // Coins with sparkle effect
        map.coins.forEach(c => {
            const coin = new Collectible(this, c.x, c.y, 'coin');
            this.coins.add(coin);
            
            // Ambient sparkle
            this.time.addEvent({
                delay: 2000 + Math.random() * 2000,
                loop: true,
                callback: () => {
                    if (coin.active) {
                        this.particles.sparkle(coin.x, coin.y, { 
                            color: 0xfbbf24, 
                            count: 3, 
                            radius: 15 
                        });
                    }
                }
            });
        });
        
        // Hearts
        if (map.hearts) {
            map.hearts.forEach(h => {
                const heart = new Collectible(this, h.x, h.y, 'heart');
                this.hearts.add(heart);
            });
        }
        
        // Boss setup
        if (levelData.hasBoss && map.boss) {
            // Boss appears after clearing initial enemies or time
            this.time.delayedCall(5000, () => {
                if (!this.boss) {
                    this.spawnSystem.spawnBoss(map.boss.x, map.boss.y);
                }
            });
        }
    }
    
    addPlatformDetails(platform) {
        // Add grass tufts on top
        for (let x = platform.x; x < platform.x + platform.width; x += 20) {
            if (Math.random() > 0.5) {
                const grass = this.add.triangle(
                    x + Math.random() * 10,
                    platform.y - 2,
                    0, 8, 4, 0, 8, 8,
                    0x4ade80, 0.7
                );
                this.decorations.add(grass);
            }
        }
    }
    
    spawnEnemy(x, y, type) {
        let enemy;
        switch (type) {
            case 'bat':
                enemy = new BatEnemy(this, x, y);
                break;
            case 'skeleton':
                enemy = new SkeletonEnemy(this, x, y);
                break;
            case 'golem':
                enemy = new GolemEnemy(this, x, y);
                break;
            case 'wolf':
                enemy = new WolfEnemy(this, x, y);
                break;
            case 'goblin':
                enemy = new GoblinEnemy(this, x, y);
                break;
            case 'demon':
                enemy = new DemonEnemy(this, x, y);
                break;
            case 'ghost':
                enemy = new GhostEnemy(this, x, y);
                break;
            default:
                enemy = new Enemy(this, x, y, 'slime');
        }
        
        // Apply difficulty scaling
        enemy.health = difficultyManager.getEnemyHealth(enemy.health);
        enemy.damage = difficultyManager.getEnemyDamage(enemy.damage || 1);
        
        this.enemies.add(enemy);
        this.physics.add.collider(enemy, this.platforms);
        
        return enemy;
    }
    
    spawnCoin(x, y) {
        const coin = new Collectible(this, x, y, 'coin');
        this.coins.add(coin);
        
        // Pop up animation
        coin.setVelocityY(-200);
        this.time.delayedCall(500, () => {
            if (coin.active) {
                coin.body.setAllowGravity(false);
                coin.setVelocityY(0);
            }
        });
    }
    
    spawnProjectile(x, y, angle) {
        const projectile = new Projectile(this, x, y, angle);
        this.projectiles.add(projectile);
    }
    
    setupCollisions() {
        // Player vs platforms
        this.physics.add.collider(this.player, this.platforms);
        
        // Player vs enemies - with damage feedback
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (!player.isInvincible && !player.isDashing) {
                const damage = enemy.damage || 1;
                player.takeDamage(damage);
                
                // Damage number
                this.particles.damageNumber(player.x, player.y - 20, damage);
                
                // Sound
                soundManager.play('hurt');
                
                // Track for difficulty
                difficultyManager.update(0, { tookDamage: true });
            }
        });
        
        // Player attack vs enemies - with satisfying feedback
        this.physics.add.overlap(this.player.attackHitbox, this.enemies, (hitbox, enemy) => {
            if (this.player.isAttacking && hitbox.body.enable) {
                const damage = difficultyManager.getPlayerDamage(GAME_CONFIG.PLAYER.ATTACK_DAMAGE);
                enemy.takeDamage(damage);
                
                // Hit feedback
                this.particles.damageNumber(enemy.x, enemy.y - 20, damage, { color: '#fbbf24' });
                this.cameras.main.shake(50, 0.005);
                soundManager.play('hit');
                
                // Hitstop effect (brief pause)
                this.time.timeScale = 0.1;
                this.time.delayedCall(30, () => {
                    this.time.timeScale = 1;
                });
            }
        });
        
        // Player vs coins
        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            coin.collect(player);
            this.particles.coinCollect(coin.x, coin.y);
            soundManager.play('coin');
        });
        
        // Player vs hearts
        this.physics.add.overlap(this.player, this.hearts, (player, heart) => {
            heart.collect(player);
            this.particles.sparkle(heart.x, heart.y, { color: 0xf43f5e });
            soundManager.play('powerup');
        });
        
        // Player vs spikes
        this.physics.add.overlap(this.player, this.spikes, (player, spike) => {
            if (!player.isInvincible) {
                player.takeDamage(1);
                this.particles.damageNumber(player.x, player.y - 20, 1);
            }
        });
        
        // Player vs portal
        this.physics.add.overlap(this.player, this.portal, (player, portal) => {
            if (portal.isActive) {
                portal.enter(player);
            }
        });
        
        // Player vs boss
        this.events.on('bossSpawned', () => {
            if (this.boss) {
                this.physics.add.overlap(this.player, this.boss, (player, boss) => {
                    if (!player.isInvincible && !player.isDashing) {
                        player.takeDamage(boss.damage);
                        this.particles.damageNumber(player.x, player.y - 20, boss.damage);
                    }
                });
                
                this.physics.add.overlap(this.player.attackHitbox, this.boss, (hitbox, boss) => {
                    if (this.player.isAttacking && hitbox.body.enable) {
                        boss.takeDamage(GAME_CONFIG.PLAYER.ATTACK_DAMAGE);
                        soundManager.play('hit', { playbackRate: 0.8 });
                    }
                });
            }
        });
        
        // Player vs projectiles
        this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
            if (!player.isDashing) {
                projectile.hitPlayer(player);
            } else {
                // Deflect projectile during dash!
                projectile.setVelocity(-projectile.body.velocity.x, -projectile.body.velocity.y);
                projectile.setTint(0x4ade80);
            }
        });
    }
    
    setupEvents() {
        // Player events
        this.events.on('playerDamaged', (health) => {
            this.scene.get('UIScene').updateHealth(health);
            this.particles.screenFlash({ color: 0xff0000, alpha: 0.3 });
        });
        
        this.events.on('coinCollected', (coins) => {
            this.scene.get('UIScene').updateCoins(coins);
        });
        
        this.events.on('playerHealed', (health) => {
            this.scene.get('UIScene').updateHealth(health);
            this.particles.screenFlash({ color: 0x4ade80, alpha: 0.2 });
        });
        
        this.events.on('playerDied', () => {
            // Save death stat
            const save = SaveSystem.load();
            save.deaths++;
            SaveSystem.save(save);
            
            difficultyManager.update(0, { died: true });
            this.spawnSystem.stop();
            this.physics.world.pause();
            this.player.fallingToDeath = false;
            soundManager.stopMusic();
            
            this.time.delayedCall(1500, () => {
                this.scene.stop('UIScene');
                this.scene.start('MenuScene', { gameOver: true });
            });
        });
        
        // Enemy killed
        this.events.on('enemyKilled', () => {
            this.killCount++;
            difficultyManager.update(0, { killedEnemy: true });
            
            const save = SaveSystem.load();
            save.enemiesKilled++;
            SaveSystem.save(save);
            
            // Check portal unlock
            if (this.killCount >= this.killsForPortal && !this.portal.isActive) {
                this.portal.activate();
                this.particles.powerUp(this.portal.x, this.portal.y);
                soundManager.play('levelComplete');
                
                // Announce
                const text = this.add.text(
                    this.cameras.main.scrollX + this.cameras.main.width / 2,
                    this.cameras.main.scrollY + 100,
                    'PORTAL OPEN!',
                    {
                        fontSize: '24px',
                        fontFamily: '"Press Start 2P", monospace',
                        color: '#8b5cf6'
                    }
                ).setOrigin(0.5).setScrollFactor(0);
                
                gsap.to(text, {
                    alpha: 0,
                    y: text.y - 50,
                    duration: 2,
                    onComplete: () => text.destroy()
                });
            }
            
            // Update UI
            this.scene.get('UIScene').updateKills?.(this.killCount, this.killsForPortal);
        });
        
        // Level complete
        this.events.on('levelComplete', () => {
            this.player.setActive(false);
            this.player.body.enable = false;
            this.player.attackHitbox.body.enable = false;
            this.player.setVelocity(0, 0);
            this.spawnSystem.stop();
            this.physics.world.pause();
            soundManager.stopMusic();
            soundManager.play('levelComplete');
            
            // Save progress
            const save = SaveSystem.load();
            if (!save.completedLevels.includes(this.currentLevel)) {
                save.completedLevels.push(this.currentLevel);
            }
            save.currentLevel = Math.max(save.currentLevel, this.currentLevel + 1);
            save.totalCoins += this.player.coins;
            save.totalPlayTime += Date.now() - this.sessionStartTime;
            SaveSystem.save(save);
            
            // Victory effects
            this.particles.powerUp(this.player.x, this.player.y);
            this.cameras.main.fade(1500, 0, 0, 0);
            
            this.time.delayedCall(1500, () => {
                this.scene.stop('UIScene');
                
                if (this.currentLevel >= TOTAL_LEVELS) {
                    this.scene.start('MenuScene', { victory: true });
                } else {
                    this.scene.start('GameScene', { 
                        level: this.currentLevel + 1,
                        coins: this.player.coins
                    });
                }
            });
        });
        
        // Boss events
        this.events.on('bossHealthChanged', (health, maxHealth) => {
            this.scene.get('UIScene').updateBossHealth(health, maxHealth);
        });
        
        this.events.on('bossDefeated', () => {
            this.portal.activate();
            this.particles.death(this.boss.x, this.boss.y, 0x8b5cf6);
            this.showDialogue(STORY.LEVEL_5);
            soundManager.play('levelComplete');
        });
        
        // Wave spawned
        this.events.on('waveSpawned', (data) => {
            this.scene.get('UIScene').showWaveIndicator?.(data.wave);
        });
    }
    
    showDialogue(lines) {
        this.scene.launch('DialogScene', { lines });
        this.scene.pause();
    }
    
    togglePause() {
        if (this.isPaused) {
            this.scene.resume();
            this.scene.get('UIScene').hidePauseMenu();
            this.isPaused = false;
            soundManager.playMusic(LEVELS[this.currentLevel].theme.toLowerCase());
        } else {
            this.scene.pause();
            this.scene.get('UIScene').showPauseMenu();
            this.isPaused = true;
            soundManager.stopMusic();
        }
    }
    
    update(time, delta) {
        this.gameTime += delta;
        
        if (this.player && !this.player.active && !this.player.fallingToDeath) {
            return;
        }
        
        if (this.player && this.player.active) {
            this.player.update(time, delta);
        }
        
        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.update(this.player, time, delta);
                // Update elite aura if exists
                if (enemy.updateEliteAura) {
                    enemy.updateEliteAura();
                }
            }
        });
        
        // Update spawn system
        this.spawnSystem.update(time, delta, this.player);
        
        // Update boss
        if (this.boss && this.boss.active) {
            this.boss.update(this.player, time, delta);
        }
        
        // Update collectibles
        this.coins.getChildren().forEach(coin => coin.update?.(time));
        this.hearts.getChildren().forEach(heart => heart.update?.(time));

        // Update level progress toward the portal
        if (this.levelEndX) {
            const progress = Phaser.Math.Clamp(this.player.x / this.levelEndX, 0, 1);
            this.scene.get('UIScene').updateProgress?.(progress);
        }
        
        // Check fall death - pits below the visible level are lethal
        const pitThreshold = this.pitDeathY;
        
        // Warning when close to edge
        if (this.player.y > pitThreshold - 35 && !this.player.fallingToDeath) {
            this.cameras.main.shake(50, 0.005);
        }
        
        // Death if fallen into the pit
        if (this.player.y > pitThreshold && !this.player.fallingToDeath) {
            this.player.fallingToDeath = true;
            this.cameras.main.fade(400, 0, 0, 0);
            soundManager.play('hit', { playbackRate: 0.5 });
            this.time.delayedCall(200, () => {
                this.player.takeDamage(this.player.health);
            });
        }
        
        // Safety fallback if somehow still falling below the world
        if (this.player.y > this.physics.world.bounds.height + 20 && !this.player.fallingToDeath) {
            this.player.fallingToDeath = true;
            this.cameras.main.fade(400, 0, 0, 0);
            soundManager.play('hit', { playbackRate: 0.5 });
            this.time.delayedCall(200, () => {
                this.player.takeDamage(this.player.health);
            });
        }
        
        // Update UI with game time
        if (Math.floor(this.gameTime / 1000) !== Math.floor((this.gameTime - delta) / 1000)) {
            this.scene.get('UIScene').updateGameTime?.(this.gameTime);
        }
    }
}

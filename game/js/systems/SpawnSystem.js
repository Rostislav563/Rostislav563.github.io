/**
 * Spawn System - Risk of Rain 2 / Contra style enemy spawning
 * Dynamic difficulty scaling based on time and player progress
 */
class SpawnSystem {
    constructor(scene, levelConfig) {
        this.scene = scene;
        this.config = levelConfig;
        
        // Timing
        this.elapsedTime = 0;
        this.lastSpawnTime = 0;
        this.waveNumber = 0;
        
        // Spawn settings
        this.baseSpawnInterval = 8000; // 8 seconds base
        this.minSpawnInterval = 2000;  // Minimum 2 seconds at high difficulty
        this.spawnIntervalReduction = 100; // Reduce by 100ms per wave
        
        // Credit system (like Risk of Rain)
        this.spawnCredits = 0;
        this.creditGainRate = 10; // Credits per second
        this.maxCredits = 200;
        
        // Enemy costs
        this.enemyCosts = {
            slime: 15,
            bat: 20,
            skeleton: 35,
            golem: 60,
            wolf: 30,
            goblin: 25,
            demon: 50,
            ghost: 40,
            elite_slime: 40,
            elite_skeleton: 70,
            elite_wolf: 60,
            elite_goblin: 50
        };
        
        // Spawn zones
        this.spawnZones = [];
        this.setupSpawnZones();
        
        // Director state
        this.isActive = false;
        this.difficultyCoefficient = 1;
        
        // Enemy type pool based on level
        this.availableEnemies = this.getAvailableEnemies();
        
        // Elite chance increases over time
        this.eliteChance = 0;
        this.eliteChanceGrowth = 0.02; // 2% per wave
    }
    
    setupSpawnZones() {
        const levelWidth = this.config.width || 2000;
        const levelHeight = this.config.height || 576;
        
        // Create spawn zones at edges and key points
        // Left spawn (off-screen)
        this.spawnZones.push({
            x: -50,
            y: levelHeight - 100,
            type: 'edge',
            weight: 1
        });
        
        // Right spawn (off-screen)
        this.spawnZones.push({
            x: levelWidth + 50,
            y: levelHeight - 100,
            type: 'edge',
            weight: 1
        });
        
        // Dynamic zones based on platforms
        if (this.config.map?.platforms) {
            this.config.map.platforms.forEach((platform, index) => {
                if (platform.type === 'platform' && index % 2 === 0) {
                    this.spawnZones.push({
                        x: platform.x + platform.width / 2,
                        y: platform.y - 50,
                        type: 'platform',
                        weight: 0.5
                    });
                }
            });
        }
        
        // Top spawns for flying enemies
        for (let i = 0; i < 3; i++) {
            this.spawnZones.push({
                x: (levelWidth / 4) * (i + 1),
                y: 50,
                type: 'air',
                weight: 0.3,
                enemyTypes: ['bat']
            });
        }
    }
    
    getAvailableEnemies() {
        const levelNum = this.config.levelNumber || 1;
        
        const pools = {
            1: ['slime', 'goblin'],
            2: ['slime', 'bat', 'wolf', 'goblin'],
            3: ['skeleton', 'bat', 'ghost', 'goblin'],
            4: ['skeleton', 'wolf', 'golem', 'demon'],
            5: ['skeleton', 'golem', 'demon', 'ghost']
        };
        
        return pools[levelNum] || ['slime'];
    }
    
    start() {
        this.isActive = true;
        this.elapsedTime = 0;
        this.waveNumber = 0;
        this.spawnCredits = 50; // Starting credits
    }
    
    stop() {
        this.isActive = false;
    }
    
    update(time, delta, player) {
        if (!this.isActive) return;
        
        this.elapsedTime += delta;
        
        // Accumulate spawn credits over time
        this.spawnCredits = Math.min(
            this.spawnCredits + (this.creditGainRate * this.difficultyCoefficient * delta / 1000),
            this.maxCredits
        );
        
        // Calculate current spawn interval
        const currentInterval = Math.max(
            this.minSpawnInterval,
            this.baseSpawnInterval - (this.waveNumber * this.spawnIntervalReduction)
        );
        
        // Check if it's time to spawn
        if (this.elapsedTime - this.lastSpawnTime >= currentInterval) {
            this.spawnWave(player);
            this.lastSpawnTime = this.elapsedTime;
            this.waveNumber++;
            
            // Increase elite chance
            this.eliteChance = Math.min(0.3, this.eliteChance + this.eliteChanceGrowth);
        }
        
        // Update difficulty coefficient (increases over time)
        this.difficultyCoefficient = 1 + (this.elapsedTime / 60000) * 0.5; // +50% per minute
    }
    
    spawnWave(player) {
        if (!player || !player.active) return;
        
        // Determine how many enemies to spawn based on credits
        const enemiesToSpawn = this.selectEnemiesForWave();
        
        // Get valid spawn zones (away from player)
        const validZones = this.getValidSpawnZones(player);
        
        if (validZones.length === 0) return;
        
        // Spawn enemies
        enemiesToSpawn.forEach((enemyType, index) => {
            // Stagger spawns slightly
            this.scene.time.delayedCall(index * 200, () => {
                const zone = Phaser.Utils.Array.GetRandom(validZones);
                const spawnX = zone.x + (Math.random() - 0.5) * 100;
                const spawnY = zone.y;
                
                this.spawnEnemy(spawnX, spawnY, enemyType);
            });
        });
        
        // Emit wave event
        this.scene.events.emit('waveSpawned', {
            wave: this.waveNumber,
            count: enemiesToSpawn.length
        });
    }
    
    selectEnemiesForWave() {
        const enemies = [];
        let remainingCredits = this.spawnCredits * 0.7; // Spend 70% of credits
        
        // Shuffle enemy pool
        const pool = Phaser.Utils.Array.Shuffle([...this.availableEnemies]);
        
        while (remainingCredits > 0 && enemies.length < 6) {
            // Try to pick an affordable enemy
            let picked = false;
            
            for (const enemyType of pool) {
                // Check for elite version
                let finalType = enemyType;
                let cost = this.enemyCosts[enemyType];
                
                if (Math.random() < this.eliteChance && this.enemyCosts['elite_' + enemyType]) {
                    finalType = 'elite_' + enemyType;
                    cost = this.enemyCosts[finalType];
                }
                
                if (cost <= remainingCredits) {
                    enemies.push(finalType);
                    remainingCredits -= cost;
                    this.spawnCredits -= cost;
                    picked = true;
                    break;
                }
            }
            
            if (!picked) break; // Can't afford anything
        }
        
        return enemies;
    }
    
    getValidSpawnZones(player) {
        const minDistance = 300; // Minimum distance from player
        const maxDistance = 800; // Maximum distance from player
        
        return this.spawnZones.filter(zone => {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
            return dist >= minDistance && dist <= maxDistance;
        });
    }
    
    spawnEnemy(x, y, type) {
        // Check if elite
        const isElite = type.startsWith('elite_');
        const baseType = isElite ? type.replace('elite_', '') : type;
        
        // Create spawn effect
        this.createSpawnEffect(x, y);
        
        // Delay actual spawn for effect
        this.scene.time.delayedCall(300, () => {
            let enemy;
            
            switch (baseType) {
                case 'bat':
                    enemy = new BatEnemy(this.scene, x, y);
                    break;
                case 'skeleton':
                    enemy = new SkeletonEnemy(this.scene, x, y);
                    break;
                case 'golem':
                    enemy = new GolemEnemy(this.scene, x, y);
                    break;
                case 'wolf':
                    enemy = new WolfEnemy(this.scene, x, y);
                    break;
                case 'goblin':
                    enemy = new GoblinEnemy(this.scene, x, y);
                    break;
                case 'demon':
                    enemy = new DemonEnemy(this.scene, x, y);
                    break;
                case 'ghost':
                    enemy = new GhostEnemy(this.scene, x, y);
                    break;
                default:
                    enemy = new Enemy(this.scene, x, y, 'slime');
            }
            
            // Apply elite buffs
            if (isElite) {
                this.makeElite(enemy);
            }
            
            // Add to scene group
            this.scene.enemies.add(enemy);
            this.scene.physics.add.collider(enemy, this.scene.platforms);
        });
    }
    
    makeElite(enemy) {
        // Elite enemies are larger, stronger, and have visual indicator
        enemy.setScale(1.3);
        enemy.setTint(0xff6b6b);
        enemy.health *= 2;
        enemy.damage = (enemy.damage || 1) + 1;
        enemy.speed *= 1.2;
        enemy.isElite = true;
        
        // Elite aura effect
        const aura = this.scene.add.circle(enemy.x, enemy.y, 25, 0xff0000, 0.2);
        enemy.eliteAura = aura;
        
        // Update aura position
        enemy.updateEliteAura = () => {
            if (aura && enemy.active) {
                aura.setPosition(enemy.x, enemy.y);
            }
        };
    }
    
    createSpawnEffect(x, y) {
        // Warning indicator
        const warning = this.scene.add.text(x, y - 30, '!', {
            fontSize: '24px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Pulsing animation
        gsap.to(warning, {
            alpha: 0,
            scale: 1.5,
            duration: 0.3,
            repeat: 2,
            yoyo: true,
            onComplete: () => warning.destroy()
        });
        
        // Ground crack/portal effect
        const portal = this.scene.add.circle(x, y, 5, 0x8b5cf6, 0.8);
        
        gsap.to(portal, {
            scaleX: 8,
            scaleY: 2,
            alpha: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => portal.destroy()
        });
        
        // Play spawn sound
        soundManager.play('enemyDeath', { playbackRate: 0.5 });
    }
    
    /**
     * Spawn boss with dramatic entrance
     */
    spawnBoss(x, y) {
        this.stop(); // Stop regular spawning during boss
        
        // Dramatic pause
        this.scene.cameras.main.shake(500, 0.02);
        
        // Boss warning
        const warning = this.scene.add.text(
            this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
            this.scene.cameras.main.scrollY + 100,
            'WARNING',
            {
                fontSize: '32px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ff0000'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        gsap.to(warning, {
            alpha: 0,
            duration: 0.5,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                warning.destroy();
                
                // Actually spawn boss
                this.scene.time.delayedCall(500, () => {
                    const boss = new Boss(this.scene, x, y);
                    this.scene.boss = boss;
                    this.scene.physics.add.collider(boss, this.scene.platforms);
                    
                    soundManager.play('bossAppear');
                });
            }
        });
    }
    
    /**
     * Get current difficulty info for UI
     */
    getDifficultyInfo() {
        return {
            wave: this.waveNumber,
            coefficient: this.difficultyCoefficient.toFixed(2),
            eliteChance: Math.floor(this.eliteChance * 100) + '%',
            credits: Math.floor(this.spawnCredits)
        };
    }
}

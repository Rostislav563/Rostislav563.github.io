/**
 * Difficulty Manager - Scales game difficulty dynamically
 */
class DifficultyManager {
    static DIFFICULTIES = {
        easy: {
            name: 'Easy',
            playerDamageMultiplier: 0.5,
            enemyHealthMultiplier: 0.7,
            enemyDamageMultiplier: 0.7,
            spawnRateMultiplier: 0.6,
            creditGainMultiplier: 0.7,
            scoreMultiplier: 0.5
        },
        normal: {
            name: 'Normal',
            playerDamageMultiplier: 1,
            enemyHealthMultiplier: 1,
            enemyDamageMultiplier: 1,
            spawnRateMultiplier: 1,
            creditGainMultiplier: 1,
            scoreMultiplier: 1
        },
        hard: {
            name: 'Hard',
            playerDamageMultiplier: 1.2,
            enemyHealthMultiplier: 1.5,
            enemyDamageMultiplier: 1.5,
            spawnRateMultiplier: 1.3,
            creditGainMultiplier: 1.5,
            scoreMultiplier: 1.5
        },
        nightmare: {
            name: 'Nightmare',
            playerDamageMultiplier: 1.5,
            enemyHealthMultiplier: 2,
            enemyDamageMultiplier: 2,
            spawnRateMultiplier: 1.8,
            creditGainMultiplier: 2,
            scoreMultiplier: 2.5,
            permaDeath: true
        }
    };
    
    constructor() {
        this.currentDifficulty = SaveSystem.loadSettings().difficulty || 'normal';
        this.timeAlive = 0;
        this.adaptiveMultiplier = 1;
        
        // Adaptive difficulty tracking
        this.recentDeaths = 0;
        this.recentDamage = 0;
        this.skillScore = 100; // 0-200, 100 is baseline
    }
    
    getSettings() {
        return DifficultyManager.DIFFICULTIES[this.currentDifficulty];
    }
    
    setDifficulty(difficulty) {
        if (DifficultyManager.DIFFICULTIES[difficulty]) {
            this.currentDifficulty = difficulty;
            SaveSystem.saveSettings({ difficulty });
        }
    }
    
    /**
     * Adaptive difficulty - adjusts based on player performance
     */
    update(delta, playerStats) {
        this.timeAlive += delta;
        
        // Track player performance
        if (playerStats.died) {
            this.recentDeaths++;
            this.skillScore = Math.max(0, this.skillScore - 10);
        }
        
        if (playerStats.tookDamage) {
            this.recentDamage++;
            this.skillScore = Math.max(0, this.skillScore - 2);
        }
        
        if (playerStats.killedEnemy) {
            this.skillScore = Math.min(200, this.skillScore + 3);
        }
        
        if (playerStats.perfectKill) { // Killed without taking damage
            this.skillScore = Math.min(200, this.skillScore + 5);
        }
        
        // Calculate adaptive multiplier
        // < 80 skill = easier, > 120 skill = harder
        this.adaptiveMultiplier = 0.5 + (this.skillScore / 200);
    }
    
    /**
     * Get enemy health with all multipliers
     */
    getEnemyHealth(baseHealth) {
        const settings = this.getSettings();
        return Math.ceil(baseHealth * settings.enemyHealthMultiplier * this.adaptiveMultiplier);
    }
    
    /**
     * Get enemy damage with all multipliers  
     */
    getEnemyDamage(baseDamage) {
        const settings = this.getSettings();
        return Math.ceil(baseDamage * settings.enemyDamageMultiplier * this.adaptiveMultiplier);
    }
    
    /**
     * Get player damage with all multipliers
     */
    getPlayerDamage(baseDamage) {
        const settings = this.getSettings();
        return Math.ceil(baseDamage * settings.playerDamageMultiplier);
    }
    
    /**
     * Get spawn rate multiplier
     */
    getSpawnRate() {
        const settings = this.getSettings();
        return settings.spawnRateMultiplier * this.adaptiveMultiplier;
    }
    
    /**
     * Get score for action
     */
    getScore(baseScore, action) {
        const settings = this.getSettings();
        let multiplier = settings.scoreMultiplier;
        
        // Bonus for streaks
        if (action === 'kill' && this.recentDamage === 0) {
            multiplier *= 1.5; // No-hit bonus
        }
        
        return Math.floor(baseScore * multiplier);
    }
    
    /**
     * Check if permadeath is enabled
     */
    isPermaDeath() {
        return this.getSettings().permaDeath || false;
    }
    
    /**
     * Reset adaptive metrics (between levels)
     */
    resetAdaptive() {
        this.recentDeaths = 0;
        this.recentDamage = 0;
        // Keep skill score persistent
    }
    
    /**
     * Get difficulty tier name based on current time
     */
    getTimeTier() {
        const minutes = this.timeAlive / 60000;
        
        if (minutes < 2) return { name: 'Calm', color: '#4ade80' };
        if (minutes < 5) return { name: 'Warming Up', color: '#fbbf24' };
        if (minutes < 10) return { name: 'Dangerous', color: '#f97316' };
        if (minutes < 15) return { name: 'Brutal', color: '#ef4444' };
        if (minutes < 20) return { name: 'Insane', color: '#dc2626' };
        return { name: 'IMPOSSIBLE', color: '#7c2d12' };
    }
}

// Global instance
const difficultyManager = new DifficultyManager();

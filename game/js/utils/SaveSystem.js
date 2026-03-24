/**
 * Save System - LocalStorage persistence with compression
 */
class SaveSystem {
    static SAVE_KEY = 'crystalquest_save';
    static SETTINGS_KEY = 'crystalquest_settings';
    
    static defaultData = {
        currentLevel: 1,
        highScore: 0,
        totalCoins: 0,
        unlockedAbilities: [],
        completedLevels: [],
        bestTimes: {},
        totalPlayTime: 0,
        deaths: 0,
        enemiesKilled: 0
    };
    
    static defaultSettings = {
        musicVolume: 0.3,
        sfxVolume: 0.5,
        screenShake: true,
        particles: true,
        showFPS: false,
        difficulty: 'normal' // easy, normal, hard, nightmare
    };
    
    /**
     * Save game data
     */
    static save(data) {
        try {
            const saveData = { ...this.load(), ...data, lastSaved: Date.now() };
            const compressed = this.compress(JSON.stringify(saveData));
            localStorage.setItem(this.SAVE_KEY, compressed);
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }
    
    /**
     * Load game data
     */
    static load() {
        try {
            const compressed = localStorage.getItem(this.SAVE_KEY);
            if (!compressed) return { ...this.defaultData };
            
            const json = this.decompress(compressed);
            return { ...this.defaultData, ...JSON.parse(json) };
        } catch (e) {
            console.error('Load failed:', e);
            return { ...this.defaultData };
        }
    }
    
    /**
     * Save settings
     */
    static saveSettings(settings) {
        try {
            const data = { ...this.loadSettings(), ...settings };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Settings save failed:', e);
            return false;
        }
    }
    
    /**
     * Load settings
     */
    static loadSettings() {
        try {
            const json = localStorage.getItem(this.SETTINGS_KEY);
            if (!json) return { ...this.defaultSettings };
            return { ...this.defaultSettings, ...JSON.parse(json) };
        } catch (e) {
            return { ...this.defaultSettings };
        }
    }
    
    /**
     * Reset all data
     */
    static reset() {
        localStorage.removeItem(this.SAVE_KEY);
        return { ...this.defaultData };
    }
    
    /**
     * Simple LZW-like compression
     */
    static compress(str) {
        // Base64 encode for safety, with simple RLE for repeated chars
        let compressed = '';
        let count = 1;
        
        for (let i = 0; i < str.length; i++) {
            if (str[i] === str[i + 1]) {
                count++;
            } else {
                if (count > 3) {
                    compressed += `\x00${String.fromCharCode(count)}${str[i]}`;
                } else {
                    compressed += str[i].repeat(count);
                }
                count = 1;
            }
        }
        
        return btoa(compressed);
    }
    
    /**
     * Decompress
     */
    static decompress(str) {
        try {
            const decoded = atob(str);
            let result = '';
            
            for (let i = 0; i < decoded.length; i++) {
                if (decoded[i] === '\x00') {
                    const count = decoded.charCodeAt(i + 1);
                    const char = decoded[i + 2];
                    result += char.repeat(count);
                    i += 2;
                } else {
                    result += decoded[i];
                }
            }
            
            return result;
        } catch (e) {
            return atob(str);
        }
    }
    
    /**
     * Export save as downloadable file
     */
    static export() {
        const data = this.load();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `crystalquest_save_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import save from file
     */
    static async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.save(data);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
    
    /**
     * Check if save exists
     */
    static hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
    
    /**
     * Get statistics
     */
    static getStats() {
        const data = this.load();
        return {
            playTime: this.formatTime(data.totalPlayTime),
            deaths: data.deaths,
            enemiesKilled: data.enemiesKilled,
            completedLevels: data.completedLevels.length,
            highScore: data.highScore
        };
    }
    
    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
}

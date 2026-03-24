/**
 * Sound Manager - Howler.js integration
 * Manages all game audio with spatial sound, ducking, and pools
 */
class SoundManager {
    static instance = null;
    
    constructor() {
        if (SoundManager.instance) return SoundManager.instance;
        SoundManager.instance = this;
        
        this.sounds = new Map();
        this.music = null;
        this.musicInterval = null;
        this.audioContext = null;
        this.audioUnlocked = false;
        this.currentMusicTrack = null;
        this.pendingMusicTrack = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.muted = false;
        
        this.initAudioUnlock();
    }
    
    static getInstance() {
        if (!SoundManager.instance) {
            new SoundManager();
        }
        return SoundManager.instance;
    }
    
    initAudioUnlock() {
        if (typeof document === 'undefined') return;

        const unlock = () => this.unlockAudio();
        document.addEventListener('pointerdown', unlock, { once: true, passive: true });
        document.addEventListener('keydown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true, passive: true });
    }

    unlockAudio() {
        if (this.audioUnlocked) {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            return;
        }

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioUnlocked = true;
        this.generateSoundEffects();

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (!this.muted && this.pendingMusicTrack) {
            const track = this.pendingMusicTrack;
            this.pendingMusicTrack = null;
            this.playMusic(track);
        }
    }
    
    generateSoundEffects() {
        // Jump sound - quick rising tone
        this.sounds.set('jump', this.createToneSound(200, 400, 0.1, 'square'));
        
        // Attack swoosh
        this.sounds.set('attack', this.createNoiseSound(0.08, 800, 200));
        
        // Hit sound
        this.sounds.set('hit', this.createToneSound(150, 80, 0.15, 'sawtooth'));
        
        // Coin collect
        this.sounds.set('coin', this.createToneSound(800, 1200, 0.1, 'sine'));
        
        // Enemy death
        this.sounds.set('enemyDeath', this.createToneSound(300, 100, 0.2, 'square'));
        
        // Player hurt
        this.sounds.set('hurt', this.createToneSound(200, 100, 0.2, 'sawtooth'));
        
        // Dash
        this.sounds.set('dash', this.createNoiseSound(0.12, 400, 100));
        
        // Level complete
        this.sounds.set('levelComplete', this.createMelody([523, 659, 784, 1047], 0.15));
        
        // Boss appear
        this.sounds.set('bossAppear', this.createToneSound(100, 50, 0.5, 'sawtooth'));
        
        // Menu select
        this.sounds.set('menuSelect', this.createToneSound(440, 880, 0.05, 'square'));
        
        // Powerup
        this.sounds.set('powerup', this.createMelody([440, 554, 659, 880], 0.1));
    }
    
    createToneSound(startFreq, endFreq, duration, type = 'sine') {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = startFreq + (endFreq - startFreq) * (i / length);
            const envelope = 1 - (i / length); // Fade out
            
            let sample;
            const phase = 2 * Math.PI * freq * t;
            
            switch (type) {
                case 'square':
                    sample = Math.sin(phase) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * ((freq * t) % 1) - 1;
                    break;
                case 'triangle':
                    sample = Math.abs(4 * ((freq * t) % 1) - 2) - 1;
                    break;
                default:
                    sample = Math.sin(phase);
            }
            
            data[i] = sample * envelope * 0.3;
        }
        
        return buffer;
    }
    
    createNoiseSound(duration, highFreq = 1000, lowFreq = 100) {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const envelope = 1 - (i / length);
            const noise = Math.random() * 2 - 1;
            data[i] = noise * envelope * 0.2;
        }
        
        return buffer;
    }
    
    createMelody(frequencies, noteDuration) {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        const totalLength = sampleRate * noteDuration * frequencies.length;
        const buffer = this.audioContext.createBuffer(1, totalLength, sampleRate);
        const data = buffer.getChannelData(0);
        
        frequencies.forEach((freq, noteIndex) => {
            const noteStart = noteIndex * sampleRate * noteDuration;
            const noteLength = sampleRate * noteDuration;
            
            for (let i = 0; i < noteLength; i++) {
                const t = i / sampleRate;
                const envelope = Math.max(0, 1 - (i / noteLength) * 1.5);
                data[noteStart + i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
            }
        });
        
        return buffer;
    }
    
    play(soundName, options = {}) {
        if (this.muted) return;
        if (!this.audioContext) return;
        
        const buffer = this.sounds.get(soundName);
        if (!buffer) return;
        
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const pitchVariance = options.pitchVariance ?? 0.08;
        const volumeVariance = options.volumeVariance ?? 0.1;
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const randomizedVolume = (options.volume || 1) * this.sfxVolume * (1 + (Math.random() - 0.5) * volumeVariance);
        gainNode.gain.value = Math.max(0, randomizedVolume);
        
        source.playbackRate.value = options.playbackRate || (1 + (Math.random() - 0.5) * pitchVariance);
        
        source.start(0);
        
        return source;
    }
    
    playMusic(trackName) {
        this.currentMusicTrack = trackName;
        if (this.muted) {
            this.pendingMusicTrack = trackName;
            return;
        }
        
        // Procedural music generation for each level theme
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
        }
        
        const themes = {
            village: { notes: [262, 294, 330, 349, 392], tempo: 400 },
            forest: { notes: [220, 262, 294, 330, 262], tempo: 500 },
            cave: { notes: [165, 196, 220, 196, 165], tempo: 600 },
            mountain: { notes: [330, 392, 440, 392, 330], tempo: 450 },
            castle: { notes: [196, 220, 262, 220, 196], tempo: 550 }
        };
        
        const theme = themes[trackName] || themes.village;
        if (!this.audioContext) {
            this.pendingMusicTrack = trackName;
            return;
        }
        this.pendingMusicTrack = null;
        let noteIndex = 0;
        
        this.musicInterval = setInterval(() => {
            if (this.muted) return;
            
            const freq = theme.notes[noteIndex % theme.notes.length];
            this.playNote(freq, 0.3, this.musicVolume * 0.3);
            noteIndex++;
        }, theme.tempo);
    }
    
    playNote(freq, duration, volume) {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }
    
    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
    
    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            this.stopMusic();
        } else if (this.currentMusicTrack && this.audioContext) {
            this.playMusic(this.currentMusicTrack);
        }
    }
    
    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }
}

// Global instance
const soundManager = SoundManager.getInstance();

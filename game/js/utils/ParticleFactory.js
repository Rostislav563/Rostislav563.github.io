/**
 * Particle Factory - Advanced particle effects using Phaser + GSAP
 */
class ParticleFactory {
    constructor(scene) {
        this.scene = scene;
        this.pools = new Map();
        this.activeParticles = new Set();
    }
    
    /**
     * Create explosion effect
     */
    explosion(x, y, options = {}) {
        const {
            color = 0xffa500,
            count = 20,
            speed = 200,
            size = 4,
            lifetime = 500,
            gravity = 300
        } = options;
        
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const velocity = speed * (0.5 + Math.random() * 0.5);
            
            const particle = this.scene.add.circle(x, y, size * Math.random() + 1, color);
            particle.setDepth(100);
            
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            gsap.to(particle, {
                x: x + vx * (lifetime / 1000),
                y: y + vy * (lifetime / 1000) + gravity * Math.pow(lifetime / 1000, 2) / 2,
                alpha: 0,
                scale: 0,
                duration: lifetime / 1000,
                ease: 'power2.out',
                onComplete: () => particle.destroy()
            });
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * Dust/smoke effect
     */
    dust(x, y, options = {}) {
        const {
            color = 0xcccccc,
            count = 8,
            direction = -1, // -1 up, 1 down
            spread = 30
        } = options;
        
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * spread;
            const particle = this.scene.add.circle(
                x + offsetX, 
                y, 
                Math.random() * 3 + 2, 
                color, 
                0.6
            );
            
            gsap.to(particle, {
                y: y + direction * (30 + Math.random() * 20),
                x: x + offsetX + (Math.random() - 0.5) * 20,
                alpha: 0,
                scale: 2,
                duration: 0.4 + Math.random() * 0.2,
                ease: 'power1.out',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Sparkle/magic effect
     */
    sparkle(x, y, options = {}) {
        const {
            color = 0xffff00,
            count = 12,
            radius = 30,
            duration = 0.8
        } = options;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const distance = radius * (0.5 + Math.random() * 0.5);
            
            const star = this.scene.add.star(
                x, y, 4, 2, 5, color
            );
            star.setAlpha(0);
            
            gsap.to(star, {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 1,
                rotation: Math.PI * 2,
                duration: duration / 2,
                ease: 'power2.out',
                onComplete: () => {
                    gsap.to(star, {
                        alpha: 0,
                        scale: 0,
                        duration: duration / 2,
                        onComplete: () => star.destroy()
                    });
                }
            });
        }
    }
    
    /**
     * Trail effect for moving objects
     */
    trail(x, y, options = {}) {
        const {
            color = 0x60a5fa,
            size = 6,
            alpha = 0.5,
            duration = 0.3
        } = options;
        
        const trail = this.scene.add.circle(x, y, size, color, alpha);
        
        gsap.to(trail, {
            alpha: 0,
            scale: 0.3,
            duration: duration,
            ease: 'power1.out',
            onComplete: () => trail.destroy()
        });
        
        return trail;
    }
    
    /**
     * Damage numbers
     */
    damageNumber(x, y, amount, options = {}) {
        const {
            color = '#ff4444',
            critical = false,
            heal = false
        } = options;
        
        const fontSize = critical ? 24 : 16;
        const displayColor = heal ? '#4ade80' : color;
        const prefix = heal ? '+' : '-';
        
        const text = this.scene.add.text(x, y, `${prefix}${amount}`, {
            fontSize: `${fontSize}px`,
            fontFamily: '"Press Start 2P", monospace',
            color: displayColor,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);
        
        // Animate with GSAP
        gsap.timeline()
            .to(text, {
                y: y - 50,
                duration: 0.5,
                ease: 'power2.out'
            })
            .to(text, {
                alpha: 0,
                y: y - 70,
                duration: 0.3,
                ease: 'power1.in',
                onComplete: () => text.destroy()
            });
        
        if (critical) {
            gsap.to(text, {
                scale: 1.3,
                duration: 0.1,
                yoyo: true,
                repeat: 2
            });
        }
        
        return text;
    }
    
    /**
     * Screen flash effect
     */
    screenFlash(options = {}) {
        const {
            color = 0xffffff,
            alpha = 0.8,
            duration = 0.15
        } = options;
        
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
            this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            color,
            alpha
        ).setDepth(500).setScrollFactor(0);
        
        gsap.to(flash, {
            alpha: 0,
            duration: duration,
            onComplete: () => flash.destroy()
        });
        
        return flash;
    }
    
    /**
     * Shockwave effect
     */
    shockwave(x, y, options = {}) {
        const {
            color = 0xffffff,
            maxRadius = 100,
            duration = 0.4,
            lineWidth = 3
        } = options;
        
        const graphics = this.scene.add.graphics();
        graphics.setDepth(150);
        
        const obj = { radius: 10, alpha: 1 };
        
        gsap.to(obj, {
            radius: maxRadius,
            alpha: 0,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                graphics.clear();
                graphics.lineStyle(lineWidth, color, obj.alpha);
                graphics.strokeCircle(x, y, obj.radius);
            },
            onComplete: () => graphics.destroy()
        });
        
        return graphics;
    }
    
    /**
     * Coin collect effect
     */
    coinCollect(x, y) {
        // Create arc of small coins
        for (let i = 0; i < 5; i++) {
            const coin = this.scene.add.circle(x, y, 4, 0xfbbf24);
            const angle = -Math.PI / 2 + (Math.random() - 0.5);
            
            gsap.to(coin, {
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 40 + 20,
                alpha: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => coin.destroy()
            });
        }
        
        // Plus text
        this.damageNumber(x, y - 10, '1', { color: '#fbbf24', heal: false });
    }
    
    /**
     * Death effect
     */
    death(x, y, color = 0xff0000) {
        this.explosion(x, y, { color, count: 30, speed: 250 });
        this.screenFlash({ color, alpha: 0.3 });
        this.shockwave(x, y, { color, maxRadius: 80 });
    }
    
    /**
     * Level up / power up effect
     */
    powerUp(x, y) {
        this.sparkle(x, y, { color: 0xffd700, count: 16, radius: 50 });
        this.shockwave(x, y, { color: 0xffd700, maxRadius: 60 });
        
        // Rising particles
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.rectangle(
                x + (Math.random() - 0.5) * 40,
                y + 20,
                4, 8, 0xffd700
            );
            
            gsap.to(particle, {
                y: y - 60,
                alpha: 0,
                duration: 1,
                delay: i * 0.05,
                ease: 'power1.out',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Continuous emitter for ambient effects
     */
    createEmitter(x, y, options = {}) {
        const {
            color = 0xffffff,
            interval = 100,
            lifetime = 1000,
            count = 1
        } = options;
        
        const emitter = {
            active: true,
            timer: null
        };
        
        emitter.timer = setInterval(() => {
            if (!emitter.active) return;
            
            for (let i = 0; i < count; i++) {
                const particle = this.scene.add.circle(
                    x + (Math.random() - 0.5) * 20,
                    y,
                    Math.random() * 2 + 1,
                    color,
                    0.5
                );
                
                gsap.to(particle, {
                    y: y - 30 - Math.random() * 20,
                    alpha: 0,
                    duration: lifetime / 1000,
                    onComplete: () => particle.destroy()
                });
            }
        }, interval);
        
        emitter.stop = () => {
            emitter.active = false;
            clearInterval(emitter.timer);
        };
        
        return emitter;
    }
}

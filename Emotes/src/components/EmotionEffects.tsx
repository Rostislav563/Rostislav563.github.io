import { useEffect, useRef } from 'react';
import type { EmotionType } from '../types/emotions';
import './EmotionEffects.css';

interface EmotionEffectsProps {
  emotion: EmotionType;
}

export function EmotionEffects({ emotion }: EmotionEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    let animationId: number;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 5 + 2;
        this.speedX = 0;
        this.speedY = 0;
        this.color = '#fff';
        this.life = 0;
        this.maxLife = 100;
        this.init();
      }

      init() {
        switch (emotion) {
          case 'sad':
            // Rain
            this.y = -10;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 8 + 10;
            this.color = 'rgba(174, 194, 224, 0.6)';
            this.maxLife = 200;
            break;

          case 'angry':
            // Fire
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
            this.size = Math.random() * 8 + 4;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = -(Math.random() * 4 + 3);
            const fireColors = ['#ff4500', '#ff6347', '#ff8c00', '#ffd700', '#ffaa00'];
            this.color = fireColors[Math.floor(Math.random() * fireColors.length)];
            this.maxLife = 60;
            break;

          case 'happy':
            // Confetti
            this.y = -10;
            this.x = Math.random() * canvas.width;
            this.size = Math.random() * 8 + 4;
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 3 + 2;
            const confettiColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.maxLife = 150;
            break;

          case 'surprised':
            // Stars
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = 0;
            this.speedY = 0;
            this.color = '#fff';
            this.maxLife = 50;
            break;

          case 'fearful':
            // Dark fog
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 100 + 50;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.3;
            this.color = 'rgba(30, 0, 50, 0.03)';
            this.maxLife = 200;
            break;

          case 'disgusted':
            // Green bubbles
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
            this.size = Math.random() * 15 + 5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = -(Math.random() * 2 + 1);
            const greenColors = ['#56ab2f', '#a8e063', '#7cb342', '#8bc34a'];
            this.color = greenColors[Math.floor(Math.random() * greenColors.length)];
            this.maxLife = 120;
            break;

          default:
            // Neutral - soft floating particles
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = 'rgba(255, 255, 255, 0.3)';
            this.maxLife = 300;
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        if (emotion === 'angry') {
          this.size *= 0.98;
        }

        if (emotion === 'happy') {
          this.speedX += Math.random() * 0.2 - 0.1;
        }
      }

      draw() {
        if (!ctx) return;

        ctx.save();
        
        if (emotion === 'surprised') {
          // Twinkling star
          const opacity = Math.sin(this.life * 0.2) * 0.5 + 0.5;
          ctx.globalAlpha = opacity;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          this.drawStar(this.x, this.y, 5, this.size, this.size / 2);
          ctx.fill();
        } else if (emotion === 'fearful') {
          // Foggy circle
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
          );
          gradient.addColorStop(0, 'rgba(30, 0, 50, 0.05)');
          gradient.addColorStop(1, 'rgba(30, 0, 50, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (emotion === 'disgusted') {
          // Bubble
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (emotion === 'sad') {
          // Rain drop
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(this.x, this.y, this.size * 0.5, this.size * 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Default circle
          ctx.globalAlpha = 1 - this.life / this.maxLife;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
        if (!ctx) return;
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
      }

      isAlive() {
        if (this.life >= this.maxLife) return false;
        if (this.y > canvas.height + 20) return false;
        if (this.y < -50 && emotion === 'angry') return false;
        if (this.size < 0.5) return false;
        return true;
      }
    }

    const particleCount = emotion === 'neutral' ? 30 : 
                          emotion === 'fearful' ? 15 :
                          emotion === 'surprised' ? 40 : 50;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.length < particleCount) {
        particles.push(new Particle());
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (!particles[i].isAlive()) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      particles.length = 0;
    };
  }, [emotion]);

  return <canvas ref={canvasRef} className="emotion-effects-canvas" />;
}

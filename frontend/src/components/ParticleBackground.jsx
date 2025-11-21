import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Sakura Particle class - falling cherry blossoms
        class SakuraParticle {
            constructor() {
                this.reset();
                // Start at random position for initial render
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20; // Start above screen
                this.size = Math.random() * 6 + 3; // Larger particles (3-9px)
                this.speedY = Math.random() * 1 + 0.5; // Falling speed
                this.speedX = Math.random() * 0.6 - 0.3; // Gentle horizontal drift
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02; // Gentle rotation
                this.opacity = Math.random() * 0.4 + 0.4; // More visible (0.4-0.8)
                this.sway = Math.random() * 0.5 + 0.5; // Swaying amplitude
                this.swaySpeed = Math.random() * 0.02 + 0.01;
                this.swayOffset = Math.random() * Math.PI * 2;

                // Pink color variations - sakura colors
                const colors = [
                    'rgba(255, 182, 193, ', // Light pink
                    'rgba(255, 192, 203, ', // Pink
                    'rgba(255, 228, 225, ', // Misty rose
                    'rgba(255, 240, 245, ', // Lavender blush
                    'rgba(255, 105, 180, ', // Hot pink for variety
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                // Falling motion
                this.y += this.speedY;

                // Swaying motion (side to side)
                this.swayOffset += this.swaySpeed;
                this.x += Math.sin(this.swayOffset) * this.sway;

                // Gentle rotation
                this.rotation += this.rotationSpeed;

                // Reset particle when it falls off screen
                if (this.y > canvas.height + 20) {
                    this.reset();
                }

                // Wrap horizontally
                if (this.x > canvas.width + 20) this.x = -20;
                if (this.x < -20) this.x = canvas.width + 20;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Draw petal-like shape
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.beginPath();

                // Simple petal shape (ellipse)
                ctx.ellipse(0, 0, this.size * 0.8, this.size, 0, 0, Math.PI * 2);
                ctx.fill();

                // Add a subtle center dot for detail
                ctx.fillStyle = this.color + (this.opacity * 0.6) + ')';
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // Create more particles for sakura effect
        const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new SakuraParticle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw subtle connections between nearby particles (optional, lighter effect)
            particles.forEach((particleA, indexA) => {
                particles.slice(indexA + 1).forEach(particleB => {
                    const dx = particleA.x - particleB.x;
                    const dy = particleA.y - particleB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 80) {
                        ctx.strokeStyle = `rgba(255, 192, 203, ${0.08 * (1 - distance / 80)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particleA.x, particleA.y);
                        ctx.lineTo(particleB.x, particleB.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'linear-gradient(180deg, #fff0f5 0%, #ffe4e1 40%, #ffc0cb 100%)',
            }}
        />
    );
};

export default ParticleBackground;

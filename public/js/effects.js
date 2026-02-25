/* ============================================
   DOODLE EFFECTS & ANIMATIONS ENGINE
   ============================================ */

class DoodleEffects {
    constructor() {
        this.particleContainer = null;
        this.createParticleContainer();
    }

    // Create particle container for effects
    createParticleContainer() {
        this.particleContainer = document.createElement('div');
        this.particleContainer.id = 'particle-container';
        this.particleContainer.style.position = 'fixed';
        this.particleContainer.style.top = '0';
        this.particleContainer.style.left = '0';
        this.particleContainer.style.width = '100%';
        this.particleContainer.style.height = '100vh';
        this.particleContainer.style.pointerEvents = 'none';
        this.particleContainer.style.zIndex = '999';
        document.body.appendChild(this.particleContainer);
    }

    // Confetti effect
    createConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 30) {
        const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#81C784', '#64B5F6'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '999';

            const angle = (Math.PI * 2 * i) / count;
            const velocity = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 2;

            this.particleContainer.appendChild(confetti);

            let posX = x;
            let posY = y;
            let velX = vx;
            let velY = vy;
            let life = 1;

            const animate = () => {
                posX += velX;
                posY += velY;
                velY += 0.1; // gravity
                life -= 0.02;

                confetti.style.left = posX + 'px';
                confetti.style.top = posY + 'px';
                confetti.style.opacity = life;

                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            animate();
        }
    }

    // Particle burst effect
    createParticleBurst(x, y, emoji = '✨', count = 12) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.fontSize = '1.5rem';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '999';
            particle.style.userSelect = 'none';
            particle.textContent = emoji;

            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rotation = Math.random() * 360;
            const duration = 0.8 + Math.random() * 0.5;

            this.particleContainer.appendChild(particle);

            particle.animate(
                [
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`, opacity: 0 }
                ],
                {
                    duration: duration * 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }
            ).onfinish = () => particle.remove();
        }
    }

    // Firefly effect
    createFireflies(count = 10, duration = 3000) {
        for (let i = 0; i < count; i++) {
            const firefly = document.createElement('div');
            firefly.style.position = 'fixed';
            firefly.style.width = '6px';
            firefly.style.height = '6px';
            firefly.style.backgroundColor = '#FFE66D';
            firefly.style.borderRadius = '50%';
            firefly.style.boxShadow = '0 0 10px #FFE66D';
            firefly.style.pointerEvents = 'none';
            firefly.style.zIndex = '999';

            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            const endX = Math.random() * window.innerWidth;
            const endY = Math.random() * window.innerHeight;

            firefly.style.left = startX + 'px';
            firefly.style.top = startY + 'px';

            this.particleContainer.appendChild(firefly);

            firefly.animate(
                [
                    { transform: 'translate(0, 0)', opacity: 0.3 },
                    { transform: `translate(${endX - startX}px, ${endY - startY}px)`, opacity: 0.8 },
                    { transform: 'translate(0, 0)', opacity: 0 }
                ],
                {
                    duration: duration,
                    easing: 'ease-in-out',
                    delay: Math.random() * duration,
                    iterations: Infinity
                }
            ).onfinish = () => firefly.remove();
        }
    }

    // Rainbow wave effect
    createRainbowWave(element) {
        const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#81C784', '#64B5F6'];
        let colorIndex = 0;

        const wave = setInterval(() => {
            element.style.color = colors[colorIndex];
            element.style.textShadow = `0 0 10px ${colors[colorIndex]}`;
            colorIndex = (colorIndex + 1) % colors.length;
        }, 150);

        return () => clearInterval(wave);
    }

    // Pulse effect
    createPulse(element, duration = 500) {
        element.animate(
            [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.1)', opacity: 0.5 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            {
                duration: duration,
                easing: 'ease-in-out'
            }
        );
    }

    // Shake effect
    createShake(element, intensity = 10, duration = 300) {
        const startX = element.offsetLeft;

        const shake = () => {
            for (let i = 0; i < duration; i += 30) {
                setTimeout(() => {
                    element.style.transform = `translateX(${(Math.random() - 0.5) * intensity}px)`;
                }, i);
            }
            element.style.transform = 'translateX(0)';
        };

        shake();
    }

    // Bounce effect
    createBounce(element, height = 20, duration = 600) {
        const startY = element.offsetTop;

        element.animate(
            [
                { transform: 'translateY(0)', offset: 0 },
                { transform: `translateY(-${height}px)`, offset: 0.5 },
                { transform: 'translateY(0)', offset: 1 }
            ],
            {
                duration: duration,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                iterations: 1
            }
        );
    }

    // Flip effect
    createFlip(element, duration = 600) {
        element.animate(
            [
                { transform: 'rotateY(0deg)' },
                { transform: 'rotateY(360deg)' }
            ],
            {
                duration: duration,
                easing: 'ease-in-out'
            }
        );
    }

    // Glow effect
    createGlow(element, color = '#FF6B9D', duration = 1000, intensity = 20) {
        const originalBoxShadow = element.style.boxShadow;

        element.animate(
            [
                { boxShadow: `0 0 0px ${color}` },
                { boxShadow: `0 0 ${intensity}px ${color}` },
                { boxShadow: `0 0 0px ${color}` }
            ],
            {
                duration: duration,
                easing: 'ease-in-out',
                iterations: Infinity
            }
        );
    }

    // Typewriter effect
    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;

        const type = () => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Matrix rain effect
    createMatrixRain(count = 5, duration = 5000) {
        const characters = ['🎨', '💬', '✨', '⭐', '🎉', '💫', '🌟', '💬'];

        for (let i = 0; i < count; i++) {
            const rain = document.createElement('div');
            rain.style.position = 'fixed';
            rain.style.fontSize = '2rem';
            rain.style.left = Math.random() * window.innerWidth + 'px';
            rain.style.top = '-50px';
            rain.style.pointerEvents = 'none';
            rain.style.zIndex = '999';
            rain.style.opacity = '0.6';
            rain.textContent = characters[Math.floor(Math.random() * characters.length)];

            this.particleContainer.appendChild(rain);

            const speed = 50 + Math.random() * 100;

            rain.animate(
                [
                    { transform: 'translateY(0) rotate(0deg)' },
                    { transform: `translateY(${window.innerHeight}px) rotate(360deg)` }
                ],
                {
                    duration: duration,
                    easing: 'linear'
                }
            ).onfinish = () => rain.remove();
        }
    }

    // Spotlight effect
    createSpotlight(x, y, radius = 100, intensity = 0.5) {
        const spotlight = document.createElement('div');
        spotlight.style.position = 'fixed';
        spotlight.style.left = x - radius + 'px';
        spotlight.style.top = y - radius + 'px';
        spotlight.style.width = radius * 2 + 'px';
        spotlight.style.height = radius * 2 + 'px';
        spotlight.style.borderRadius = '50%';
        spotlight.style.background = `radial-gradient(circle, rgba(255, 255, 255, ${intensity}) 0%, rgba(255, 255, 255, 0) 70%)`;
        spotlight.style.pointerEvents = 'none';
        spotlight.style.zIndex = '999';

        this.particleContainer.appendChild(spotlight);

        setTimeout(() => spotlight.remove(), 1000);
    }

    // Snow effect
    createSnowEffect(count = 50, duration = 10000) {
        for (let i = 0; i < count; i++) {
            const snowflake = document.createElement('div');
            snowflake.style.position = 'fixed';
            snowflake.textContent = '❄️';
            snowflake.style.fontSize = (10 + Math.random() * 10) + 'px';
            snowflake.style.left = Math.random() * window.innerWidth + 'px';
            snowflake.style.top = '-10px';
            snowflake.style.pointerEvents = 'none';
            snowflake.style.zIndex = '999';
            snowflake.style.opacity = Math.random() * 0.5 + 0.5;

            this.particleContainer.appendChild(snowflake);

            const weight = 50 + Math.random() * 100;
            const horizontalDrift = (Math.random() - 0.5) * 100;

            snowflake.animate(
                [
                    { 
                        transform: 'translateY(0) translateX(0) rotate(0deg)', 
                        opacity: Math.random() * 0.5 + 0.5 
                    },
                    { 
                        transform: `translateY(${window.innerHeight}px) translateX(${horizontalDrift}px) rotate(360deg)`, 
                        opacity: 0 
                    }
                ],
                {
                    duration: duration,
                    easing: 'linear'
                }
            ).onfinish = () => snowflake.remove();
        }
    }

    // Easter egg effect - when message contains specific keywords
    triggerSpecialEffect(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('🎉') || lowerMessage.includes('party') || lowerMessage.includes('celebrate')) {
            this.createConfetti();
        } else if (lowerMessage.includes('✨') || lowerMessage.includes('magic')) {
            this.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, '✨', 20);
        } else if (lowerMessage.includes('❄️') || lowerMessage.includes('snow')) {
            this.createSnowEffect(30, 10000);
        } else if (lowerMessage.includes('🔥') || lowerMessage.includes('fire')) {
            this.createMatrixRain(8, 3000);
        }
    }
}

// Initialize effects engine
const doodleEffects = new DoodleEffects();

// ============================================
// ADD EFFECTS TO MESSAGE SENDING
// ============================================

// Hook into message sending
const originalSendMessage = chatManager.sendMessage;
chatManager.sendMessage = async function() {
    const messageText = this.messageInput?.value || '';
    
    // Trigger special effects if needed
    doodleEffects.triggerSpecialEffect(messageText);
    
    // Call original send function
    return await originalSendMessage.call(this);
};

// ============================================
// ADD HOVER EFFECTS TO USERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add glow effect on user item hover
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.user-item')) {
            const userItem = e.target.closest('.user-item');
            userItem.classList.add('doodle-glow');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.user-item')) {
            const userItem = e.target.closest('.user-item');
            userItem.classList.remove('doodle-glow');
        }
    });
});

// ============================================
// EXPORT FOR USE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoodleEffects;
}

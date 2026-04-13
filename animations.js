/* ===================================================
   Health Advisor — Animation Engine
   =================================================== */

(function () {
    'use strict';

    // ===== Splash Screen Particles =====
    function initSplashParticles() {
        const container = document.getElementById('splash-dots');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const dot = document.createElement('div');
            dot.className = 'splash-dot';
            const size = Math.random() * 80 + 15;
            dot.style.width = size + 'px';
            dot.style.height = size + 'px';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.bottom = -(size) + 'px';
            dot.style.animationDuration = (Math.random() * 5 + 4) + 's';
            dot.style.animationDelay = (Math.random() * 2.5) + 's';
            container.appendChild(dot);
        }
    }

    // ===== Splash Screen Dismiss =====
    function initSplashDismiss() {
        const splash = document.getElementById('splash-screen');
        if (!splash) return;

        setTimeout(() => {
            splash.classList.add('splash-hide');
            setTimeout(() => splash.remove(), 800);
        }, 2500);
    }

    // ===== Intersection Observer for Scroll Animations =====
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        // Observe glass cards and hero stats
        document.querySelectorAll('.glass, .hero-stat').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(el);
        });
    }

    // ===== Stagger Hero Stats =====
    function staggerHeroStats() {
        document.querySelectorAll('.hero-stat').forEach((stat, i) => {
            stat.style.transitionDelay = (0.15 + i * 0.1) + 's';
        });
    }

    // ===== Smooth Nav Transitions =====
    function enhanceNavTransitions() {
        const origNavigateTo = window.navigateTo;
        if (!origNavigateTo) return;

        window.navigateTo = function (n) {
            const activeScreen = document.querySelector('.screen:not(.hidden)');
            if (activeScreen) {
                activeScreen.style.opacity = '0';
                activeScreen.style.transform = 'translateY(-8px)';
                setTimeout(() => {
                    origNavigateTo(n);
                    const newScreen = document.getElementById('screen-' + n);
                    if (newScreen) {
                        newScreen.style.opacity = '0';
                        newScreen.style.transform = 'translateY(10px)';
                        requestAnimationFrame(() => {
                            newScreen.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                            newScreen.style.opacity = '1';
                            newScreen.style.transform = 'translateY(0)';
                        });
                    }
                }, 150);
            } else {
                origNavigateTo(n);
            }
        };
    }

    // ===== Ripple Effect on Buttons =====
    function initButtonRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-expand 0.5s ease-out forwards;
                pointer-events: none;
            `;

            btn.style.position = btn.style.position || 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });

        // Inject ripple keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-expand {
                to { transform: scale(2.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Parallax on Hero =====
    function initHeroParallax() {
        const hero = document.querySelector('.hero-banner');
        if (!hero) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 5;

            hero.style.setProperty('--px', x + 'px');
            hero.style.setProperty('--py', y + 'px');

            const before = hero.querySelector('::before');
            hero.style.backgroundPosition = `${50 + x * 0.3}% ${50 + y * 0.3}%`;
        });

        hero.addEventListener('mouseleave', () => {
            hero.style.backgroundPosition = '';
        });
    }

    // ===== Counter Animation for Hero Stats =====
    function animateCounters() {
        document.querySelectorAll('.hero-stat-value').forEach(el => {
            const text = el.textContent.trim();
            const match = text.match(/^(\d+)\+?$/);
            if (!match) return;

            const target = parseInt(match[1]);
            const suffix = text.includes('+') ? '+' : (text.includes('%') ? '%' : '');
            let current = 0;
            const step = Math.ceil(target / 30);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                el.textContent = current + suffix;
            }, 40);
        });
    }

    // ===== Initialize Everything =====
    function init() {
        initSplashParticles();
        initSplashDismiss();
        initButtonRipples();

        // Delay scroll-related animations until page is ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                staggerHeroStats();
                initScrollAnimations();
                enhanceNavTransitions();
                initHeroParallax();
                animateCounters();
            }, 300);
        });
    }

    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

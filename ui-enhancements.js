document.addEventListener('DOMContentLoaded', () => {
    initTypingAnimation();
    initScrollReveal();
    initGlitchEffect();
    initMobileMenu();
});

// Typing Animation for Hero Terminal
function initTypingAnimation() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    // Clear existing content for animation
    const originalContent = terminalBody.innerHTML;
    terminalBody.innerHTML = '';

    const lines = [
        { type: 'command', text: 'npm install cryptocommerce-sdk', prompt: '$' },
        { type: 'output', text: 'Installing CryptoCommerce SDK...', delay: 500 },
        { type: 'output', text: '✓ Payment gateway initialized', className: 'success', delay: 1500 },
        { type: 'output', text: '✓ Multi-chain support enabled', className: 'success', delay: 2000 },
        { type: 'output', text: '✓ Shopping cart integration ready', className: 'success', delay: 2500 },
        { type: 'command', text: '_', prompt: '$', className: 'cursor-blink', delay: 3000 }
    ];

    let currentLineIndex = 0;

    function typeLine() {
        if (currentLineIndex >= lines.length) return;

        const lineData = lines[currentLineIndex];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'terminal-line';

        if (lineData.delay) {
            setTimeout(() => {
                renderLine(lineDiv, lineData);
                terminalBody.appendChild(lineDiv);
                currentLineIndex++;
                typeLine();
            }, lineData.delay - (currentLineIndex > 0 ? lines[currentLineIndex - 1].delay || 0 : 0));
        } else {
            renderLine(lineDiv, lineData);
            terminalBody.appendChild(lineDiv);
            currentLineIndex++;
            typeLine();
        }
    }

    function renderLine(container, data) {
        if (data.prompt) {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = data.prompt + ' ';
            container.appendChild(promptSpan);
        }

        const textSpan = document.createElement('span');
        textSpan.className = data.type === 'command' ? 'command' : 'output';
        if (data.className) textSpan.classList.add(data.className);

        if (data.type === 'command' && data.text !== '_') {
            // Typewriter effect for commands
            let charIndex = 0;
            textSpan.textContent = '';
            container.appendChild(textSpan);

            const typeInterval = setInterval(() => {
                textSpan.textContent += data.text[charIndex];
                charIndex++;
                if (charIndex >= data.text.length) {
                    clearInterval(typeInterval);
                }
            }, 50);
        } else {
            textSpan.textContent = data.text;
            container.appendChild(textSpan);
        }
    }

    // Start animation
    typeLine();
}

// Scroll Reveal Animation
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.section, .feature-card, .hero-text, .terminal-window');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}

// Glitch Effect (Random)
function initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.hero-title, .nav-logo');

    setInterval(() => {
        const randomEl = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        if (randomEl) {
            randomEl.classList.add('glitch-anim');
            setTimeout(() => {
                randomEl.classList.remove('glitch-anim');
            }, 200);
        }
    }, 3000);
}

// Mobile Menu
function initMobileMenu() {
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');

    if (!navContainer || !navLinks) return;

    // Create hamburger button
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    // Insert before nav links
    navContainer.insertBefore(hamburger, navLinks);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

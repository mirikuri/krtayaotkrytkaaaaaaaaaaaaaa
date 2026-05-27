/* ═══════════════════════════════════════════
   metaxxd profile — interactive layer
   ═══════════════════════════════════════════ */

// ───────────── 1. MATRIX RAIN BACKGROUND ─────────────
(function matrixRain() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, cols, drops;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ﾊﾋﾌﾍﾎ♡♥<>{}[]()=+*$#';

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const size = 14;
        cols = Math.floor(w / size);
        drops = Array(cols).fill(0).map(() => Math.random() * -h / size);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        ctx.fillStyle = 'rgba(5, 4, 9, 0.08)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = '14px JetBrains Mono, monospace';
        for (let i = 0; i < cols; i++) {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 14;
            const y = drops[i] * 14;

            // Голова — ярче
            const isHead = Math.random() > 0.97;
            ctx.fillStyle = isHead ? '#ffffff' : '#ff52cc';
            ctx.shadowColor = '#ff52cc';
            ctx.shadowBlur = isHead ? 14 : 4;
            ctx.fillText(ch, x, y);

            if (y > h && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        ctx.shadowBlur = 0;
    }
    setInterval(draw, 55);
})();

// ───────────── 2. BOOT SCREEN ─────────────
(function bootSequence() {
    const boot = document.getElementById('boot-screen');
    if (!boot) return;
    const log = boot.querySelector('.boot-log');
    const bar = boot.querySelector('.boot-bar > div');

    const lines = [
        ['[ <span class="ok">OK</span> ] booting metaxxd.profile v2.6...', 200],
        ['[ <span class="ok">OK</span> ] mounting <span class="pink">/dev/heart</span>', 250],
        ['[ <span class="ok">OK</span> ] loading anime.css', 200],
        ['[ <span class="ok">OK</span> ] connecting to <span class="pink">cyber.net</span>', 300],
        ['[ <span class="ok">OK</span> ] decrypting cute secrets...', 250],
        ['[ <span class="ok">OK</span> ] injecting glitter into pixels', 200],
        ['[ <span class="ok">DONE</span> ] welcome back, <span class="pink">user</span> ♡', 300],
    ];

    let idx = 0;
    function next() {
        if (idx >= lines.length) {
            bar.style.width = '100%';
            setTimeout(() => {
                boot.classList.add('done');
                document.body.style.overflow = '';
                triggerWelcomeAnimations();
            }, 400);
            return;
        }
        log.innerHTML += lines[idx][0] + '\n';
        bar.style.width = ((idx + 1) / lines.length * 100) + '%';
        idx++;
        setTimeout(next, lines[idx - 1] ? lines[idx - 1][1] : 200);
    }
    document.body.style.overflow = 'hidden';
    setTimeout(next, 200);
})();

// ───────────── 3. WELCOME / TYPEWRITER ─────────────
function triggerWelcomeAnimations() {
    const console = document.querySelector('.console-box');
    if (!console) return;
    const lines = [
        '&gt; initializing profile...',
        '&gt; loading modules: <span class="keyword">python</span>, <span class="keyword">net</span>, <span class="keyword">ctf</span>',
        '&gt; status: <span class="success">ready</span>'
    ];
    console.innerHTML = '<span class="cursor-blink"></span>';
    let i = 0, ch = 0, current = '';
    function type() {
        if (i >= lines.length) {
            console.innerHTML = lines.join('<br>') + '<span class="cursor-blink"></span>';
            return;
        }
        const target = lines[i];
        if (ch < target.length) {
            // skip HTML tags
            if (target[ch] === '<') {
                const close = target.indexOf('>', ch);
                current += target.slice(ch, close + 1);
                ch = close + 1;
            } else {
                current += target[ch];
                ch++;
            }
            console.innerHTML = (i > 0 ? lines.slice(0, i).join('<br>') + '<br>' : '') + current + '<span class="cursor-blink"></span>';
            setTimeout(type, 18);
        } else {
            i++;
            ch = 0;
            current = '';
            setTimeout(type, 220);
        }
    }
    type();

    // live clock
    const clock = document.querySelector('.live-clock');
    if (clock) {
        const tick = () => {
            const d = new Date();
            const pad = n => String(n).padStart(2, '0');
            clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        tick();
        setInterval(tick, 1000);
    }
}

// ───────────── 4. CUSTOM CURSOR ─────────────
(function customCursor() {
    if (window.matchMedia('(max-width: 720px)').matches) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

        // heart trail (rare)
        if (Math.random() > 0.93) {
            const heart = document.createElement('div');
            heart.className = 'heart-trail';
            heart.textContent = ['♥', '♡', '✦', '✿'][Math.floor(Math.random() * 4)];
            heart.style.left = mx + 'px';
            heart.style.top = my + 'px';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1100);
        }
    });

    function animate() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    }
    animate();

    // hover targets
    const hoverSel = 'a, button, .win-btn, .hobby-card, .keyword, .sticky-note, .feature-sticker, th, td';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverSel)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverSel)) ring.classList.remove('hovering');
    });
})();

// ───────────── 5. SCROLL REVEAL ─────────────
(function scrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        targets.forEach(t => t.classList.add('visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('visible');
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });
    targets.forEach(t => io.observe(t));
})();

// ───────────── 6. HOBBY CARDS: TILT + LIGHTBOX ─────────────
(function gallery() {
    const cards = document.querySelectorAll('.hobby-card');
    cards.forEach(card => {
        const img = card.querySelector('img');

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });

        if (img) {
            card.addEventListener('click', () => openLightbox(img.src, img.alt));
        }
    });

    // lightbox
    const lb = document.getElementById('lightbox');
    const lbImg = lb && lb.querySelector('img');
    const lbClose = lb && lb.querySelector('.lightbox-close');

    window.openLightbox = (src, alt) => {
        if (!lb) return;
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.classList.add('open');
    };
    function close() { lb && lb.classList.remove('open'); }
    if (lb) {
        lb.addEventListener('click', e => { if (e.target === lb) close(); });
        lbClose && lbClose.addEventListener('click', close);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
})();

// ───────────── 7. WINDOW CONTROLS ─────────────
document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('.page-wrapper');
    const controlButtons = document.querySelectorAll('.window-controls .win-btn');
    if (!wrapper || controlButtons.length < 3) return;
    const [minimizeBtn, expandBtn, closeBtn] = controlButtons;

    closeBtn.addEventListener('click', () => {
        if (confirm("Вы уверены, что хотите закрыть терминал profile.exe?")) {
            wrapper.style.transition = "all .45s cubic-bezier(.55,.085,.68,.53)";
            wrapper.style.opacity = "0";
            wrapper.style.transform = "scale(.7) rotate(-3deg)";
            setTimeout(() => {
                wrapper.innerHTML = `
                    <div style="text-align:center; padding:60px 20px; font-family:'JetBrains Mono',monospace;">
                        <h1 style="color:#ff52cc; margin-bottom:10px; font-family:'Press Start 2P',monospace; font-size:18px;">TERMINAL CLOSED</h1>
                        <p style="color:#a39cb0; font-size:13px;">Обнови страницу (F5), чтобы перезапустить систему ♡</p>
                    </div>`;
                wrapper.style.opacity = "1";
                wrapper.style.transform = "scale(1) rotate(0deg)";
            }, 450);
        }
    });

    let isExpanded = false;
    expandBtn.addEventListener('click', () => {
        wrapper.style.transition = "max-width .4s cubic-bezier(.25,.46,.45,.94)";
        if (!isExpanded) {
            wrapper.style.maxWidth = "100%";
            expandBtn.textContent = "⧉";
            isExpanded = true;
        } else {
            wrapper.style.maxWidth = "860px";
            expandBtn.textContent = "▢";
            isExpanded = false;
        }
    });

    minimizeBtn.addEventListener('click', () => {
        wrapper.style.transition = "all .15s ease-in-out";
        wrapper.style.opacity = "0.1";
        wrapper.style.transform = "scaleY(0.05)";
        setTimeout(() => {
            wrapper.style.transform = "scaleY(1)";
            wrapper.style.opacity = "1";
        }, 250);
    });
});

// ───────────── 8. KONAMI EASTER EGG ─────────────
(function konami() {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let i = 0;
    document.addEventListener('keydown', e => {
        const k = e.key;
        if (k.toLowerCase() === seq[i].toLowerCase()) {
            i++;
            if (i === seq.length) {
                i = 0;
                triggerRainbow();
            }
        } else {
            i = 0;
        }
    });

    function triggerRainbow() {
        showToast('★ HACK MODE UNLOCKED ★');
        document.documentElement.style.transition = 'filter 1s';
        document.documentElement.style.filter = 'hue-rotate(0deg)';
        let deg = 0;
        const id = setInterval(() => {
            deg = (deg + 8) % 360;
            document.documentElement.style.filter = `hue-rotate(${deg}deg)`;
        }, 60);
        // shower of hearts
        for (let n = 0; n < 60; n++) {
            setTimeout(() => spawnConfetti(), n * 40);
        }
        setTimeout(() => {
            clearInterval(id);
            document.documentElement.style.filter = '';
        }, 6000);
    }

    function spawnConfetti() {
        const el = document.createElement('div');
        el.className = 'heart-trail';
        el.textContent = ['♥','♡','✦','★','✿','💖'][Math.floor(Math.random()*6)];
        el.style.left = Math.random() * window.innerWidth + 'px';
        el.style.top = '-20px';
        el.style.fontSize = (12 + Math.random() * 18) + 'px';
        el.style.animation = 'none';
        document.body.appendChild(el);
        const dx = (Math.random() - 0.5) * 200;
        const dy = window.innerHeight + 50;
        el.animate(
            [
                { transform: `translate(-50%, -50%)`, opacity: 1 },
                { transform: `translate(calc(-50% + ${dx}px), ${dy}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
            ],
            { duration: 2500 + Math.random() * 1500, easing: 'cubic-bezier(.3,.2,.7,1)' }
        );
        setTimeout(() => el.remove(), 4500);
    }
})();

// ───────────── 9. TOAST ─────────────
function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ───────────── 10. CLICK SPARKLE ─────────────
document.addEventListener('click', e => {
    if (e.target.closest('.lightbox, .win-btn')) return;
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('div');
        s.className = 'heart-trail';
        s.textContent = ['✦','♡','✿'][Math.floor(Math.random()*3)];
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        document.body.appendChild(s);
        const a = (Math.PI * 2 * i) / 6 + Math.random();
        const r = 40 + Math.random() * 30;
        s.animate(
            [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${Math.cos(a)*r}px), calc(-50% + ${Math.sin(a)*r}px)) scale(.3)`, opacity: 0 }
            ],
            { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' }
        );
        setTimeout(() => s.remove(), 800);
    }
});

// ==================== 知一 - 主应用入口 ====================
(function() {
'use strict';

// ========== 粒子特效系统 ==========
const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    config: null,
    mouseX: 0,
    mouseY: 0,

    init() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start(config) {
        this.stop();
        this.config = config || { type: 'bubbles', color: '#667eea', count: 50, speed: 1, size: 4 };
        this.particles = [];
        this.createParticles();
        this.animate();
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    createParticles() {
        const { count, type } = this.config;
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(type));
        }
    },

    createParticle(type) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const base = {
            x: Math.random() * w,
            y: Math.random() * h,
            size: this.config.size * (0.5 + Math.random() * 1.5),
            speed: this.config.speed * (0.5 + Math.random()),
            color: this.config.color,
            opacity: 0.3 + Math.random() * 0.5,
            vx: 0, vy: 0, angle: 0, life: 1
        };

        switch(type) {
            case 'bubbles':
                base.vy = -base.speed * 0.5;
                base.vx = (Math.random() - 0.5) * 0.5;
                break;
            case 'snow':
                base.vy = base.speed * 0.8;
                base.vx = (Math.random() - 0.5) * 1;
                base.size = 2 + Math.random() * 4;
                break;
            case 'stars':
                base.vx = base.vy = 0;
                base.twinkle = Math.random() * Math.PI * 2;
                break;
            case 'fireflies':
                base.vx = (Math.random() - 0.5) * base.speed;
                base.vy = (Math.random() - 0.5) * base.speed;
                base.twinkle = Math.random() * Math.PI * 2;
                break;
            case 'petals':
                base.vy = base.speed * 0.6;
                base.vx = Math.sin(Math.random() * Math.PI * 2) * 0.5;
                base.rotation = Math.random() * Math.PI * 2;
                base.rotSpeed = (Math.random() - 0.5) * 0.05;
                break;
            case 'rain':
                base.x = Math.random() * w;
                base.y = Math.random() * h;
                base.vy = base.speed * 8;
                base.vx = 0.5;
                base.size = 1;
                base.length = 15 + Math.random() * 20;
                break;
            case 'dust':
                base.vx = (Math.random() - 0.5) * 0.3;
                base.vy = (Math.random() - 0.5) * 0.3;
                break;
            case 'glow':
                base.vx = base.vy = 0;
                base.pulse = Math.random() * Math.PI * 2;
                break;
            case 'vortex':
                base.angle = Math.random() * Math.PI * 2;
                base.radius = 50 + Math.random() * 200;
                base.centerX = w / 2;
                base.centerY = h / 2;
                base.angularSpeed = 0.01 + Math.random() * 0.02;
                break;
            case 'matrix':
                base.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
                base.char = base.chars[Math.floor(Math.random() * base.chars.length)];
                base.vy = base.speed * 2;
                base.fontSize = 10 + Math.random() * 6;
                break;
            case 'firework':
                base.particleType = 'rocket';
                base.vy = -base.speed * 3;
                base.targetY = h * 0.2 + Math.random() * h * 0.4;
                base.exploded = false;
                break;
            case 'meteor':
                base.x = Math.random() * w;
                base.y = -50;
                base.vx = base.speed * 3;
                base.vy = base.speed * 5;
                base.trail = [];
                break;
            case 'hearts':
                base.vy = -base.speed * 0.5;
                base.vx = Math.sin(Date.now() / 1000 + base.x) * 0.5;
                base.rotation = Math.random() * Math.PI * 2;
                break;
            case 'notes':
                base.vy = -base.speed * 0.8;
                base.vx = (Math.random() - 0.5) * 0.5;
                base.noteType = Math.floor(Math.random() * 3);
                break;
            case 'pixels':
                base.vy = base.speed * 0.3;
                base.vx = (Math.random() - 0.5) * 0.2;
                base.size = Math.floor(base.size) || 2;
                break;
            case 'neon':
                base.vx = (Math.random() - 0.5) * base.speed;
                base.vy = (Math.random() - 0.5) * base.speed;
                base.glow = Math.random() * Math.PI * 2;
                break;
            case 'ink':
                base.vx = (Math.random() - 0.5) * 0.2;
                base.vy = (Math.random() - 0.5) * 0.2;
                base.expand = 0;
                base.maxExpand = 30 + Math.random() * 50;
                break;
            case 'confetti':
                base.vy = base.speed * 1.5;
                base.vx = (Math.random() - 0.5) * 2;
                base.rotation = Math.random() * Math.PI * 2;
                base.rotSpeed = (Math.random() - 0.5) * 0.1;
                base.color = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][Math.floor(Math.random()*6)];
                break;
            default:
                base.vy = -base.speed * 0.5;
                base.vx = (Math.random() - 0.5) * 0.5;
        }
        return base;
    },

    animate() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const type = this.config.type;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.updateParticle(p, type, w, h);
            this.drawParticle(ctx, p, type);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    updateParticle(p, type, w, h) {
        switch(type) {
            case 'bubbles':
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.y / 50) * 0.5;
                if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
                break;
            case 'snow':
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.y / 30) * 0.5;
                if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
                break;
            case 'stars':
                p.twinkle += 0.03;
                p.opacity = 0.3 + Math.sin(p.twinkle) * 0.5;
                break;
            case 'fireflies':
                p.x += p.vx;
                p.y += p.vy;
                p.twinkle += 0.05;
                p.opacity = 0.2 + Math.sin(p.twinkle) * 0.6;
                if (Math.random() < 0.02) {
                    p.vx = (Math.random() - 0.5) * p.speed;
                    p.vy = (Math.random() - 0.5) * p.speed;
                }
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                break;
            case 'petals':
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.y / 40) * 0.8;
                p.rotation += p.rotSpeed;
                if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
                break;
            case 'rain':
                p.y += p.vy;
                p.x += p.vx;
                if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
                break;
            case 'dust':
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                break;
            case 'glow':
                p.pulse += 0.02;
                p.opacity = 0.2 + Math.sin(p.pulse) * 0.4;
                p.currentSize = p.size * (1 + Math.sin(p.pulse) * 0.3);
                break;
            case 'vortex':
                p.angle += p.angularSpeed;
                p.x = p.centerX + Math.cos(p.angle) * p.radius;
                p.y = p.centerY + Math.sin(p.angle) * p.radius;
                break;
            case 'matrix':
                p.y += p.vy;
                if (Math.random() < 0.1) {
                    p.char = p.chars[Math.floor(Math.random() * p.chars.length)];
                }
                if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
                break;
            case 'firework':
                if (!p.exploded) {
                    p.y += p.vy;
                    if (p.y <= p.targetY) {
                        p.exploded = true;
                        for (let j = 0; j < 20; j++) {
                            const angle = (j / 20) * Math.PI * 2;
                            const speed = 1 + Math.random() * 2;
                            this.particles.push({
                                x: p.x, y: p.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                size: 2, color: p.color,
                                opacity: 1, life: 1,
                                particleType: 'spark'
                            });
                        }
                        p.life = 0;
                    }
                } else if (p.particleType === 'spark') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.05;
                    p.life -= 0.015;
                    p.opacity = p.life;
                }
                break;
            case 'meteor':
                p.x += p.vx;
                p.y += p.vy;
                p.trail.push({ x: p.x, y: p.y, opacity: 1 });
                if (p.trail.length > 15) p.trail.shift();
                p.trail.forEach((t, i) => { t.opacity = i / p.trail.length; });
                if (p.y > h + 100 || p.x > w + 100) {
                    p.x = Math.random() * w * 0.5;
                    p.y = -50;
                    p.trail = [];
                }
                break;
            case 'hearts':
                p.y += p.vy;
                p.x += Math.sin(p.y / 30) * 0.8;
                if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; }
                break;
            case 'notes':
                p.y += p.vy;
                p.x += p.vx;
                if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; }
                break;
            case 'pixels':
                p.y += p.vy;
                p.x += p.vx;
                if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
                break;
            case 'neon':
                p.x += p.vx;
                p.y += p.vy;
                p.glow += 0.05;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                break;
            case 'ink':
                p.x += p.vx;
                p.y += p.vy;
                p.expand += 0.2;
                p.opacity = Math.max(0, 0.5 - p.expand / p.maxExpand * 0.5);
                if (p.expand > p.maxExpand) {
                    p.x = Math.random() * w;
                    p.y = Math.random() * h;
                    p.expand = 0;
                }
                break;
            case 'confetti':
                p.y += p.vy;
                p.x += p.vx;
                p.rotation += p.rotSpeed;
                p.vy += 0.02;
                if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
                break;
            default:
                p.y += p.vy;
                p.x += p.vx;
                if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        }

        if (p.life !== undefined && p.life <= 0 && type === 'firework') {
            this.particles.splice(i, 1);
            i--;
            if (this.particles.length < this.config.count * 0.5) {
                this.particles.push(this.createParticle('firework'));
            }
        }
    },

    drawParticle(ctx, p, type) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        switch(type) {
            case 'bubbles':
            case 'glow':
                const size = p.currentSize || p.size;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
                if (type === 'glow') {
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = p.color;
                    ctx.fill();
                }
                break;
            case 'snow':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'stars':
                this.drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2);
                break;
            case 'fireflies':
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'petals':
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'rain':
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 2, p.y + p.length);
                ctx.stroke();
                break;
            case 'dust':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'vortex':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'matrix':
                ctx.font = `${p.fontSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.shadowBlur = 5;
                ctx.shadowColor = p.color;
                ctx.fillText(p.char, p.x, p.y);
                break;
            case 'firework':
                if (p.particleType === 'rocket' || p.particleType === 'spark') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'meteor':
                p.trail.forEach((t, i) => {
                    ctx.globalAlpha = t.opacity * 0.5;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, p.size * (i / p.trail.length), 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = p.opacity;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'hearts':
                this.drawHeart(ctx, p.x, p.y, p.size);
                break;
            case 'notes':
                ctx.font = `${p.size * 3}px serif`;
                ctx.textAlign = 'center';
                const notes = ['♪', '♫', '♬'];
                ctx.fillText(notes[p.noteType || 0], p.x, p.y);
                break;
            case 'pixels':
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
                break;
            case 'neon':
                ctx.shadowBlur = 15 + Math.sin(p.glow) * 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'ink':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.expand, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'confetti':
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
                break;
            default:
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
        }
        ctx.restore();
    },

    drawStar(ctx, cx, cy, spikes, outer, inner) {
        let rot = Math.PI / 2 * 3;
        let x = cx, y = cy;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outer);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outer;
            y = cy + Math.sin(rot) * outer;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * inner;
            y = cy + Math.sin(rot) * inner;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outer);
        ctx.closePath();
        ctx.fill();
    },

    drawHeart(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y - size * 0.3, x - size, y - size * 0.3, x - size, y + size * 0.1);
        ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
        ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.1);
        ctx.bezierCurveTo(x + size, y - size * 0.3, x, y - size * 0.3, x, y + size * 0.3);
        ctx.fill();
    }
};

// ========== Toast & Modal 工具 ==========
const UI = {
    toast(message, type = 'info', duration = 2000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    modal(title, content, buttons = [{ text: '确定', action: null }]) {
        const container = document.getElementById('modal-container');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer"></div>
            </div>
        `;
        const footer = modal.querySelector('.modal-footer');
        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = `btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}`;
            b.textContent = btn.text;
            b.onclick = () => {
                if (btn.action) btn.action();
                modal.remove();
            };
            footer.appendChild(b);
        });
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        container.appendChild(modal);
        return modal;
    },

    closeAllModals() {
        document.getElementById('modal-container').innerHTML = '';
    }
};

// ========== 路由系统 ==========
const Router = {
    routes: {},
    current: '',

    init() {
        window.addEventListener('hashchange', () => this.handle());
        document.addEventListener('click', (e) => {
            const route = e.target.closest('[data-route]');
            if (route) {
                e.preventDefault();
                location.hash = route.dataset.route;
            }
        });
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    handle() {
        const hash = location.hash || '#/';
        const parts = hash.slice(1).split('/').filter(Boolean);
        const routePath = '/' + (parts[0] || '');

        SoundManager.playPageSwitch && SoundManager.playPageSwitch();

        // 先尝试精确匹配
        if (parts.length === 0) {
            // 首页路由 '/'
            if (this.routes['/']) {
                this.current = '/';
                this.routes['/']([]);
                this.updateNav();
                return;
            }
        } else if (this.routes[routePath] && parts.length === 1) {
            this.current = routePath;
            this.routes[routePath]([]);
            this.updateNav();
            return;
        }

        // 再尝试参数化路由匹配
        for (const pattern in this.routes) {
            if (pattern.indexOf(':') === -1) continue;
            const patternParts = pattern.slice(1).split('/');
            if (patternParts.length !== parts.length) continue;

            let matched = true;
            const params = [];
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    params.push(parts[i]);
                } else if (patternParts[i] !== parts[i]) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                this.current = pattern;
                this.routes[pattern](params);
                this.updateNav();
                return;
            }
        }

        // 404
        if (this.routes['/404']) {
            this.routes['/404']();
        }

        this.updateNav();
    },

    updateNav() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.route === location.hash ||
                (location.hash.startsWith(tab.dataset.route) && tab.dataset.route !== '#/'));
        });
    }
};

// ========== 页面渲染器 ==========
const Pages = {
    main: document.getElementById('app-main'),

    render(html) {
        this.main.innerHTML = `<div class="page">${html}</div>`;
    },

    // ===== 首页 =====
    home() {
        const overview = Stats.getOverview();
        const modes = Modes.getAll();

        const html = `
            <div class="page-home">
                <section class="hero-section">
                    <div class="hero-content">
                        <h1 class="hero-title">知一 <span class="hero-sub">· 刷题有道</span></h1>
                        <p class="hero-desc">运营岗位资质题库 · 2957道精选题 · 多种刷题模式</p>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-card">
                            <div class="stat-value">${overview.totalQuestions}</div>
                            <div class="stat-label">总题数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.round(overview.accuracy * 100)}%</div>
                            <div class="stat-label">正确率</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${overview.streak}</div>
                            <div class="stat-label">连续天数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Storage.getMistakes().length}</div>
                            <div class="stat-label">错题数</div>
                        </div>
                    </div>
                </section>

                <section class="modes-section">
                    <h2 class="section-title">
                        <span class="section-icon">📚</span>
                        刷题模式
                    </h2>
                    <div class="mode-grid">
                        ${modes.map(m => `
                            <div class="mode-card" data-mode="${m.id}">
                                <div class="mode-icon">${m.icon}</div>
                                <div class="mode-info">
                                    <h3>${m.name}</h3>
                                    <p>${m.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="tools-section">
                    <h2 class="section-title">
                        <span class="section-icon">🛠️</span>
                        学习工具
                    </h2>
                    <div class="tool-grid">
                        <div class="tool-card" data-route="#/mistakes">
                            <div class="tool-icon">📝</div>
                            <h3>错题集</h3>
                            <p>${Storage.getMistakes().length} 道待攻克</p>
                        </div>
                        <div class="tool-card" data-route="#/stats">
                            <div class="tool-icon">📊</div>
                            <h3>学习统计</h3>
                            <p>查看详细进度数据</p>
                        </div>
                        <div class="tool-card" data-route="#/flashcard">
                            <div class="tool-icon">🃏</div>
                            <h3>闪卡记忆</h3>
                            <p>高效记忆法</p>
                        </div>
                        <div class="tool-card" data-route="#/easter-eggs">
                            <div class="tool-icon">🎮</div>
                            <h3>彩蛋模式</h3>
                            <p>20种趣味玩法</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
        this.render(html);

        // 绑定模式卡片点击
        document.querySelectorAll('.mode-card').forEach(card => {
            card.onclick = () => {
                SoundManager.playClick();
                App.startMode(card.dataset.mode);
            };
        });

        App.updateFooter();
    },

    // ===== 模式配置页 =====
    modeConfig(modeId) {
        const mode = Modes.getMode(modeId);
        if (!mode) { location.hash = '#/'; return; }

        const configUI = Modes.getConfigUI(modeId);

        const html = `
            <div class="page-mode-config">
                <div class="config-header">
                    <button class="btn btn-secondary back-btn" data-route="#/">← 返回</button>
                    <h2>${mode.icon} ${mode.name}</h2>
                    <p class="mode-desc">${mode.description}</p>
                </div>
                <div class="config-body" id="mode-config-body">
                    ${configUI}
                </div>
                <div class="config-footer">
                    <button class="btn btn-primary btn-large" id="btn-start-mode">开始刷题</button>
                </div>
            </div>
        `;
        this.render(html);

        document.getElementById('btn-start-mode').onclick = () => {
            SoundManager.playClick();
            const config = Modes.collectConfig(modeId, document.getElementById('mode-config-body'));
            App.startQuiz(modeId, config);
        };
    },

    // ===== 刷题页 =====
    quiz(modeId, config) {
        const questions = Modes.generateQuestions(modeId, config);
        const options = Modes.getSessionOptions(modeId, config);
        QuizEngine.init(questions, options);

        const isQuick = modeId === 'quick';
        const isMemorize = modeId === 'memorize';

        const html = `
            <div class="page-quiz">
                <div class="quiz-header">
                    <button class="btn btn-secondary back-btn" id="btn-quit-quiz">← 退出</button>
                    <div class="quiz-info">
                        <span class="quiz-mode-tag">${Modes.getMode(modeId).name}</span>
                        <span class="quiz-progress" id="quiz-progress-text">1 / ${questions.length}</span>
                    </div>
                    ${isQuick ? '<div class="quiz-timer" id="quiz-timer">⏱️ --</div>' : ''}
                    <button class="btn btn-secondary" id="btn-answer-sheet">📋 答题卡</button>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" id="quiz-progress-bar" style="width: 0%"></div>
                </div>

                <div class="question-area" id="question-area">
                    <!-- 题目动态渲染 -->
                </div>

                <div class="quiz-actions">
                    <button class="btn btn-secondary" id="btn-prev">← 上一题</button>
                    <div class="action-center">
                        ${isMemorize ? `
                            <button class="btn btn-error" id="btn-unknown">没记住</button>
                            <button class="btn btn-success" id="btn-known">已记住</button>
                        ` : `
                            <button class="btn btn-primary" id="btn-submit">提交答案</button>
                        `}
                    </div>
                    <button class="btn btn-secondary" id="btn-next">下一题 →</button>
                </div>
            </div>
        `;
        this.render(html);

        App.renderQuestion();
        App.bindQuizEvents(modeId);
        App.updateFooter();
    },

    // ===== 错题集 =====
    mistakes() {
        const mistakes = Storage.getMistakes();
        const mistakeQuestions = mistakes.map(id => QUESTION_BANK.find(q => q.id === id)).filter(Boolean);

        const html = `
            <div class="page-mistakes">
                <div class="page-header">
                    <h2>📝 错题集</h2>
                    <p>共 ${mistakeQuestions.length} 道错题</p>
                </div>
                <div class="mistake-actions">
                    <button class="btn btn-primary" id="btn-mistake-practice">开始错题练习</button>
                    <button class="btn btn-secondary" id="btn-clear-mistakes">清空错题集</button>
                </div>
                <div class="mistake-list">
                    ${mistakeQuestions.length === 0 ?
                        '<div class="empty-state"><div class="empty-icon">🎉</div><p>太棒了！没有错题</p></div>' :
                        mistakeQuestions.slice(0, 50).map((q, i) => `
                            <div class="mistake-item" data-id="${q.id}">
                                <div class="mistake-index">${i + 1}</div>
                                <div class="mistake-content">
                                    <div class="mistake-question">${q.question}</div>
                                    <div class="mistake-meta">
                                        <span class="tag tag-${q.type}">${q.type}</span>
                                        <span class="tag tag-dept">${q.dept}</span>
                                    </div>
                                </div>
                                <button class="btn btn-small btn-error btn-remove-mistake" data-id="${q.id}">移除</button>
                            </div>
                        `).join('')
                    }
                </div>
                ${mistakeQuestions.length > 50 ? '<div class="more-hint">只显示前50道，点击"开始错题练习"练习全部</div>' : ''}
            </div>
        `;
        this.render(html);

        document.getElementById('btn-mistake-practice').onclick = () => {
            if (mistakeQuestions.length === 0) {
                UI.toast('没有错题啦~', 'success');
                return;
            }
            App.startQuiz('mistakes', { questions: mistakeQuestions });
        };

        document.getElementById('btn-clear-mistakes').onclick = () => {
            UI.modal('确认清空', '确定要清空所有错题吗？', [
                { text: '取消' },
                { text: '确定清空', primary: true, action: () => {
                    mistakes.forEach(id => Storage.removeMistake(id));
                    UI.toast('已清空错题集', 'success');
                    Pages.mistakes();
                }}
            ]);
        };

        document.querySelectorAll('.btn-remove-mistake').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                Storage.removeMistake(id);
                UI.toast('已移除', 'success');
                Pages.mistakes();
            };
        });
    },

    // ===== 统计页 =====
    stats() {
        const overview = Stats.getOverview();
        const byDept = Stats.getByDept();
        const byType = Stats.getByType();

        const html = `
            <div class="page-stats">
                <div class="page-header">
                    <h2>📊 学习统计</h2>
                </div>

                <div class="stats-overview">
                    <div class="stat-card large">
                        <canvas id="chart-overall" width="160" height="160"></canvas>
                        <div class="stat-info">
                            <div class="stat-value">${Math.round(overview.progress * 100)}%</div>
                            <div class="stat-label">总体进度</div>
                        </div>
                    </div>
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-value">${overview.totalAnswered}</div>
                            <div class="stat-label">已做题数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${overview.totalCorrect}</div>
                            <div class="stat-label">答对题数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.round(overview.accuracy * 100)}%</div>
                            <div class="stat-label">正确率</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${overview.studyDaysCount}</div>
                            <div class="stat-label">学习天数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${overview.streak}</div>
                            <div class="stat-label">连续打卡</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${overview.todayCount}</div>
                            <div class="stat-label">今日答题</div>
                        </div>
                    </div>
                </div>

                <section class="stats-section">
                    <h3>📈 各部门进度</h3>
                    <div class="dept-progress-list">
                        ${byDept.map(d => `
                            <div class="dept-progress-item">
                                <div class="dept-name">${d.name}</div>
                                <div class="dept-bar">
                                    <div class="dept-bar-fill" style="width: ${d.progress * 100}%"></div>
                                </div>
                                <div class="dept-count">${d.done} / ${d.total}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="stats-section">
                    <h3>📝 各题型正确率</h3>
                    <div class="type-stats">
                        ${byType.map(t => `
                            <div class="type-stat-item">
                                <div class="type-name">${t.name}</div>
                                <div class="type-bar">
                                    <div class="type-bar-fill" style="width: ${t.accuracy * 100}%"></div>
                                </div>
                                <div class="type-accuracy">${Math.round(t.accuracy * 100)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="stats-section">
                    <h3>🔥 学习热力图</h3>
                    <canvas id="chart-heatmap" width="700" height="150"></canvas>
                </section>

                <section class="stats-section">
                    <h3>🧠 掌握度分布</h3>
                    <canvas id="chart-mastery" width="700" height="200"></canvas>
                </section>
            </div>
        `;
        this.render(html);

        // 渲染图表
        Stats.renderProgressBar('chart-overall', overview.progress * 100, {
            lineWidth: 12,
            color: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
        });

        const heatmapData = {};
        const records = Storage.get('dailyRecords', {});
        Object.keys(records).forEach(date => {
            heatmapData[date] = records[date].total || 0;
        });
        Stats.renderHeatmap('chart-heatmap', heatmapData);

        const mastery = Stats.getMasteryDistribution();
        Stats.renderBarChart('chart-mastery', {
            labels: ['未掌握', '熟悉', '掌握', '精通'],
            values: [mastery.none, mastery.familiar, mastery.mastered, mastery.expert],
            colors: ['#f56565', '#ed8936', '#48bb78', '#667eea']
        });
    },

    // ===== 设置页 =====
    settings() {
        const settings = Storage.get('settings', {});
        const currentTheme = ThemeManager.getCurrent();
        const categories = ThemeManager.getCategories();

        const fonts = [
            { id: 'system', name: '系统默认', family: 'system-ui, sans-serif' },
            { id: 'songti', name: '宋体', family: '"Songti SC", "SimSun", serif' },
            { id: 'heiti', name: '黑体', family: '"PingFang SC", "Microsoft YaHei", sans-serif' },
            { id: 'kaiti', name: '楷体', family: '"Kaiti SC", "KaiTi", serif' },
            { id: 'mono', name: '等宽字体', family: '"SF Mono", "Fira Code", monospace' },
            { id: 'round', name: '圆体', family: '"Yuanti SC", "YouYuan", sans-serif' }
        ];

        const bgCustom = settings.bgCustom || { color: '', image: '', brightness: 100, hue: 0 };

        const html = `
            <div class="page-settings">
                <div class="page-header">
                    <h2>⚙️ 设置</h2>
                </div>

                <section class="settings-section">
                    <h3>🎨 主题皮肤</h3>
                    <div class="theme-categories">
                        ${categories.map(cat => `
                            <div class="theme-category">
                                <h4>${cat.name}</h4>
                                <div class="theme-grid">
                                    ${ThemeManager.getByCategory(cat.id).map(t => `
                                        <div class="theme-item ${t.id === currentTheme.id ? 'active' : ''}" data-theme="${t.id}"
                                            style="background: linear-gradient(135deg, ${t.colors.bgSecondary}, ${t.colors.bgPrimary}); color: ${t.colors.textPrimary}; border-color: ${t.colors.borderColor}">
                                            <div class="theme-dots">
                                                <span style="background: ${t.colors.accentPrimary}"></span>
                                                <span style="background: ${t.colors.accentSuccess}"></span>
                                                <span style="background: ${t.colors.accentError}"></span>
                                            </div>
                                            <div class="theme-name">${t.name}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="settings-section">
                    <h3>🔤 字体设置</h3>
                    <div class="font-grid">
                        ${fonts.map(f => `
                            <div class="font-item ${settings.font === f.id ? 'active' : ''}" data-font="${f.id}" style="font-family: ${f.family}">
                                <div class="font-preview">知一刷题 Aa 123</div>
                                <div class="font-name">${f.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="settings-section">
                    <h3>🖼️ 背景自定义</h3>
                    <div class="bg-settings">
                        <div class="setting-row">
                            <label>背景颜色</label>
                            <input type="color" id="bg-color-picker" value="${bgCustom.color || '#ffffff'}">
                        </div>
                        <div class="setting-row">
                            <label>背景图片 URL</label>
                            <input type="text" id="bg-image-input" value="${bgCustom.image || ''}" placeholder="输入图片链接...">
                        </div>
                        <div class="setting-row">
                            <label>亮度 <span id="brightness-val">${bgCustom.brightness}%</span></label>
                            <input type="range" id="bg-brightness" min="10" max="200" value="${bgCustom.brightness}">
                        </div>
                        <div class="setting-row">
                            <label>色调 <span id="hue-val">${bgCustom.hue}°</span></label>
                            <input type="range" id="bg-hue" min="0" max="360" value="${bgCustom.hue}">
                        </div>
                        <button class="btn btn-secondary" id="btn-reset-bg">重置背景</button>
                    </div>
                </section>

                <section class="settings-section">
                    <h3>🔊 音效设置</h3>
                    <div class="sound-settings">
                        <div class="setting-row">
                            <label>音效开关</label>
                            <label class="toggle">
                                <input type="checkbox" id="sound-toggle" ${settings.soundEnabled !== false ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <label>答对音效</label>
                            <select id="correct-sound">
                                <option value="0" ${settings.correctSound === 0 ? 'selected' : ''}>清脆叮</option>
                                <option value="1" ${settings.correctSound === 1 ? 'selected' : ''}>欢快旋律</option>
                                <option value="2" ${settings.correctSound === 2 ? 'selected' : ''}>胜利号角</option>
                            </select>
                            <button class="btn btn-small btn-secondary" id="btn-test-correct">试听</button>
                        </div>
                        <div class="setting-row">
                            <label>答错音效</label>
                            <select id="wrong-sound">
                                <option value="0" ${settings.wrongSound === 0 ? 'selected' : ''}>低沉嗡</option>
                                <option value="1" ${settings.wrongSound === 1 ? 'selected' : ''}>错误哔</option>
                                <option value="2" ${settings.wrongSound === 2 ? 'selected' : ''}>滑降音</option>
                            </select>
                            <button class="btn btn-small btn-secondary" id="btn-test-wrong">试听</button>
                        </div>
                        <div class="setting-row">
                            <label>音量 <span id="volume-val">${Math.round((settings.volume || 0.5) * 100)}%</span></label>
                            <input type="range" id="sound-volume" min="0" max="100" value="${(settings.volume || 0.5) * 100}">
                        </div>
                    </div>
                </section>

                <section class="settings-section">
                    <h3>✨ 粒子特效</h3>
                    <div class="setting-row">
                        <label>粒子开关</label>
                        <label class="toggle">
                            <input type="checkbox" id="particle-toggle" ${settings.particlesEnabled !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <label>粒子密度 <span id="particle-val">${settings.particleCount || 50}</span></label>
                        <input type="range" id="particle-count" min="10" max="150" value="${settings.particleCount || 50}">
                    </div>
                </section>

                <section class="settings-section">
                    <h3>💾 数据管理</h3>
                    <div class="data-actions">
                        <button class="btn btn-secondary" id="btn-export-data">导出数据</button>
                        <button class="btn btn-secondary" id="btn-import-data">导入数据</button>
                        <button class="btn btn-error" id="btn-clear-data">清空所有数据</button>
                    </div>
                </section>

                <section class="settings-section about-section">
                    <h3>ℹ️ 关于</h3>
                    <p>知一 · 极简刷题平台 v1.0</p>
                    <p class="muted">纯前端实现 · 数据本地存储 · 全平台兼容</p>
                </section>
            </div>
        `;
        this.render(html);

        // 主题切换
        document.querySelectorAll('.theme-item').forEach(item => {
            item.onclick = () => {
                SoundManager.init();
                SoundManager.playClick();
                const themeId = item.dataset.theme;
                ThemeManager.apply(themeId);
                App.applyCustomBackground();
                App.restartParticles();
                document.querySelectorAll('.theme-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                UI.toast(`已切换到${ThemeManager.getCurrent().name}`, 'success');
            };
        });

        // 字体切换
        document.querySelectorAll('.font-item').forEach(item => {
            item.onclick = () => {
                SoundManager.playClick();
                const fontId = item.dataset.font;
                App.setFont(fontId);
                document.querySelectorAll('.font-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            };
        });

        // 背景设置
        document.getElementById('bg-color-picker').oninput = (e) => App.setBgColor(e.target.value);
        document.getElementById('bg-image-input').onchange = (e) => App.setBgImage(e.target.value);
        document.getElementById('bg-brightness').oninput = (e) => {
            document.getElementById('brightness-val').textContent = e.target.value + '%';
            App.setBgBrightness(e.target.value);
        };
        document.getElementById('bg-hue').oninput = (e) => {
            document.getElementById('hue-val').textContent = e.target.value + '°';
            App.setBgHue(e.target.value);
        };
        document.getElementById('btn-reset-bg').onclick = () => App.resetBg();

        // 音效设置
        document.getElementById('sound-toggle').onchange = (e) => {
            SoundManager.setEnabled(e.target.checked);
            if (e.target.checked) SoundManager.init();
        };
        document.getElementById('correct-sound').onchange = (e) => {
            const s = Storage.get('settings', {});
            s.correctSound = parseInt(e.target.value);
            Storage.set('settings', s);
        };
        document.getElementById('wrong-sound').onchange = (e) => {
            const s = Storage.get('settings', {});
            s.wrongSound = parseInt(e.target.value);
            Storage.set('settings', s);
        };
        document.getElementById('btn-test-correct').onclick = () => {
            SoundManager.init();
            const s = Storage.get('settings', {});
            SoundManager.playCorrect(s.correctSound || 0);
        };
        document.getElementById('btn-test-wrong').onclick = () => {
            SoundManager.init();
            const s = Storage.get('settings', {});
            SoundManager.playWrong(s.wrongSound || 0);
        };
        document.getElementById('sound-volume').oninput = (e) => {
            document.getElementById('volume-val').textContent = e.target.value + '%';
            SoundManager.setVolume(e.target.value / 100);
        };

        // 粒子设置
        document.getElementById('particle-toggle').onchange = (e) => {
            const s = Storage.get('settings', {});
            s.particlesEnabled = e.target.checked;
            Storage.set('settings', s);
            App.restartParticles();
        };
        document.getElementById('particle-count').oninput = (e) => {
            document.getElementById('particle-val').textContent = e.target.value;
            const s = Storage.get('settings', {});
            s.particleCount = parseInt(e.target.value);
            Storage.set('settings', s);
            App.restartParticles();
        };

        // 数据管理
        document.getElementById('btn-export-data').onclick = () => {
            const data = Storage.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `知一数据_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UI.toast('数据已导出', 'success');
        };
        document.getElementById('btn-import-data').onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        UI.modal('导入数据', '确定要导入数据吗？这将覆盖现有数据。', [
                            { text: '取消' },
                            { text: '确定导入', primary: true, action: () => {
                                Storage.importData(data, false);
                                UI.toast('导入成功', 'success');
                                location.reload();
                            }}
                        ]);
                    } catch (err) {
                        UI.toast('文件格式错误', 'error');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        document.getElementById('btn-clear-data').onclick = () => {
            UI.modal('清空数据', '确定要清空所有学习数据吗？此操作不可恢复！', [
                { text: '取消' },
                { text: '确定清空', primary: true, action: () => {
                    localStorage.clear();
                    UI.toast('已清空所有数据', 'success');
                    setTimeout(() => location.reload(), 1000);
                }}
            ]);
        };
    },

    // ===== 闪卡页 =====
    flashcard() {
        const html = `
            <div class="page-flashcard">
                <div class="page-header">
                    <h2>🃏 闪卡记忆</h2>
                </div>
                <div class="flashcard-modes">
                    <div class="fc-mode-card" data-mode="flashcard">
                        <div class="fc-icon">📇</div>
                        <h3>闪卡背诵</h3>
                        <p>传统闪卡模式，翻转记忆</p>
                        <button class="btn btn-primary" data-action="start-flashcard">开始</button>
                    </div>
                    <div class="fc-mode-card" data-mode="matching">
                        <div class="fc-icon">🔗</div>
                        <h3>连连看</h3>
                        <p>题目答案配对消除</p>
                        <button class="btn btn-primary" data-action="start-matching">开始</button>
                    </div>
                    <div class="fc-mode-card" data-mode="memory">
                        <div class="fc-icon">🧠</div>
                        <h3>记忆翻牌</h3>
                        <p>记住位置，翻牌配对</p>
                        <button class="btn btn-primary" data-action="start-memory">开始</button>
                    </div>
                    <div class="fc-mode-card" data-mode="typing">
                        <div class="fc-icon">⌨️</div>
                        <h3>打字挑战</h3>
                        <p>快速输入答案首字母</p>
                        <button class="btn btn-primary" data-action="start-typing">开始</button>
                    </div>
                    <div class="fc-mode-card" data-mode="speed">
                        <div class="fc-icon">⚡</div>
                        <h3>限时速答</h3>
                        <p>60秒内尽可能多答对</p>
                        <button class="btn btn-primary" data-action="start-speed">开始</button>
                    </div>
                </div>
                <div class="flashcard-game-area" id="flashcard-game-area"></div>
            </div>
        `;
        this.render(html);

        const depts = [...new Set(QUESTION_BANK.map(q => q.dept))];
        const deptOptions = depts.map(d => `<option value="${d}">${d}</option>`).join('');

        const showDeptSelect = (callback) => {
            UI.modal('选择范围', `
                <div class="modal-form">
                    <div class="form-item">
                        <label>选择部门</label>
                        <select id="select-dept">
                            <option value="all">全部部门</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-item">
                        <label>题目数量</label>
                        <select id="select-count">
                            <option value="20">20道</option>
                            <option value="50">50道</option>
                            <option value="100">100道</option>
                            <option value="all">全部</option>
                        </select>
                    </div>
                </div>
            `, [
                { text: '取消' },
                { text: '确定', primary: true, action: () => {
                    const dept = document.getElementById('select-dept').value;
                    const count = document.getElementById('select-count').value;
                    let questions = dept === 'all' ? [...QUESTION_BANK] : QUESTION_BANK.filter(q => q.dept === dept);
                    if (count !== 'all') {
                        questions = questions.sort(() => Math.random() - 0.5).slice(0, parseInt(count));
                    }
                    callback(questions);
                }}
            ]);
        };

        document.querySelector('[data-action="start-flashcard"]').onclick = () => {
            showDeptSelect((questions) => {
                const area = document.getElementById('flashcard-game-area');
                area.innerHTML = '<div id="fc-container"></div>';
                Flashcard.init(questions, document.getElementById('fc-container'), (progress) => {
                    // 更新进度
                });
            });
        };

        document.querySelector('[data-action="start-matching"]').onclick = () => {
            showDeptSelect((questions) => {
                const area = document.getElementById('flashcard-game-area');
                area.innerHTML = '<div id="fc-container"></div>';
                GameModes.matching(questions.slice(0, 12), document.getElementById('fc-container'), (result) => {
                    UI.toast(`完成！正确${result.correct}个`, 'success');
                });
            });
        };

        document.querySelector('[data-action="start-memory"]').onclick = () => {
            showDeptSelect((questions) => {
                const area = document.getElementById('flashcard-game-area');
                area.innerHTML = '<div id="fc-container"></div>';
                GameModes.memory(questions, 12, document.getElementById('fc-container'), (result) => {
                    UI.toast(`完成！用时${result.time}秒`, 'success');
                });
            });
        };

        document.querySelector('[data-action="start-typing"]').onclick = () => {
            showDeptSelect((questions) => {
                const area = document.getElementById('flashcard-game-area');
                area.innerHTML = '<div id="fc-container"></div>';
                GameModes.typing(questions.slice(0, 30), document.getElementById('fc-container'), (result) => {
                    UI.toast(`完成！正确${result.correct}/${result.total}`, 'success');
                });
            });
        };

        document.querySelector('[data-action="start-speed"]').onclick = () => {
            showDeptSelect((questions) => {
                const area = document.getElementById('flashcard-game-area');
                area.innerHTML = '<div id="fc-container"></div>';
                GameModes.speedRound(questions, 60, document.getElementById('fc-container'), (result) => {
                    UI.toast(`时间到！答对${result.correct}道`, 'success');
                });
            });
        };
    },

    // ===== 彩蛋模式页 =====
    easterEggs() {
        const eggs = EasterEggs.getAll();

        const html = `
            <div class="page-easter-eggs">
                <div class="page-header">
                    <h2>🎮 彩蛋模式</h2>
                    <p>20种天马行空的刷题方式，等你来探索！</p>
                </div>
                <div class="easter-eggs-grid">
                    ${eggs.map(egg => `
                        <div class="easter-egg-card" data-egg="${egg.id}">
                            <div class="egg-icon">${egg.icon}</div>
                            <h3>${egg.name}</h3>
                            <p>${egg.desc}</p>
                            <button class="btn btn-primary btn-small">开始玩</button>
                        </div>
                    `).join('')}
                </div>
                <div class="easter-egg-game-area" id="easter-egg-game-area" style="display:none;">
                    <button class="btn btn-secondary back-btn" id="btn-back-eggs">← 返回列表</button>
                    <div id="egg-game-container"></div>
                </div>
            </div>
        `;
        this.render(html);

        document.querySelectorAll('.easter-egg-card').forEach(card => {
            card.onclick = () => {
                const eggId = card.dataset.egg;
                const depts = [...new Set(QUESTION_BANK.map(q => q.dept))];
                const deptOptions = depts.map(d => `<option value="${d}">${d}</option>`).join('');

                UI.modal('选择题目范围', `
                    <div class="modal-form">
                        <div class="form-item">
                            <label>选择部门</label>
                            <select id="egg-select-dept">
                                <option value="all">全部部门</option>
                                ${deptOptions}
                            </select>
                        </div>
                        <div class="form-item">
                            <label>题目数量</label>
                            <select id="egg-select-count">
                                <option value="10">10道</option>
                                <option value="20">20道</option>
                                <option value="30">30道</option>
                                <option value="50">50道</option>
                            </select>
                        </div>
                    </div>
                `, [
                    { text: '取消' },
                    { text: '开始', primary: true, action: () => {
                        const dept = document.getElementById('egg-select-dept').value;
                        const count = parseInt(document.getElementById('egg-select-count').value);
                        let questions = dept === 'all' ? [...QUESTION_BANK] : QUESTION_BANK.filter(q => q.dept === dept);
                        questions = questions.sort(() => Math.random() - 0.5).slice(0, count);

                        document.querySelector('.easter-eggs-grid').style.display = 'none';
                        document.querySelector('.page-header').style.display = 'none';
                        document.getElementById('easter-egg-game-area').style.display = 'block';

                        EasterEggs.start(eggId, questions, document.getElementById('egg-game-container'), (result) => {
                            UI.toast(`游戏结束！得分：${result.score || 0}`, 'success');
                        });
                    }}
                ]);
            };
        });

        document.getElementById('btn-back-eggs').onclick = () => {
            document.querySelector('.easter-eggs-grid').style.display = 'grid';
            document.querySelector('.page-header').style.display = 'block';
            document.getElementById('easter-egg-game-area').style.display = 'none';
            document.getElementById('egg-game-container').innerHTML = '';
        };
    }
};

// ========== 主应用 ==========
const App = {
    selectedOptions: new Set(),
    answered: false,

    init() {
        // 初始化存储
        Storage.init();

        // 初始化主题
        const savedTheme = Storage.get('settings', {}).theme || 'minimal-white';
        ThemeManager.apply(savedTheme);

        // 初始化粒子系统
        ParticleSystem.init();
        this.restartParticles();

        // 初始化音效
        const settings = Storage.get('settings', {});
        SoundManager.setEnabled(settings.soundEnabled !== false);
        SoundManager.setVolume(settings.volume || 0.5);

        // 应用字体
        this.setFont(settings.font || 'system');

        // 应用自定义背景
        this.applyCustomBackground();

        // 初始化路由
        Router.init();
        Router.register('/', () => Pages.home());
        Router.register('/mode/:id', (params) => Pages.modeConfig(params[0]));
        Router.register('/quiz/:mode', (params) => {
            // 从sessionStorage读取配置
            const config = JSON.parse(sessionStorage.getItem('quizConfig') || '{}');
            Pages.quiz(params[0], config);
        });
        Router.register('/mistakes', () => Pages.mistakes());
        Router.register('/stats', () => Pages.stats());
        Router.register('/settings', () => Pages.settings());
        Router.register('/flashcard', () => Pages.flashcard());
        Router.register('/easter-eggs', () => Pages.easterEggs());

        // 渲染导航
        this.renderNav();

        // 绑定头部按钮
        this.bindHeaderEvents();

        // 启动路由
        Router.handle();

        // 更新页脚
        this.updateFooter();
    },

    renderNav() {
        const navTabs = document.getElementById('nav-tabs');
        const tabs = [
            { route: '#/', icon: '🏠', label: '首页' },
            { route: '#/mistakes', icon: '📝', label: '错题' },
            { route: '#/stats', icon: '📊', label: '统计' },
            { route: '#/flashcard', icon: '🃏', label: '闪卡' },
            { route: '#/easter-eggs', icon: '🎮', label: '彩蛋' }
        ];
        navTabs.innerHTML = tabs.map(t => `
            <div class="nav-tab" data-route="${t.route}">
                <span class="nav-icon">${t.icon}</span>
                <span class="nav-label">${t.label}</span>
            </div>
        `).join('');
    },

    bindHeaderEvents() {
        document.getElementById('btn-theme').onclick = () => {
            SoundManager.init();
            SoundManager.playClick();
            // 快速切换主题
            const themes = ThemeManager.getAll();
            const current = ThemeManager.getCurrent();
            const idx = themes.findIndex(t => t.id === current.id);
            const next = themes[(idx + 1) % themes.length];
            ThemeManager.apply(next.id);
            this.applyCustomBackground();
            this.restartParticles();
            UI.toast(next.name, 'info');
        };

        document.getElementById('btn-sound').onclick = () => {
            SoundManager.init();
            const settings = Storage.get('settings', {});
            settings.soundEnabled = settings.soundEnabled === false ? true : false;
            Storage.set('settings', settings);
            SoundManager.setEnabled(settings.soundEnabled);
            UI.toast(settings.soundEnabled ? '音效已开启' : '音效已关闭', 'info');
        };
    },

    startMode(modeId) {
        location.hash = `#/mode/${modeId}`;
    },

    startQuiz(modeId, config) {
        sessionStorage.setItem('quizConfig', JSON.stringify(config));
        location.hash = `#/quiz/${modeId}`;
    },

    renderQuestion() {
        const q = QuizEngine.getCurrentQuestion();
        if (!q) return;

        const progress = QuizEngine.getProgress();
        const area = document.getElementById('question-area');

        const optionsHtml = Object.entries(q.options).map(([key, val]) => `
            <button class="option-btn ${this.selectedOptions.has(key) ? 'selected' : ''}" data-option="${key}">
                <span class="option-letter">${key}</span>
                <span class="option-text">${val}</span>
            </button>
        `).join('');

        area.innerHTML = `
            <div class="question-card">
                <div class="question-meta">
                    <span class="tag tag-${q.type}">${q.type}</span>
                    <span class="tag tag-dept">${q.dept}</span>
                    <span class="question-id">第 ${q.id} 题</span>
                </div>
                <div class="question-text">${q.question}</div>
                ${q.type === '多选' ? '<div class="question-hint">多选题，请选择所有正确答案</div>' : ''}
                <div class="options-list">
                    ${optionsHtml}
                </div>
                <div class="answer-result" id="answer-result" style="display:none;">
                    <div class="result-icon" id="result-icon"></div>
                    <div class="result-text" id="result-text"></div>
                    <div class="correct-answer" id="correct-answer"></div>
                </div>
            </div>
        `;

        // 更新进度
        document.getElementById('quiz-progress-text').textContent =
            `${progress.current + 1} / ${progress.total}`;
        document.getElementById('quiz-progress-bar').style.width =
            `${((progress.current + 1) / progress.total) * 100}%`;

        // 绑定选项点击
        this.selectedOptions.clear();
        this.answered = false;
        area.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => this.handleOptionClick(btn, q);
        });

        // 更新按钮状态
        document.getElementById('btn-prev').disabled = QuizEngine.isFirst();
        document.getElementById('btn-next').disabled = QuizEngine.isLast();
    },

    handleOptionClick(btn, question) {
        if (this.answered) return;

        const opt = btn.dataset.option;
        SoundManager.playClick();

        if (question.type === '多选') {
            if (this.selectedOptions.has(opt)) {
                this.selectedOptions.delete(opt);
                btn.classList.remove('selected');
            } else {
                this.selectedOptions.add(opt);
                btn.classList.add('selected');
            }
        } else {
            this.selectedOptions.clear();
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            this.selectedOptions.add(opt);
            btn.classList.add('selected');

            // 单选/判断自动提交
            this.submitAnswer();
        }
    },

    submitAnswer() {
        if (this.answered || this.selectedOptions.size === 0) return;

        const result = QuizEngine.submitAnswer([...this.selectedOptions]);
        this.answered = true;

        const settings = Storage.get('settings', {});
        if (result.isCorrect) {
            SoundManager.playCorrect(settings.correctSound || 0);
        } else {
            SoundManager.playWrong(settings.wrongSound || 0);
        }

        // 更新选项样式
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => {
            const opt = btn.dataset.option;
            if (result.correctAnswer.includes(opt)) {
                btn.classList.add('correct');
            } else if (this.selectedOptions.has(opt)) {
                btn.classList.add('wrong');
            }
        });

        // 显示结果
        const resultEl = document.getElementById('answer-result');
        resultEl.style.display = 'block';
        resultEl.className = `answer-result ${result.isCorrect ? 'result-correct' : 'result-wrong'}`;
        document.getElementById('result-icon').textContent = result.isCorrect ? '✓' : '✗';
        document.getElementById('result-text').textContent = result.isCorrect ? '回答正确！' : '回答错误';
        document.getElementById('correct-answer').textContent =
            `正确答案：${result.correctAnswer.join('、')}`;

        // 更新错题集
        const q = QuizEngine.getCurrentQuestion();
        if (!result.isCorrect) {
            Storage.addMistake(q.id);
        }

        // 更新统计
        Storage.updateQuestionStats(q.id, result.isCorrect);
        Storage.recordDailyActivity(result.isCorrect ? 1 : 0);

        this.updateFooter();

        // 快答模式重置定时器
        if (QuizEngine.session.options.timeLimit) {
            QuizEngine.resetTimer();
        }
    },

    bindQuizEvents(modeId) {
        const options = QuizEngine.session.options;

        document.getElementById('btn-quit-quiz').onclick = () => {
            SoundManager.playClick();
            UI.modal('退出刷题', '确定要退出吗？当前进度不会保存。', [
                { text: '继续答题' },
                { text: '退出', primary: true, action: () => { location.hash = '#/'; }}
            ]);
        };

        document.getElementById('btn-prev').onclick = () => {
            SoundManager.playClick();
            QuizEngine.prev();
            this.renderQuestion();
        };

        document.getElementById('btn-next').onclick = () => {
            SoundManager.playClick();
            if (!this.answered && this.selectedOptions.size > 0 && modeId !== 'memorize') {
                this.submitAnswer();
                setTimeout(() => {
                    if (QuizEngine.isLast()) {
                        this.showQuizResult();
                    } else {
                        QuizEngine.next();
                        this.renderQuestion();
                    }
                }, 800);
            } else {
                if (QuizEngine.isLast()) {
                    this.showQuizResult();
                } else {
                    QuizEngine.next();
                    this.renderQuestion();
                }
            }
        };

        const submitBtn = document.getElementById('btn-submit');
        if (submitBtn) {
            submitBtn.onclick = () => {
                if (this.selectedOptions.size === 0) {
                    UI.toast('请先选择答案', 'warning');
                    return;
                }
                this.submitAnswer();
            };
        }

        // 背题模式
        if (modeId === 'memorize') {
            // 初始显示答案
            this.showMemorizeAnswer();

            document.getElementById('btn-known').onclick = () => {
                SoundManager.playCorrect(0);
                const q = QuizEngine.getCurrentQuestion();
                Storage.updateQuestionStats(q.id, true);
                if (QuizEngine.isLast()) {
                    this.showQuizResult();
                } else {
                    QuizEngine.next();
                    this.renderQuestion();
                    this.showMemorizeAnswer();
                }
            };

            document.getElementById('btn-unknown').onclick = () => {
                SoundManager.playWrong(0);
                const q = QuizEngine.getCurrentQuestion();
                Storage.addMistake(q.id);
                Storage.updateQuestionStats(q.id, false);
                if (QuizEngine.isLast()) {
                    this.showQuizResult();
                } else {
                    QuizEngine.next();
                    this.renderQuestion();
                    this.showMemorizeAnswer();
                }
            };
        }

        // 答题卡
        document.getElementById('btn-answer-sheet').onclick = () => {
            this.showAnswerSheet();
        };

        // 快答模式定时器
        if (options.timeLimit) {
            QuizEngine.session.options.onTimerTick = (remaining) => {
                const timerEl = document.getElementById('quiz-timer');
                if (timerEl) {
                    timerEl.textContent = `⏱️ ${remaining}s`;
                    timerEl.style.color = remaining <= 3 ? 'var(--accent-error)' : '';
                }
            };
            QuizEngine.session.options.onTimeUp = () => {
                if (!this.answered) {
                    this.submitAnswer();
                    setTimeout(() => {
                        if (!QuizEngine.isLast()) {
                            QuizEngine.next();
                            this.renderQuestion();
                        } else {
                            this.showQuizResult();
                        }
                    }, 1000);
                }
            };
            QuizEngine.startTimer();
        }
    },

    showMemorizeAnswer() {
        const q = QuizEngine.getCurrentQuestion();
        if (!q) return;
        const resultEl = document.getElementById('answer-result');
        if (!resultEl) return;
        resultEl.style.display = 'block';
        resultEl.className = 'answer-result result-memorize';
        document.getElementById('result-icon').textContent = '💡';
        document.getElementById('result-text').textContent = '参考答案';
        document.getElementById('correct-answer').textContent =
            `答案：${q.answer}`;
    },

    showAnswerSheet() {
        const sheet = QuizEngine.getAnswerSheet();
        const html = `
            <div class="answer-sheet-modal">
                <div class="answer-card-grid">
                    ${sheet.map((item, i) => `
                        <div class="answer-cell ${item.status}" data-index="${i}">
                            ${i + 1}
                        </div>
                    `).join('')}
                </div>
                <div class="sheet-legend">
                    <span><span class="legend-dot current"></span>当前</span>
                    <span><span class="legend-dot correct"></span>正确</span>
                    <span><span class="legend-dot wrong"></span>错误</span>
                    <span><span class="legend-dot unanswered"></span>未答</span>
                </div>
            </div>
        `;
        const modal = UI.modal('答题卡', html, [{ text: '关闭' }]);
        modal.querySelectorAll('.answer-cell').forEach(cell => {
            cell.onclick = () => {
                const idx = parseInt(cell.dataset.index);
                QuizEngine.jumpTo(idx);
                this.renderQuestion();
                UI.closeAllModals();
            };
        });
    },

    showQuizResult() {
        const results = QuizEngine.getResults();
        const html = `
            <div class="quiz-result">
                <div class="result-score">
                    <div class="score-circle">
                        <span class="score-value">${Math.round(results.accuracy * 100)}</span>
                        <span class="score-label">分</span>
                    </div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="stat-num">${results.total}</span>
                        <span class="stat-label">总题数</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-num correct">${results.correct}</span>
                        <span class="stat-label">答对</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-num wrong">${results.wrong}</span>
                        <span class="stat-label">答错</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-num">${results.unanswered}</span>
                        <span class="stat-label">未答</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-secondary" id="btn-result-review">查看错题</button>
                    <button class="btn btn-primary" id="btn-result-retry">再来一次</button>
                    <button class="btn btn-secondary" id="btn-result-home">返回首页</button>
                </div>
            </div>
        `;
        UI.modal('答题完成', html, []);

        document.getElementById('btn-result-review').onclick = () => {
            UI.closeAllModals();
            location.hash = '#/mistakes';
        };
        document.getElementById('btn-result-retry').onclick = () => {
            UI.closeAllModals();
            location.reload();
        };
        document.getElementById('btn-result-home').onclick = () => {
            UI.closeAllModals();
            location.hash = '#/';
        };

        if (QuizEngine.session.options.timeLimit) {
            QuizEngine.stopTimer();
        }
    },

    updateFooter() {
        const overview = Stats.getOverview();
        const mistakes = Storage.getMistakes().length;
        document.getElementById('footer-progress').textContent =
            Math.round(overview.progress * 100) + '%';
        document.getElementById('footer-done').textContent = overview.totalAnswered;
        document.getElementById('footer-mistakes').textContent = mistakes;
        document.getElementById('footer-total').textContent = overview.totalQuestions;
    },

    setFont(fontId) {
        const fonts = {
            'system': 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
            'songti': '"Songti SC", "SimSun", "STSong", serif',
            'heiti': '"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
            'kaiti': '"Kaiti SC", "KaiTi", "STKaiti", serif',
            'mono': '"SF Mono", "Fira Code", "Consolas", monospace',
            'round': '"Yuanti SC", "YouYuan", "STYuan", sans-serif'
        };
        document.documentElement.style.setProperty('--font-family', fonts[fontId] || fonts.system);
        const s = Storage.get('settings', {});
        s.font = fontId;
        Storage.set('settings', s);
    },

    setBgColor(color) {
        const s = Storage.get('settings', {});
        s.bgCustom = s.bgCustom || {};
        s.bgCustom.color = color;
        Storage.set('settings', s);
        this.applyCustomBackground();
    },

    setBgImage(url) {
        const s = Storage.get('settings', {});
        s.bgCustom = s.bgCustom || {};
        s.bgCustom.image = url;
        Storage.set('settings', s);
        this.applyCustomBackground();
    },

    setBgBrightness(val) {
        const s = Storage.get('settings', {});
        s.bgCustom = s.bgCustom || {};
        s.bgCustom.brightness = parseInt(val);
        Storage.set('settings', s);
        this.applyCustomBackground();
    },

    setBgHue(val) {
        const s = Storage.get('settings', {});
        s.bgCustom = s.bgCustom || {};
        s.bgCustom.hue = parseInt(val);
        Storage.set('settings', s);
        this.applyCustomBackground();
    },

    resetBg() {
        const s = Storage.get('settings', {});
        s.bgCustom = { color: '', image: '', brightness: 100, hue: 0 };
        Storage.set('settings', s);
        this.applyCustomBackground();
        UI.toast('背景已重置', 'success');
    },

    applyCustomBackground() {
        const s = Storage.get('settings', {});
        const bg = s.bgCustom || {};
        const body = document.body;

        // 重置自定义样式
        body.style.backgroundImage = '';
        body.style.backgroundColor = '';
        body.style.filter = '';
        body.classList.remove('custom-bg');

        if (bg.color || bg.image) {
            body.classList.add('custom-bg');
            if (bg.image) {
                body.style.backgroundImage = `url(${bg.image})`;
                body.style.backgroundSize = 'cover';
                body.style.backgroundPosition = 'center';
                body.style.backgroundAttachment = 'fixed';
            }
            if (bg.color) {
                body.style.backgroundColor = bg.color;
            }
            // 亮度和色调
            const filters = [];
            if (bg.brightness !== undefined && bg.brightness !== 100) {
                filters.push(`brightness(${bg.brightness}%)`);
            }
            if (bg.hue !== undefined && bg.hue !== 0) {
                filters.push(`hue-rotate(${bg.hue}deg)`);
            }
            if (filters.length > 0) {
                body.style.filter = filters.join(' ');
            }
        }
    },

    restartParticles() {
        const settings = Storage.get('settings', {});
        if (settings.particlesEnabled === false) {
            ParticleSystem.stop();
            return;
        }

        const theme = ThemeManager.getCurrent();
        const config = {
            type: theme.particle.type,
            color: theme.colors.accentPrimary,
            count: settings.particleCount || theme.particle.count || 50,
            speed: theme.particle.speed || 1,
            size: theme.particle.size || 4
        };
        ParticleSystem.start(config);
    }
};

// 启动应用
function boot() {
    App.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}

// 暴露到全局
window.App = App;
window.ParticleSystem = ParticleSystem;
window.UI = UI;
window.Pages = Pages;
window.Router = Router;

})();

// ===== DriveScore India - Interactive Prototype =====

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScoreAnimation();
    initTrendChart();
    initDistributionChart();
    initPercentileAnimation();
    initCrisisCounters();
    initNotifications();
    initFilterTabs();
    initSmoothScroll();
    initScrollAnimations();
    initFeatureCards();
    initCanvasResize();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.getElementById('mobileOverlay');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.contains('mobile-open');

        if (isOpen) {
            closeMobileMenu(menuBtn, navLinks, overlay);
        } else {
            openMobileMenu(menuBtn, navLinks, overlay);
        }
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu(menuBtn, navLinks, overlay);
        });
    });

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeMobileMenu(menuBtn, navLinks, overlay);
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
            closeMobileMenu(menuBtn, navLinks, overlay);
        }
    });
}

function openMobileMenu(btn, nav, overlay) {
    nav.classList.add('mobile-open');
    btn.classList.add('active');
    document.body.classList.add('body-no-scroll');
    if (overlay) overlay.classList.add('active');
}

function closeMobileMenu(btn, nav, overlay) {
    nav.classList.remove('mobile-open');
    btn.classList.remove('active');
    document.body.classList.remove('body-no-scroll');
    if (overlay) overlay.classList.remove('active');
}

// ===== CANVAS RESIZE HANDLER =====
function initCanvasResize() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Redraw charts on resize / orientation change
            const trendCanvas = document.getElementById('trendChart');
            const distCanvas = document.getElementById('distributionChart');

            if (trendCanvas) {
                trendCanvas.width = 0;
                trendCanvas.height = 0;
                initTrendChart();
            }
            if (distCanvas) {
                distCanvas.width = 0;
                distCanvas.height = 0;
                initDistributionChart();
            }
        }, 250);
    });
}

// ===== SCORE GAUGE ANIMATION =====
function initScoreAnimation() {
    const targetScore = 782;
    const scoreEl = document.getElementById('mainScore');
    const gaugeFill = document.querySelector('.gauge-fill');

    if (!scoreEl || !gaugeFill) return;

    // Animate the number
    animateCounter(scoreEl, 0, targetScore, 2000);

    // Animate the gauge arc
    // Total arc length is ~251.2 (half circle with radius 80)
    const totalArc = 251.2;
    const percentage = (targetScore - 300) / 600; // 300-900 range
    const offset = totalArc * (1 - percentage);

    setTimeout(() => {
        gaugeFill.style.transition = 'stroke-dashoffset 2s ease-out';
        gaugeFill.style.strokeDashoffset = offset;
    }, 300);
}

// ===== TREND CHART (Canvas) =====
function initTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set proper canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Data points (12 months)
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const scores = [735, 742, 750, 770, 775, 720, 728, 745, 758, 748, 770, 782];

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minScore = 680;
    const maxScore = 820;

    function getX(i) {
        return padding.left + (i / (scores.length - 1)) * chartWidth;
    }

    function getY(score) {
        return padding.top + (1 - (score - minScore) / (maxScore - minScore)) * chartHeight;
    }

    // Animate the chart drawing
    let progress = 0;
    const animDuration = 1500;
    const startTime = performance.now();

    function drawFrame(currentTime) {
        progress = Math.min((currentTime - startTime) / animDuration, 1);
        const eased = easeOutCubic(progress);
        const pointsToShow = Math.ceil(eased * scores.length);

        ctx.clearRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.lineWidth = 1;
        for (let s = 700; s <= 800; s += 25) {
            const y = getY(s);
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Y-axis labels
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(s.toString(), padding.left - 8, y + 4);
        }

        // X-axis labels
        ctx.textAlign = 'center';
        months.forEach((month, i) => {
            if (i < pointsToShow) {
                ctx.fillStyle = '#64748b';
                ctx.font = '10px Inter';
                ctx.fillText(month, getX(i), height - 8);
            }
        });

        // Gradient fill
        if (pointsToShow > 1) {
            const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

            ctx.beginPath();
            ctx.moveTo(getX(0), getY(scores[0]));
            for (let i = 1; i < pointsToShow; i++) {
                const xc = (getX(i - 1) + getX(i)) / 2;
                const yc = (getY(scores[i - 1]) + getY(scores[i])) / 2;
                ctx.quadraticCurveTo(getX(i - 1), getY(scores[i - 1]), xc, yc);
            }
            ctx.quadraticCurveTo(getX(pointsToShow - 1), getY(scores[pointsToShow - 1]), getX(pointsToShow - 1), getY(scores[pointsToShow - 1]));
            ctx.lineTo(getX(pointsToShow - 1), height - padding.bottom);
            ctx.lineTo(getX(0), height - padding.bottom);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(scores[0]));
            for (let i = 1; i < pointsToShow; i++) {
                const xc = (getX(i - 1) + getX(i)) / 2;
                const yc = (getY(scores[i - 1]) + getY(scores[i])) / 2;
                ctx.quadraticCurveTo(getX(i - 1), getY(scores[i - 1]), xc, yc);
            }
            ctx.quadraticCurveTo(getX(pointsToShow - 1), getY(scores[pointsToShow - 1]), getX(pointsToShow - 1), getY(scores[pointsToShow - 1]));

            const lineGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
            lineGradient.addColorStop(0, '#6366f1');
            lineGradient.addColorStop(1, '#06b6d4');
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        // Points
        for (let i = 0; i < pointsToShow; i++) {
            const x = getX(i);
            const y = getY(scores[i]);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = i === pointsToShow - 1 ? '#06b6d4' : '#6366f1';
            ctx.fill();
            ctx.strokeStyle = '#0a0e1a';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Highlight last point
            if (i === scores.length - 1 && pointsToShow === scores.length) {
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Score label
                ctx.fillStyle = '#06b6d4';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(scores[i].toString(), x, y - 14);
            }
        }

        if (progress < 1) {
            requestAnimationFrame(drawFrame);
        }
    }

    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            requestAnimationFrame(drawFrame);
            observer.disconnect();
        }
    });
    observer.observe(canvas);
}

// ===== DISTRIBUTION CHART =====
function initDistributionChart() {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const categories = [
        { label: 'Red Zone\n300-449', count: 45, color: '#ef4444', pct: '12%' },
        { label: 'At Risk\n450-599', count: 82, color: '#f97316', pct: '21%' },
        { label: 'Silver\n600-699', count: 105, color: '#eab308', pct: '27%' },
        { label: 'Gold\n700-799', count: 98, color: '#22c55e', pct: '25%' },
        { label: 'Platinum\n800-900', count: 58, color: '#06b6d4', pct: '15%' }
    ];

    const maxCount = Math.max(...categories.map(c => c.count));
    const padding = { top: 30, right: 20, bottom: 60, left: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / categories.length * 0.6;
    const gap = chartWidth / categories.length;

    let progress = 0;
    const animDuration = 1200;
    const startTime = performance.now();

    function drawFrame(currentTime) {
        progress = Math.min((currentTime - startTime) / animDuration, 1);
        const eased = easeOutCubic(progress);

        ctx.clearRect(0, 0, width, height);

        categories.forEach((cat, i) => {
            const x = padding.left + i * gap + (gap - barWidth) / 2;
            const barHeight = (cat.count / maxCount) * chartHeight * eased;
            const y = padding.top + chartHeight - barHeight;

            // Bar with rounded top
            const radius = 6;
            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
            ctx.lineTo(x + barWidth, padding.top + chartHeight);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.closePath();

            // Gradient fill
            const grad = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
            grad.addColorStop(0, cat.color);
            grad.addColorStop(1, cat.color + '40');
            ctx.fillStyle = grad;
            ctx.fill();

            // Highlight user's bar
            if (i === 3) {
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.stroke();

                // "You" indicator
                if (eased > 0.8) {
                    ctx.fillStyle = '#22c55e';
                    ctx.font = 'bold 11px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('YOU', x + barWidth / 2, y - 18);

                    // Arrow
                    ctx.beginPath();
                    ctx.moveTo(x + barWidth / 2, y - 14);
                    ctx.lineTo(x + barWidth / 2 - 4, y - 8);
                    ctx.lineTo(x + barWidth / 2 + 4, y - 8);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Percentage on bar
            if (eased > 0.5) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 13px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(cat.pct, x + barWidth / 2, y + 22);
            }

            // Labels below
            const lines = cat.label.split('\n');
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            lines.forEach((line, li) => {
                ctx.fillText(line, x + barWidth / 2, padding.top + chartHeight + 18 + li * 16);
            });
        });

        if (progress < 1) {
            requestAnimationFrame(drawFrame);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            requestAnimationFrame(drawFrame);
            observer.disconnect();
        }
    });
    observer.observe(canvas);
}

// ===== PERCENTILE ANIMATION =====
function initPercentileAnimation() {
    const percentileEl = document.getElementById('percentileNum');
    const circleFill = document.querySelector('.percentile-fill');

    if (!percentileEl || !circleFill) return;

    const target = 78;
    const totalCircum = 339.3;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounter(percentileEl, 0, target, 1500, 'th');
            const offset = totalCircum * (1 - target / 100);
            circleFill.style.transition = 'stroke-dashoffset 1.5s ease-out';
            circleFill.style.strokeDashoffset = offset;
            observer.disconnect();
        }
    });
    observer.observe(percentileEl);
}

// ===== CRISIS COUNTER ANIMATION =====
function initCrisisCounters() {
    const counters = document.querySelectorAll('.crisis-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, 0, target, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ===== NOTIFICATION PANEL =====
function initNotifications() {
    const bell = document.getElementById('notifBell');
    const panel = document.getElementById('notifPanel');
    const close = document.getElementById('notifClose');

    if (!bell || !panel) return;

    bell.addEventListener('click', () => {
        panel.classList.toggle('open');
    });

    if (close) {
        close.addEventListener('click', () => {
            panel.classList.remove('open');
        });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !bell.contains(e.target)) {
            panel.classList.remove('open');
        }
    });
}

// ===== FILTER TABS =====
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    const items = document.querySelectorAll('.timeline-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;

            items.forEach(item => {
                if (filter === 'all') {
                    item.style.display = '';
                    return;
                }
                const severity = item.dataset.severity;
                item.style.display = (severity === filter || (!severity && filter === 'all')) ? '' : 'none';
            });
        });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function animateCounter(element, start, end, duration, suffix = '') {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.round(start + (end - start) * eased);

        element.textContent = formatNumber(current) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return num.toLocaleString('en-IN');
    }
    return num.toString();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== FEATURE CARDS ACCORDION =====
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        const header = card.querySelector('.feature-card-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');

            // Close all other cards in the same category
            const parentGrid = card.closest('.features-grid');
            if (parentGrid) {
                parentGrid.querySelectorAll('.feature-card.expanded').forEach(openCard => {
                    if (openCard !== card) {
                        openCard.classList.remove('expanded');
                    }
                });
            }

            // Toggle the clicked card
            card.classList.toggle('expanded', !isExpanded);
        });
    });
}

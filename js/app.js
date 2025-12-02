const app = {
    articles: [],

    async init() {
        // Flag embed mode so CSS can hide inner scrollbars when inside an iframe
        if (window.parent !== window) {
            document.documentElement.classList.add('is-embed');
        }

        // Make sure embed scaffolding (height + scroll passthrough) is live even if data fetch fails
        this.enableScrollPassthrough();
        this.syncEmbedHeight();

        await this.loadArticles();
        if (this.articles.length === 0) return;

        this.sortArticles();
        this.preloadTopImages();
        this.renderHero();
        this.renderCategories();
        this.initSearch();
        this.bindNav();
        this.observeSections();
    },

    async loadArticles() {
        // Fetch latest posts from CSV, fall back to bundled data.js if needed.
        try {
            const res = await fetch('Posts.csv', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch Posts.csv');
            const text = await res.text();
            const rows = this.parseCSV(text);
            const mapped = rows.map(r => this.mapRowToArticle(r)).filter(Boolean);
            if (mapped.length) {
                this.articles = mapped;
                return;
            }
        } catch (err) {
            console.warn('CSV load failed, falling back to bundled data.js', err);
        }

        if (Array.isArray(window.articles)) {
            this.articles = [...window.articles];
        }
    },

    parseCSV(text = '') {
        const rows = [];
        let cell = '';
        let row = [];
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const next = text[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    cell += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            const isLineBreak = (char === '\n' || char === '\r');
            if (!inQuotes && (char === ',' || isLineBreak)) {
                row.push(cell);
                cell = '';
                if (isLineBreak) {
                    if (row.length) rows.push(row);
                    row = [];
                    if (char === '\r' && next === '\n') i += 1;
                }
                continue;
            }

            cell += char;
        }

        if (cell || row.length) {
            row.push(cell);
            rows.push(row);
        }

        if (!rows.length) return [];

        const header = rows.shift().map(h => h.replace(/^\ufeff?"+|"+$/g, '').trim());
        return rows
            .filter(r => r.some(Boolean))
            .map(r => {
                const obj = {};
                header.forEach((key, idx) => {
                    obj[key] = (r[idx] || '').trim();
                });
                return obj;
            });
    },

    mapRowToArticle(row = {}) {
        const title = row.Title || row['\ufeff"Title"'] || 'Untitled';
        const coverImage = this.normalizeWixImage(row['Cover Image'] || row.CoverImage || '');
        const linkPath = (row['Post Page URL'] || row.Slug || '').trim();
        const excerpt = row.Excerpt || '';
        const publishedISO = row['Published Date'] || '';
        const { author: authorFromName, date: dateFromName } = this.extractNameDate(row['Name, Date']);
        const author = authorFromName || row.Author || 'Catalyst Staff';
        const category = this.normalizeCategory(row.Category || row['Main Category'] || '');

        const link = linkPath.startsWith('http')
            ? linkPath
            : `https://www.catalyst-magazine.com${linkPath.startsWith('/') ? linkPath : `/post/${linkPath}`}`;

        const dateDisplay = dateFromName || this.formatDate(publishedISO) || (publishedISO || '').slice(0, 10);

        return {
            title,
            author,
            date: dateDisplay,
            published: publishedISO,
            image: coverImage,
            link,
            category,
            excerpt
        };
    },

    normalizeWixImage(url = '') {
        if (!url) return url;
        if (url.startsWith('wix:image://')) {
            const cleaned = url.replace('wix:image://v1/', '').replace('wix:image://', '');
            const [id] = cleaned.split('/');
            if (id) return `https://static.wixstatic.com/media/${id}`;
        }
        return url;
    },

    normalizeCategory(raw = '') {
        const val = raw.toLowerCase();
        if (val.includes('neuro') || val.includes('brain') || val === 'medicine') return 'neuro';
        if (val.includes('public')) return 'public';
        if (val.includes('env')) return 'env';
        if (val.includes('bio') || val.includes('chem') || val.includes('phys')) return 'biochemphys';
        if (val.includes('biotech') || val.includes('ai') || val.includes('tech')) return 'biotech';
        return 'biotech';
    },

    extractNameDate(raw = '') {
        const container = document.createElement('div');
        container.innerHTML = raw;
        const text = container.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return { author: '', date: '' };

        const dateMatch = text.match(/[A-Za-z]{3,9} \d{1,2}, \d{4}/);
        const date = dateMatch ? dateMatch[0] : '';
        const author = date ? text.slice(0, text.indexOf(date)).replace(/[|,]+$/, '').trim() : text;

        return { author, date };
    },

    formatDate(input = '') {
        const date = new Date(input);
        if (Number.isNaN(date.getTime())) return '';

        const formatter = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        });
        return formatter.format(date);
    },

    sortArticles() {
        // Sort by date (Newest first)
        this.articles.sort((a, b) => {
            const bDate = new Date(b.published || b.date || 0).getTime();
            const aDate = new Date(a.published || a.date || 0).getTime();
            return bDate - aDate;
        });
    },

    getCategoryLabel(cat) {
        const labels = {
            'neuro': 'Neuroscience',
            'biochemphys': 'Bio / Chem / Phys',
            'env': 'Environment',
            'public': 'Public Health',
            'biotech': 'Biotech & AI'
        };
        return labels[cat] || 'Article';
    },

    handleNav(url) {
        if (window.top) window.top.location.href = url;
        else window.location.href = url;
    },

    bindNav() {
        const nav = document.getElementById('categoryNav');
        if (!nav) return;

        nav.querySelectorAll('.nav-pill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.scrollToSection(target, e);
            });
        });
    },

    setActiveNav(id) {
        document.querySelectorAll('.nav-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.target === id);
        });
    },

    scrollToSection(id, evt) {
        const el = document.getElementById(id);
        if (!el) return;

        const header = document.querySelector('.sticky-header');
        const headerOffset = header ? header.offsetHeight + 10 : 130;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });

        this.setActiveNav(id);
        if (evt?.currentTarget) evt.currentTarget.blur();
    },

    renderHero() {
        const heroTrack = document.getElementById('recent-track');
        if (!heroTrack) return;

        // Top 6 articles for Hero
        const recentArticles = this.articles.slice(0, 6);

        recentArticles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'hero-card data-card';
            card.dataset.title = article.title.toLowerCase();
            card.dataset.auth = article.author.toLowerCase();
            card.dataset.cat = article.category;
            card.dataset.excerpt = article.excerpt.toLowerCase();
            card.onclick = () => this.handleNav(article.link);

            // Optimize Wix image URL for faster loading (AVIF + WebP + fallback JPG)
            const heroImage = this.buildResponsiveSources(article.image, {
                widths: [520, 760, 1100],
                aspectRatio: 16 / 9,
                quality: 80
            });
            const loading = index < 4 ? 'eager' : 'lazy';
            const fetchpriority = index < 2 ? 'high' : 'low';

            card.innerHTML = `
                <div class="hero-image-wrap">
                    <picture>
                        <source type="image/avif" srcset="${heroImage.avif.srcset}" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 360px" />
                        <source type="image/webp" srcset="${heroImage.webp.srcset}" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 360px" />
                        <img 
                            src="${heroImage.fallback.src}" 
                            srcset="${heroImage.fallback.srcset}" 
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 360px"
                            width="${heroImage.fallback.width}" 
                            height="${heroImage.fallback.height}"
                            alt="${article.title}" 
                            class="hero-image" 
                            loading="${loading}" 
                            fetchpriority="${fetchpriority}" 
                            decoding="async" />
                    </picture>
                </div>
                <div class="hero-content">
                    <div>
                        <span class="tag hero-tag" data-cat="${article.category}">${this.getCategoryLabel(article.category)}</span>
                        <h3 class="hero-headline">${article.title}</h3>
                        <p class="hero-excerpt">${article.excerpt}</p>
                    </div>
                    <div class="meta">
                        <span>${article.date}</span>
                        <span class="read-btn">Read</span>
                    </div>
                </div>
            `;
            heroTrack.appendChild(card);

            // Fade in image when loaded
            const img = card.querySelector('.hero-image');
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            }
        });

        this.buildHeroMarquee(heroTrack);
    },

    renderCategories() {
        const containers = {
            neuro: document.getElementById('container-neuro'),
            biochemphys: document.getElementById('container-biochemphys'),
            env: document.getElementById('container-env'),
            public: document.getElementById('container-public'),
            biotech: document.getElementById('container-biotech')
        };

        this.articles.forEach((article, globalIndex) => {
            const container = containers[article.category];
            if (container) {
                const card = document.createElement('div');
                card.className = 'std-card data-card';
                card.dataset.title = article.title.toLowerCase();
                card.dataset.auth = article.author.toLowerCase();
                card.dataset.cat = article.category;
                card.dataset.excerpt = article.excerpt.toLowerCase();
                card.onclick = () => this.handleNav(article.link);

                // Optimize Wix image URL for faster loading (AVIF + WebP + fallback JPG)
                const cardImage = this.buildResponsiveSources(article.image, {
                    widths: [360, 520, 720],
                    aspectRatio: 16 / 10,
                    quality: 78
                });
                const fetchpriority = globalIndex < 3 ? 'high' : 'low';

                card.innerHTML = `
                    <div class="std-image-wrap">
                        <picture>
                            <source type="image/avif" srcset="${cardImage.avif.srcset}" sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px" />
                            <source type="image/webp" srcset="${cardImage.webp.srcset}" sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px" />
                            <img
                                src="${cardImage.fallback.src}"
                                srcset="${cardImage.fallback.srcset}"
                                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px"
                                width="${cardImage.fallback.width}"
                                height="${cardImage.fallback.height}"
                                alt="${article.title}"
                                class="std-image"
                                loading="lazy"
                                fetchpriority="${fetchpriority}"
                                decoding="async" />
                        </picture>
                    </div>
                    <div class="std-content">
                        <span class="tag std-cat">${this.getCategoryLabel(article.category)}</span>
                        <h4 class="std-title">${article.title}</h4>
                        <p class="std-excerpt">${article.excerpt}</p>
                        <div class="meta std-meta">
                            <span style="font-weight:600">${article.author}</span>
                            <span>${article.date}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);

                // Fade in image when loaded
                const img = card.querySelector('.std-image');
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                }
            }
        });

        // Cleanup empty sections
        Object.keys(containers).forEach(key => {
            if(containers[key] && containers[key].children.length === 0) {
                document.getElementById(key).parentElement.style.display = 'none';
            }
        });
    },

    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.data-card');
            const noResults = document.getElementById('noResults');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const title = card.dataset.title;
                const author = card.dataset.auth;
                const excerpt = card.dataset.excerpt || '';
                const cat = card.dataset.cat || '';
                
                if (title.includes(term) || author.includes(term) || excerpt.includes(term) || cat.includes(term)) {
                    card.classList.remove('hidden');
                    visibleCount += 1;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Hide/Show rows based on results
            document.querySelectorAll('.category-row, .hero-section').forEach(section => {
                const visibleCards = section.querySelectorAll('.data-card:not(.hidden)');
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });

            if (noResults) {
                noResults.classList.toggle('hidden', visibleCount !== 0);
            }
        });
    },

    observeSections() {
        const sections = document.querySelectorAll('.category-row, #recent');
        if (!('IntersectionObserver' in window) || sections.length === 0) return;

        const header = document.querySelector('.sticky-header');
        const headerOffset = header ? header.offsetHeight + 10 : 140;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    this.setActiveNav(id === 'recent' ? 'recent' : entry.target.dataset.cat);
                }
            });
        }, {
            rootMargin: `-${headerOffset}px 0px -60% 0px`,
            threshold: 0.35
        });

        sections.forEach(section => observer.observe(section));
    },

    buildHeroMarquee(track) {
        const cards = Array.from(track.querySelectorAll('.hero-card'));
        if (cards.length === 0) return;

        // Duplicate cards for seamless loop
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.dataset.clone = 'true';
            track.appendChild(clone);
        });

        // Calculate shift based on card width + gap
        requestAnimationFrame(() => {
            const firstCard = track.querySelector('.hero-card');
            const style = getComputedStyle(track);
            const gap = parseInt(style.columnGap || style.gap || '20', 10);
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
            const totalWidth = (cardWidth + gap) * cards.length;
            track.style.setProperty('--hero-shift', `-${totalWidth}px`);
            track.style.setProperty('--hero-duration', `${Math.max(cards.length * 8, 30)}s`);
        });
    },

    optimizeWixImage(url, { width = 800, aspectRatio = 16 / 9, quality = 82, qualityAuto = true, format = 'webp', mode = 'fill' } = {}) {
        // Wix media supports dynamic transforms via the /v1 path. This returns a resized + compressed URL (AVIF/WebP/JPG).
        if (!url || !url.includes('wixstatic.com/media')) return url;

        const match = url.match(/https?:\/\/static\.wixstatic\.com\/media\/([^\/]+)/i);
        if (!match || !width) return url;

        const mediaId = match[1];
        const targetWidth = Math.round(width);
        const targetHeight = Math.max(1, Math.round(targetWidth / aspectRatio));
        const clampedQuality = Math.min(95, Math.max(70, Math.round(quality)));

        const transforms = [
            `w_${targetWidth}`,
            `h_${targetHeight}`,
            'al_c',
            `q_${clampedQuality}`,
            'usm_0.66_1.00_0.01'
        ];

        if (qualityAuto) transforms.push('quality_auto');
        if (format === 'avif') transforms.push('enc_avif');

        const ext = format === 'jpg' ? 'jpg' : format;

        return `https://static.wixstatic.com/media/${mediaId}/v1/${mode}/${transforms.join(',')}/optimized.${ext}`;
    },

    buildSrcSet(url, { widths = [400, 700, 1100], aspectRatio = 16 / 9, quality = 82, qualityAuto = true, format = 'webp' } = {}) {
        const cleanWidths = widths.filter(Boolean).sort((a, b) => a - b);
        const primaryWidth = cleanWidths[Math.min(1, cleanWidths.length - 1)] || widths[0] || 800;
        const primaryHeight = Math.round(primaryWidth / aspectRatio);

        const srcset = cleanWidths.map(w => {
            const optimized = this.optimizeWixImage(url, { width: w, aspectRatio, quality, qualityAuto, format });
            return `${optimized} ${Math.round(w)}w`;
        }).join(', ');

        return {
            src: this.optimizeWixImage(url, { width: primaryWidth, aspectRatio, quality, qualityAuto, format }),
            srcset,
            width: primaryWidth,
            height: primaryHeight
        };
    },

    buildResponsiveSources(url, options = {}) {
        return {
            avif: this.buildSrcSet(url, { ...options, format: 'avif', qualityAuto: true }),
            webp: this.buildSrcSet(url, { ...options, format: 'webp', qualityAuto: true }),
            fallback: this.buildSrcSet(url, { ...options, format: 'jpg', qualityAuto: true })
        };
    },

    preloadTopImages() {
        // Preload first 3 hero images with optimized AVIF sources
        const top = this.articles.slice(0, 3).map(a => this.buildSrcSet(a.image, { widths: [720, 980], aspectRatio: 16 / 9, quality: 80, format: 'avif' }).src);
        const head = document.head;

        top.forEach((src, index) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.fetchpriority = index < 2 ? 'high' : 'low';
            head.appendChild(link);
        });
    },

    syncEmbedHeight() {
        // If this is running inside an iframe (e.g., Wix HTML embed), ask the parent to size the frame
        if (window.parent === window) return;

        const postHeight = () => {
            const height = Math.ceil(document.documentElement.scrollHeight);
            try {
                const payload = { type: 'setHeight', height };
                window.parent.postMessage(payload, '*');
                // Secondary payload for platforms that expect a different key
                window.parent.postMessage({ type: 'embed-size', height }, '*');
            } catch (_) { /* noop */ }
        };

        // Initial + on resize/content changes
        window.addEventListener('load', postHeight);
        window.addEventListener('resize', postHeight);
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => requestAnimationFrame(postHeight));
            ro.observe(document.body);
        }
    },

    enableScrollPassthrough() {
        // Forward scroll gestures to the parent page so the iframe never traps scroll
        if (window.parent === window) return;

        // Allow normal overflow for better scroll behavior
        const root = document.documentElement;
        const body = document.body;
        if (root) {
            root.style.overflow = 'hidden';
            root.style.overscrollBehavior = 'none';
        }
        if (body) {
            body.style.overflow = 'hidden';
            body.style.overscrollBehavior = 'none';
        }

        let bridgeReady = false;

        const postToAncestors = (payload = {}) => {
            let sent = false;
            const targets = new Set();

            if (window.parent && window.parent !== window) targets.add(window.parent);
            if (window.top && window.top !== window && window.top !== window.parent) targets.add(window.top);

            targets.forEach(target => {
                try {
                    target.postMessage(payload, '*');
                    sent = true;
                } catch (_) { /* noop */ }
            });

            return sent;
        };

        // Lightweight handshake so we only suppress default scrolling once the parent can respond
        const requestBridge = () => postToAncestors({ type: 'scroll-bridge-ping' });
        requestBridge();
        const pingInterval = setInterval(() => {
            if (bridgeReady) {
                clearInterval(pingInterval);
                return;
            }
            requestBridge();
        }, 800);

        window.addEventListener('message', (event) => {
            if (event?.data?.type === 'scroll-bridge-ack') {
                bridgeReady = true;
            }
        });

        const forward = (deltaY = 0, deltaX = 0) => {
            postToAncestors({ type: 'scroll', deltaY, deltaX });
            return bridgeReady;
        };

        // Forward wheel events to parent
        const wheelHandler = (e) => {
            if (forward(e.deltaY, e.deltaX)) {
                e.preventDefault();
            }
        };
        window.addEventListener('wheel', wheelHandler, { passive: false });
        document.addEventListener('wheel', wheelHandler, { passive: false });

        // Forward touch events to parent for mobile
        let lastTouchY = null;
        let lastTouchX = null;
        window.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                lastTouchY = e.touches[0].clientY;
                lastTouchX = e.touches[0].clientX;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const currentY = e.touches[0].clientY;
                const currentX = e.touches[0].clientX;
                if (lastTouchY !== null) {
                    const deltaY = lastTouchY - currentY;
                    const deltaX = lastTouchX - currentX;
                    if (forward(deltaY, deltaX)) {
                        e.preventDefault();
                    }
                }
                lastTouchY = currentY;
                lastTouchX = currentX;
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            lastTouchY = null;
            lastTouchX = null;
        }, { passive: true });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => app.init());

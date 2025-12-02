const app = {
    articles: [],
    editorials: [],

    async init() {
        // 1. PREVENT SCROLL TRAPPING
        // We do NOT add 'is-embed' class to avoid the 'touch-action: none' CSS that kills scrolling.
        // We only hide the internal scrollbar so the parent page handles scrolling.
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // 2. ENABLE AUTO-RESIZE
        this.syncEmbedHeight();

        // 3. LOAD CONTENT
        await this.loadArticles();
        await this.loadEditorials();

        if (this.articles.length === 0 && this.editorials.length === 0) return;

        this.sortArticles();
        this.sortArticles(this.editorials);
        
        if (this.articles.length) {
            this.preloadTopImages();
            this.renderHero();
            this.renderCategories();
        }
        this.renderEditorials();
        this.initSearch();
        this.bindNav();
        this.observeSections();
        
        // Force a height update after render
        setTimeout(() => this.syncEmbedHeight(), 500);
        setTimeout(() => this.syncEmbedHeight(), 2000);
    },

    async loadArticles() {
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
            console.warn('CSV load failed, using fallback', err);
        }
        if (Array.isArray(window.articles)) this.articles = [...window.articles];
    },

    async loadEditorials() {
        try {
            const res = await fetch('Editorials.csv', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch Editorials.csv');
            const text = await res.text();
            const rows = this.parseCSV(text);
            const mapped = rows.map(r => this.mapRowToEditorial(r)).filter(Boolean);
            if (mapped.length) this.editorials = mapped;
        } catch (err) {
            console.warn('Editorial CSV load failed', err);
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
        return rows.filter(r => r.some(Boolean)).map(r => {
            const obj = {};
            header.forEach((key, idx) => obj[key] = (r[idx] || '').trim());
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

        const link = linkPath.startsWith('http') ? linkPath : 
            `https://www.catalyst-magazine.com${linkPath.startsWith('/') ? linkPath : `/post/${linkPath}`}`;

        const dateDisplay = dateFromName || this.formatDate(publishedISO) || (publishedISO || '').slice(0, 10);

        return { title, author, date: dateDisplay, published: publishedISO, image: coverImage, link, category, excerpt };
    },

    mapRowToEditorial(row = {}) {
        const base = this.mapRowToArticle(row);
        if (!base) return null;
        const readTimeRaw = row['Time To Read'] || row['Read Time'] || '';
        const readTime = readTimeRaw ? `${readTimeRaw} min read` : '';
        const tone = row['Main Category'] || row.Category || 'Editorial';
        const publishedISO = row['Published Date'] || base.published || '';
        const { author: a, date: d } = this.extractNameDate(row['Name, Date']);

        return { ...base, category: 'editorial', date: d || base.date, author: a || base.author, published: publishedISO, readTime, tone };
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
        if (val.includes('editorial')) return 'editorial';
        if (val.includes('neuro') || val.includes('brain') || val === 'medicine') return 'neuro';
        if (val.includes('public')) return 'public';
        if (val.includes('env')) return 'env';
        if (val.includes('bio') || val.includes('chem') || val.includes('phys')) return 'biochemphys';
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
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
    },

    sortArticles(collection = this.articles) {
        collection.sort((a, b) => new Date(b.published || b.date || 0) - new Date(a.published || a.date || 0));
    },

    getCategoryLabel(cat) {
        const labels = {
            'neuro': 'Neuroscience', 'biochemphys': 'Bio / Chem / Phys', 'env': 'Environment',
            'public': 'Public Health', 'biotech': 'Biotech & AI', 'editorial': 'Editorial'
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
        
        // When using iframe height expansion, we need to ask the parent window to scroll
        // Since we can't scroll the parent directly due to cross-origin, we can try to
        // send a message or just rely on native behavior if same-origin.
        // For Wix Embeds, internal anchor scrolling is tricky. 
        // Best approach: Just scroll the iframe internal content, which might work if iframe is huge.
        
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        this.setActiveNav(id);
        if (evt?.currentTarget) evt.currentTarget.blur();
    },

    renderHero() {
        const heroTrack = document.getElementById('recent-track');
        if (!heroTrack) return;
        const recentArticles = this.articles.slice(0, 6);

        recentArticles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'hero-card data-card';
            card.dataset.title = article.title.toLowerCase();
            card.dataset.auth = article.author.toLowerCase();
            card.dataset.cat = article.category;
            card.dataset.excerpt = article.excerpt.toLowerCase();
            card.onclick = () => this.handleNav(article.link);

            const heroImage = this.buildResponsiveSources(article.image, { widths: [520, 760, 1100], aspectRatio: 16 / 9, quality: 80 });
            card.innerHTML = `
                <div class="hero-image-wrap">
                    <picture>
                        <source type="image/avif" srcset="${heroImage.avif.srcset}" sizes="(max-width: 640px) 90vw, 360px" />
                        <source type="image/webp" srcset="${heroImage.webp.srcset}" sizes="(max-width: 640px) 90vw, 360px" />
                        <img src="${heroImage.fallback.src}" class="hero-image" loading="${index < 4 ? 'eager' : 'lazy'}" alt="${article.title}">
                    </picture>
                </div>
                <div class="hero-content">
                    <div>
                        <span class="tag hero-tag" data-cat="${article.category}">${this.getCategoryLabel(article.category)}</span>
                        <h3 class="hero-headline">${article.title}</h3>
                        <p class="hero-excerpt">${article.excerpt}</p>
                    </div>
                    <div class="meta"><span>${article.date}</span><span class="read-btn">Read</span></div>
                </div>`;
            heroTrack.appendChild(card);
            const img = card.querySelector('.hero-image');
            if (img.complete) img.classList.add('loaded');
            else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
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
                card.onclick = () => this.handleNav(article.link);
                card.dataset.auth = article.author.toLowerCase();
                card.dataset.cat = article.category;
                card.dataset.excerpt = article.excerpt.toLowerCase();

                const cardImage = this.buildResponsiveSources(article.image, { widths: [360, 520, 720], aspectRatio: 16 / 10, quality: 78 });
                card.innerHTML = `
                    <div class="std-image-wrap">
                        <picture>
                            <source type="image/avif" srcset="${cardImage.avif.srcset}" sizes="(max-width: 640px) 88vw, 320px" />
                            <source type="image/webp" srcset="${cardImage.webp.srcset}" sizes="(max-width: 640px) 88vw, 320px" />
                            <img src="${cardImage.fallback.src}" class="std-image" loading="lazy" alt="${article.title}">
                        </picture>
                    </div>
                    <div class="std-content">
                        <span class="tag std-cat">${this.getCategoryLabel(article.category)}</span>
                        <h4 class="std-title">${article.title}</h4>
                        <p class="std-excerpt">${article.excerpt}</p>
                        <div class="meta std-meta"><span style="font-weight:600">${article.author}</span><span>${article.date}</span></div>
                    </div>`;
                container.appendChild(card);
                const img = card.querySelector('.std-image');
                if (img.complete) img.classList.add('loaded');
                else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            }
        });
        
        Object.keys(containers).forEach(key => {
            if(containers[key] && containers[key].children.length === 0) document.getElementById(key).parentElement.style.display = 'none';
        });
    },

    renderEditorials() {
        const section = document.getElementById('editorials');
        const container = document.getElementById('editorials-container');
        if (!section || !container) return;
        container.innerHTML = '';
        if (!this.editorials.length) { section.style.display = 'none'; return; }

        this.editorials.slice(0, 9).forEach((article, idx) => {
            const card = document.createElement('article');
            card.className = 'editorial-card data-card';
            card.onclick = () => this.handleNav(article.link);
            card.dataset.title = article.title.toLowerCase();
            card.dataset.auth = article.author.toLowerCase();
            card.dataset.cat = 'editorial';
            card.dataset.excerpt = (article.excerpt || '').toLowerCase();

            const visual = this.buildResponsiveSources(article.image, { widths: [420, 560, 720], aspectRatio: 4 / 3, quality: 85 });
            card.innerHTML = `
                <div class="editorial-image-wrap">
                    <picture>
                        <source type="image/avif" srcset="${visual.avif.srcset}" sizes="(max-width: 900px) 100vw, 320px" />
                        <img src="${visual.fallback.src}" class="editorial-image" loading="${idx < 6 ? 'eager' : 'lazy'}" alt="${article.title}">
                    </picture>
                </div>
                <div class="editorial-body">
                    <div class="editorial-kicker"><span class="editorial-dot"></span>${article.tone || 'Editorial'}</div>
                    <h3 class="editorial-title">${article.title}</h3>
                    <p class="editorial-excerpt">${article.excerpt}</p>
                    <div class="editorial-meta"><span class="editorial-author">${article.author}</span><span class="editorial-divider">•</span><span>${article.date}</span><span class="editorial-read">Read</span></div>
                </div>`;
            container.appendChild(card);
            const img = card.querySelector('.editorial-image');
            if (img.complete) img.classList.add('loaded');
            else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        });
    },

    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            let visibleCount = 0;
            document.querySelectorAll('.data-card').forEach(card => {
                const match = [card.dataset.title, card.dataset.auth, card.dataset.excerpt, card.dataset.cat].some(t => t && t.includes(term));
                card.classList.toggle('hidden', !match);
                if (match) visibleCount++;
            });
            document.querySelectorAll('.category-row, .hero-section, .editorial-section').forEach(sec => {
                sec.style.display = sec.querySelectorAll('.data-card:not(.hidden)').length > 0 ? 'block' : 'none';
            });
            const noResults = document.getElementById('noResults');
            if (noResults) noResults.classList.toggle('hidden', visibleCount !== 0);
            this.syncEmbedHeight(); // Resize after filtering
        });
    },

    observeSections() {
        // Simple observer for active nav state
        const sections = document.querySelectorAll('.category-row, #recent');
        if (!('IntersectionObserver' in window) || sections.length === 0) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNav(entry.target.id === 'recent' ? 'recent' : entry.target.dataset.cat);
                }
            });
        }, { threshold: 0.1 }); // Lower threshold for tall iframe
        sections.forEach(section => observer.observe(section));
    },

    buildHeroMarquee(track) {
        const cards = Array.from(track.querySelectorAll('.hero-card'));
        if (!cards.length) return;
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.dataset.clone = 'true';
            track.appendChild(clone);
        });
        requestAnimationFrame(() => {
            const first = track.querySelector('.hero-card');
            const style = getComputedStyle(track);
            const gap = parseInt(style.columnGap || style.gap || '20', 10);
            const width = first ? first.getBoundingClientRect().width : 320;
            track.style.setProperty('--hero-shift', `-${(width + gap) * cards.length}px`);
            track.style.setProperty('--hero-duration', `${Math.max(cards.length * 8, 30)}s`);
        });
    },

    optimizeWixImage(url, { width=800, aspectRatio=16/9, quality=82, qualityAuto=true, format='webp', mode='fill' } = {}) {
        if (!url || !url.includes('wixstatic.com/media')) return url;
        const match = url.match(/https?:\/\/static\.wixstatic\.com\/media\/([^\/]+)/i);
        if (!match) return url;
        const h = Math.max(1, Math.round(width / aspectRatio));
        const transforms = [`w_${Math.round(width)}`, `h_${h}`, 'al_c', `q_${Math.min(95, Math.max(70, quality))}`, 'usm_0.66_1.00_0.01'];
        if (qualityAuto) transforms.push('quality_auto');
        if (format === 'avif') transforms.push('enc_avif');
        return `https://static.wixstatic.com/media/${match[1]}/v1/${mode}/${transforms.join(',')}/optimized.${format === 'jpg' ? 'jpg' : format}`;
    },

    buildSrcSet(url, { widths = [400, 700, 1100], aspectRatio = 16 / 9, quality = 82, qualityAuto = true, format = 'webp' } = {}) {
        const srcset = widths.map(w => `${this.optimizeWixImage(url, { width: w, aspectRatio, quality, qualityAuto, format })} ${Math.round(w)}w`).join(', ');
        return {
            src: this.optimizeWixImage(url, { width: widths[1] || 800, aspectRatio, quality, qualityAuto, format }),
            srcset, width: widths[1] || 800, height: Math.round((widths[1] || 800) / aspectRatio)
        };
    },

    buildResponsiveSources(url, opts = {}) {
        return {
            avif: this.buildSrcSet(url, { ...opts, format: 'avif' }),
            webp: this.buildSrcSet(url, { ...opts, format: 'webp' }),
            fallback: this.buildSrcSet(url, { ...opts, format: 'jpg' })
        };
    },

    preloadTopImages() {
        this.articles.slice(0, 3).forEach((a, i) => {
            const src = this.buildSrcSet(a.image, { widths: [720], aspectRatio: 16/9, quality: 80, format: 'avif' }).src;
            const link = document.createElement('link');
            link.rel = 'preload'; link.as = 'image'; link.href = src;
            if (i < 2) link.fetchpriority = 'high';
            document.head.appendChild(link);
        });
    },

    syncEmbedHeight() {
        // Send the Full Height to parent so it can resize the iframe
        if (window.parent === window) return;

        const postHeight = () => {
            // Get height including margins/overflow
            const height = document.body.scrollHeight;
            if (height > 0) {
                window.parent.postMessage({ type: 'setHeight', height }, '*');
                window.parent.postMessage({ type: 'embed-size', height }, '*');
            }
        };

        // Send updates whenever content changes
        postHeight();
        window.addEventListener('resize', postHeight);
        
        // Watch for DOM changes (like images loading)
        if ('ResizeObserver' in window) {
            new ResizeObserver(() => requestAnimationFrame(postHeight)).observe(document.body);
        }
        // Fallback polling for slow networks
        setTimeout(postHeight, 1000);
        setTimeout(postHeight, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());

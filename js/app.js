const app = {
    init() {
        this.sortArticles();
        this.preloadTopImages();
        this.renderHero();
        this.renderCategories();
        this.initSearch();
        this.bindNav();
        this.observeSections();
        this.syncEmbedHeight();
    },

    sortArticles() {
        // Sort by date (Newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
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
        const recentArticles = articles.slice(0, 6);

        recentArticles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'hero-card data-card';
            card.dataset.title = article.title.toLowerCase();
            card.dataset.auth = article.author.toLowerCase();
            card.dataset.cat = article.category;
            card.dataset.excerpt = article.excerpt.toLowerCase();
            card.onclick = () => this.handleNav(article.link);

            // Optimize Wix image URL for faster loading (WebP + resized variants)
            const heroImage = this.buildSrcSet(article.image, {
                widths: [520, 760, 1100],
                aspectRatio: 16 / 9,
                quality: 85
            });
            const loading = index < 4 ? 'eager' : 'lazy';
            const fetchpriority = index < 3 ? 'high' : 'low';

            card.innerHTML = `
                <div class="hero-image-wrap">
                    <img 
                        src="${heroImage.src}" 
                        srcset="${heroImage.srcset}" 
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 360px"
                        width="${heroImage.width}" 
                        height="${heroImage.height}"
                        alt="${article.title}" 
                        class="hero-image" 
                        loading="${loading}" 
                        fetchpriority="${fetchpriority}" 
                        decoding="async" />
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

        articles.forEach((article, globalIndex) => {
            const container = containers[article.category];
            if (container) {
                const card = document.createElement('div');
                card.className = 'std-card data-card';
                card.dataset.title = article.title.toLowerCase();
                card.dataset.auth = article.author.toLowerCase();
                card.dataset.cat = article.category;
                card.dataset.excerpt = article.excerpt.toLowerCase();
                card.onclick = () => this.handleNav(article.link);

                // Optimize Wix image URL for faster loading (WebP + resized variants)
                const cardImage = this.buildSrcSet(article.image, {
                    widths: [360, 520, 720],
                    aspectRatio: 16 / 10,
                    quality: 85
                });

                card.innerHTML = `
                    <div class="std-image-wrap">
                        <img 
                            src="${cardImage.src}" 
                            srcset="${cardImage.srcset}"
                            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px"
                            width="${cardImage.width}" 
                            height="${cardImage.height}"
                            alt="${article.title}" 
                            class="std-image" 
                            loading="lazy" 
                            decoding="async" />
                    </div>
                    <div class="std-content">
                        <span class="tag std-cat">${this.getCategoryLabel(article.category)}</span>
                        <h4 class="std-title">${article.title}</h4>
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

    optimizeWixImage(url, { width = 800, aspectRatio = 16 / 9, quality = 85, format = 'webp', mode = 'fill' } = {}) {
        // Wix media supports dynamic transforms via the /v1 path. This returns a resized + compressed URL.
        if (!url || !url.includes('wixstatic.com/media')) return url;

        const match = url.match(/https?:\/\/static\.wixstatic\.com\/media\/([^\/]+)/i);
        if (!match || !width) return url;

        const mediaId = match[1];
        const targetWidth = Math.round(width);
        const targetHeight = Math.max(1, Math.round(targetWidth / aspectRatio));
        const clampedQuality = Math.min(95, Math.max(70, Math.round(quality)));

        // Use Wix's optimized CDN path with WebP for instant loading
        return `https://static.wixstatic.com/media/${mediaId}/v1/${mode}/w_${targetWidth},h_${targetHeight},al_c,q_${clampedQuality},usm_0.66_1.00_0.01/optimized.${format}`;
    },

    buildSrcSet(url, { widths = [400, 700, 1100], aspectRatio = 16 / 9, quality = 85, format = 'webp' } = {}) {
        const cleanWidths = widths.filter(Boolean).sort((a, b) => a - b);
        const primaryWidth = cleanWidths[Math.min(1, cleanWidths.length - 1)] || widths[0] || 800;
        const primaryHeight = Math.round(primaryWidth / aspectRatio);

        const srcset = cleanWidths.map(w => {
            const optimized = this.optimizeWixImage(url, { width: w, aspectRatio, quality, format });
            return `${optimized} ${Math.round(w)}w`;
        }).join(', ');

        return {
            src: this.optimizeWixImage(url, { width: primaryWidth, aspectRatio, quality, format }),
            srcset,
            width: primaryWidth,
            height: primaryHeight
        };
    },

    preloadTopImages() {
        // Preload first 4 hero images with optimized Wix CDN URLs for instant loading
        const top = articles.slice(0, 4).map(a => this.buildSrcSet(a.image, { widths: [720, 980], aspectRatio: 16 / 9, quality: 85 }).src);
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

        // Fix scrolling: Pass wheel events to parent so page scrolls naturally
        let isScrollingContent = false;

        window.addEventListener('wheel', (e) => {
            // Check if user is scrolling an overflowing container
            let target = e.target;
            while (target && target !== document.body) {
                const isScrollable = target.scrollHeight > target.clientHeight ||
                                    target.scrollWidth > target.clientWidth;
                if (isScrollable && (target.classList.contains('category-nav') ||
                    target.classList.contains('hero-track'))) {
                    isScrollingContent = true;
                    return; // Let the container handle scroll
                }
                target = target.parentElement;
            }

            // Forward scroll to parent frame for page-level scrolling
            if (!isScrollingContent) {
                try {
                    window.parent.postMessage({
                        type: 'scroll',
                        deltaY: e.deltaY,
                        deltaX: e.deltaX
                    }, '*');
                } catch (_) { /* noop */ }
            }
            isScrollingContent = false;
        }, { passive: true });

        // Initial + on resize/content changes
        window.addEventListener('load', postHeight);
        window.addEventListener('resize', postHeight);
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => requestAnimationFrame(postHeight));
            ro.observe(document.body);
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => app.init());

const app = {
    init() {
        this.sortArticles();
        this.renderHero();
        this.renderCategories();
        this.initSearch();
        this.bindNav();
        this.observeSections();
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
            const loading = index === 0 ? 'eager' : 'lazy'; // Eager load first LCP image
            const card = document.createElement('div');
            card.className = 'hero-card data-card';
            card.dataset.title = article.title.toLowerCase();
            card.dataset.auth = article.author.toLowerCase();
            card.dataset.cat = article.category;
            card.dataset.excerpt = article.excerpt.toLowerCase();
            card.onclick = () => this.handleNav(article.link);

            card.innerHTML = `
                <div class="hero-image-wrap">
                    <img src="${article.image}" alt="${article.title}" class="hero-image" loading="${loading}" />
                </div>
                <div class="hero-content">
                    <div>
                        <span class="tag hero-tag" data-cat="${article.category}">${this.getCategoryLabel(article.category)}</span>
                        <h3 class="hero-headline">${article.title}</h3>
                    </div>
                    <div class="meta">
                        <span>${article.date}</span>
                        <span class="read-btn">Read</span>
                    </div>
                </div>
            `;
            heroTrack.appendChild(card);
        });
    },

    renderCategories() {
        const containers = {
            neuro: document.getElementById('container-neuro'),
            biochemphys: document.getElementById('container-biochemphys'),
            env: document.getElementById('container-env'),
            public: document.getElementById('container-public'),
            biotech: document.getElementById('container-biotech')
        };

        articles.forEach(article => {
            const container = containers[article.category];
            if (container) {
                const card = document.createElement('div');
                card.className = 'std-card data-card';
                card.dataset.title = article.title.toLowerCase();
                card.dataset.auth = article.author.toLowerCase();
                card.dataset.cat = article.category;
                card.dataset.excerpt = article.excerpt.toLowerCase();
                card.onclick = () => this.handleNav(article.link);

                card.innerHTML = `
                    <div class="std-image-wrap">
                        <img src="${article.image}" alt="${article.title}" class="std-image" loading="lazy" />
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
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => app.init());

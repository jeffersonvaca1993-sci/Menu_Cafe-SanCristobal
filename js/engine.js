/**
 * ENGINE.JS - Scroll Continuo y Menú Sincronizado
 */
const App = {
    config: {},
    menu: {},
    currentLang: 'es', 
    observer: null,

    async init() {
        try {
            console.log("--- Iniciando Motor Calipso ---");
            const [configRes, menuRes] = await Promise.all([
                fetch('config.toml').then(r => r.text()),
                fetch('menu.toml').then(r => r.text())
            ]);

            this.config = TOML.parse(configRes);
            this.menu = TOML.parse(menuRes);

            // Sincronizar idioma inicial con la configuración
            this.currentLang = this.config.restaurant.show_english ? 'en' : 'es';
            document.documentElement.lang = this.currentLang; // Informar al navegador
            const switchEl = document.getElementById('lang-switch');
            if (switchEl) switchEl.checked = this.currentLang === 'en';

            this.applyBranding();
            this.renderAll();
        } catch (error) {
            console.error("Error en el arranque:", error);
        }
    },

    applyBranding() {
        const { colors, restaurant } = this.config;
        document.documentElement.style.setProperty('--primary', colors.primary);
        document.documentElement.style.setProperty('--bg', colors.background);
        document.documentElement.style.setProperty('--accent', colors.accent);
        document.getElementById('restaurante-nombre').innerText = restaurant.name;
    },

    toggleLanguage() {
        const isChecked = document.getElementById('lang-switch').checked;
        this.currentLang = isChecked ? 'en' : 'es';
        document.documentElement.lang = this.currentLang; // Actualizar idioma para el navegador
        this.renderAll(); 
    },

    renderAll() {
        this.renderNav();
        this.renderFullMenu(); // Ahora dibujamos TODO el menú de golpe
        this.setupScrollObserver(); // Activamos el espía del scroll
    },

    renderNav() {
        const nav = document.getElementById('categories-nav');
        if (!this.menu.categories) return;

        const showEn = this.currentLang === 'en';

        nav.innerHTML = this.menu.categories.map((cat, i) => {
            const catName = (showEn && cat.name_en) ? cat.name_en : cat.name_es;
            return `
                <div class="tab-item ${i === 0 ? 'active' : ''}" 
                     id="tab-${i}"
                     onclick="App.scrollToCategory(${i})">
                    ${catName}
                </div>
            `;
        }).join('');
    },

    renderFullMenu() {
        const container = document.getElementById('menu-container');
        if (!this.menu.categories) return;

        const showEn = this.currentLang === 'en';

        // Mapeamos todas las categorías y las unimos en un solo HTML
        container.innerHTML = this.menu.categories.map((category, i) => {
            const productos = category.products || [];
            const catName = (showEn && category.name_en) ? category.name_en : category.name_es;

            // Le agregamos un ID único a cada sección (ej. id="category-0")
            let html = `
                <div class="category-section" id="category-${i}">
                    <h2 class="category-title">${catName}</h2>
                    ${productos.length > 0 
                        ? productos.map(p => this.assembleProduct(p)).join('') 
                        : '<p class="text-center">No hay productos en esta categoría.</p>'}
                </div>
            `;
            return html;
        }).join('');
    },

    assembleProduct(product) {
        const showEn = this.currentLang === 'en';
        const types = product.types || [];
        const typeCount = types.length;

        // LÓGICA DE FALLBACK: 
        // Si showEn es true y existe name_en, lo usa. De lo contrario, usa name_es.
        const displayName = (showEn && product.name_en) ? product.name_en : product.name_es;
        
        // Lo mismo para la descripción
        const displayDesc = (showEn && product.description_en) ? product.description_en : product.description_es;

        let html = `
            <div class="product-card">
                <div class="product-header">
                    <span class="product-name">${displayName}</span>
                </div>
                ${displayDesc ? `<p class="product-desc">${displayDesc}</p>` : ''}
        `;

        if (typeCount === 1) {
            html += `<div class="type-simple"><div class="dots"></div><b>$${types[0].price.toFixed(2)}</b></div>`;
        } else if (typeCount > 1 && typeCount <= 3) {
            html += `<div class="type-pills">${types.map(t => `<span class="pill-item">${t.name}: $${t.price.toFixed(2)}</span>`).join('')}</div>`;
        } else if (typeCount > 3) {
            html += `<div class="type-grid">${types.map(t => `<div class="grid-box"><span class="grid-label">${t.name}</span><span class="grid-price">$${t.price.toFixed(2)}</span></div>`).join('')}</div>`;
        }

        return html + `</div>`;
    },

    scrollToCategory(index) {
        const section = document.getElementById(`category-${index}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    setupScrollObserver() {
        // Desconectar el observador anterior si existe (para cuando cambiamos de idioma)
        if (this.observer) this.observer.disconnect();

        // Configuramos la ventana de observación (detecta la sección cuando llega a la parte superior)
        const options = {
            root: null,
            rootMargin: '-80px 0px -60% 0px', // -80px compensa la altura del menú sticky
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = entry.target.id.split('-')[1]; // Extrae el número del id "category-X"
                    this.updateActiveTab(index);
                }
            });
        }, options);

        // Empezar a observar todas las categorías
        document.querySelectorAll('.category-section').forEach(section => {
            this.observer.observe(section);
        });
    },

    updateActiveTab(index) {
        // Quita la clase 'active' de todos
        document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        
        // Se la pone al tab actual
        const activeTab = document.getElementById(`tab-${index}`);
        if (activeTab) {
            activeTab.classList.add('active');
            
            // Auto-scroll horizontal inteligente para el menú de categorías
            const nav = document.getElementById('categories-nav');
            const scrollLeft = activeTab.offsetLeft - (nav.offsetWidth / 2) + (activeTab.offsetWidth / 2);
            nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

// --- DATOS DEL MENÚ ---
const CAKES = [
    { id: 101, category: "Clásicas", title: "Torta de Chocolate", description: "Bizcocho esponjoso de puro cacao, relleno y cubierto con nuestro fudge especial.", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80" },
    { id: 102, category: "Frías", title: "Quesillo Tradicional", description: "Cremoso, suave y bañado en su caramelo perfecto.", image: "https://images.unsplash.com/photo-1596541173979-5e7e01589d71?auto=format&fit=crop&w=800&q=80" },
    { id: 103, category: "Frías", title: "Torta 3 Leches", description: "Humedecida en tres leches, coronado con merengue y canela.", image: "https://images.unsplash.com/photo-1562961858-a55a8276f7b9?auto=format&fit=crop&w=800&q=80" },
    { id: 104, category: "Especiales", title: "Milhojas", description: "Capas crujientes de hojaldre artesanal con crema pastelera.", image: "https://images.unsplash.com/photo-1595982823630-9b434a971262?auto=format&fit=crop&w=800&q=80" },
    { id: 105, category: "Tendencia", title: "Brownie Fudge", description: "Cuadritos de chocolate denso y chicloso, con corteza crujiente.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&w=800&q=80" },
    { id: 106, category: "Frías", title: "Torta Imposible", description: "Unión entre quesillo cremoso y torta de chocolate húmeda.", image: "https://images.unsplash.com/photo-1599553765874-325d7429188d?auto=format&fit=crop&w=800&q=80" },
    { id: 107, category: "Frías", title: "Gelatinas Decoradas", description: "Gelatinas de colores, mosaicos o encapsuladas.", image: "https://images.unsplash.com/photo-1595955627237-7f9e8316279f?auto=format&fit=crop&w=800&q=80" },
    { id: 108, category: "Especiales", title: "Cabello de Ángel", description: "Torta de hojaldre relleno con dulce tradicional de cabello de ángel.", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80" },
    { id: 109, category: "Especiales", title: "Torta de Milhoja", description: "Torta completa. Capas crujientes de hojaldre, crema pastelera y arequipe.", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80" }
];

const CATEGORIES = ["Todas", "Clásicas", "Tendencia", "Frías", "Especiales"];
let activeCategory = "Todas";

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar iconos de Lucide
    lucide.createIcons();
    
    renderCategories();
    renderMenu();
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // Mobile Menu Toggle
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
});

// --- RENDERIZADO ---
function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = CATEGORIES.map(cat => `
        <button class="cat-btn ${activeCategory === cat ? 'active' : ''}" onclick="filterMenu('${cat}')">
            ${cat}
        </button>
    `).join('');
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    const filtered = activeCategory === "Todas" ? CAKES : CAKES.filter(c => c.category === activeCategory);
    
    grid.innerHTML = filtered.map(cake => `
        <div class="cake-card">
            <img src="${cake.image}" alt="${cake.title}" class="cake-img">
            <div class="cake-info">
                <span class="badge" style="font-size: 10px; padding: 2px 10px;">${cake.category}</span>
                <h3>${cake.title}</h3>
                <p>${cake.description}</p>
                <a href="https://wa.me/584266531604?text=Hola, precio de ${encodeURIComponent(cake.title)}" target="_blank" class="btn-whatsapp">
                    <i data-lucide="message-circle"></i> CONSULTAR PRECIO
                </a>
            </div>
        </div>
    `).join('');
    
    // Volver a procesar iconos nuevos
    lucide.createIcons();
}

// --- ACCIONES ---
window.filterMenu = (category) => {
    activeCategory = category;
    renderCategories();
    renderMenu();
};
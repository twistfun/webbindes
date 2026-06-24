/* =========================================
   Main Public Logic (Frontend)
   ========================================= */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Injeksi Profil Teaser (Index)
    const elProfilTeaserText = document.getElementById('profil-teaser-text');
    if(elProfilTeaserText) {
        const profilData = await getProfil();
        // Ambil kalimat pertama saja untuk teaser
        const firstSentence = profilData.sejarah ? profilData.sejarah.split('.')[0] + '.' : '';
        elProfilTeaserText.textContent = firstSentence;
    }

    // 2. Injeksi Profil Detail (Profil Page)
    const elSejarah = document.getElementById('detail-sejarah');
    const elVisi = document.getElementById('detail-visi');
    const elMisi = document.getElementById('detail-misi');

    if(elSejarah || elVisi || elMisi) {
        const profilData = await getProfil();
        if(elSejarah) elSejarah.innerHTML = `<p>${formatText(profilData.sejarah)}</p>`;
        if(elVisi) elVisi.innerHTML = formatText(profilData.visi);
        if(elMisi) elMisi.innerHTML = formatList(profilData.misi);
    }

    // 3. Render UMKM Grid (bisa di index atau umkm page)
    const renderUmkmCards = async (containerId, limit = null) => {
        const container = document.getElementById(containerId);
        if(!container) return;

        const umkmList = await getUMKM();
        const displayList = limit ? umkmList.slice(0, limit) : umkmList;

        container.innerHTML = '';
        displayList.forEach(item => {
            const badgeHtml = item.badge ? `<span class="umkm-badge">${item.badge}</span>` : '';
            
            const waNumber = item.whatsapp || '6281234567890';
            const card = document.createElement('div');
            card.className = 'umkm-card';
            card.innerHTML = `
                <div class="umkm-img-wrapper">
                    <a href="detail-produk.html?id=${item.id}">
                        <img src="${item.gambar}" alt="${item.nama}" class="umkm-img">
                    </a>
                    ${badgeHtml}
                </div>
                <div class="umkm-content">
                    <p class="umkm-category">${item.kategori}</p>
                    <h3 class="umkm-title">
                        <a href="detail-produk.html?id=${item.id}" style="transition: var(--transition);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color=''">
                            ${item.nama}
                        </a>
                    </h3>
                    <p class="umkm-seller"><i class='bx bx-user'></i> ${item.penjual}</p>
                    
                    <div class="umkm-footer">
                        <span class="umkm-price">${item.harga}</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <a href="detail-produk.html?id=${item.id}" style="font-size: 0.9rem; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 2px;" title="Lihat Detail">
                                Detail <i class='bx bx-chevron-right' style="font-size: 1.1rem;"></i>
                            </a>
                            <a href="https://wa.me/${waNumber}?text=Halo,%20saya%20tertarik%20membeli%20${encodeURIComponent(item.nama)}" class="btn-icon-round" target="_blank" title="Beli via WhatsApp">
                                <i class='bx bxl-whatsapp'></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Render 3 item di index, atau semua item di umkm page
    renderUmkmCards('index-umkm-grid', 3);
    renderUmkmCards('umkm-grid');

    // 4. Update Tahun Footer
    const yearSpan = document.getElementById('year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 5. Navbar Toggle (Mobile)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if(navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
        });
    }

    // 6. Header Scroll Effect
    const header = document.getElementById('header');
    if(header) {
        window.addEventListener('scroll', () => {
            if(window.scrollY >= 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});

/* =========================================
   Hero Carousel Logic (Index)
   ========================================= */
let currentHeroSlide = 0;
let heroSlideInterval;

function updateHeroCarousel() {
    const heroCarousel = document.getElementById('hero-carousel');
    const heroDots = document.querySelectorAll('#hero-dots .carousel-dot');
    
    if (!heroCarousel) return;
    
    const slides = heroCarousel.children.length;
    
    // Boundary check
    if (currentHeroSlide >= slides) currentHeroSlide = 0;
    if (currentHeroSlide < 0) currentHeroSlide = slides - 1;
    
    // Apply transform to slide
    heroCarousel.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
    
    // Update dots active state
    heroDots.forEach((dot, index) => {
        if (index === currentHeroSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

window.nextHeroSlide = function() {
    currentHeroSlide++;
    updateHeroCarousel();
    resetHeroInterval();
};

window.prevHeroSlide = function() {
    currentHeroSlide--;
    updateHeroCarousel();
    resetHeroInterval();
};

window.goToHeroSlide = function(index) {
    currentHeroSlide = index;
    updateHeroCarousel();
    resetHeroInterval();
};

function resetHeroInterval() {
    clearInterval(heroSlideInterval);
    if (document.getElementById('hero-carousel')) {
        heroSlideInterval = setInterval(window.nextHeroSlide, 5000);
    }
}

// Start auto slide on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hero-carousel')) {
        heroSlideInterval = setInterval(window.nextHeroSlide, 5000);
    }
});

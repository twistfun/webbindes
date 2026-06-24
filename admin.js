/* =========================================
   Admin Panel Navigation
   ========================================= */
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const pageTitle = document.getElementById('page-title');

navBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Remove active class from all
        navBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(`panel-${targetId}`).classList.add('active');
        
        // Update Title
        if(targetId === 'dashboard') pageTitle.textContent = 'Dashboard';
        if(targetId === 'profil')    pageTitle.textContent = 'Kelola Profil Desa';
        if(targetId === 'umkm')      pageTitle.textContent = 'Kelola UMKM';
        if(targetId === 'admins')    pageTitle.textContent = 'Kelola Akun Admin';
        if(targetId === 'pesan')  {
            pageTitle.textContent = 'Pesan Masuk';
            await renderPesanAdmin();
        }
    });
});

/* =========================================
   Profil Management
   ========================================= */
const formProfil = document.getElementById('form-profil');
const inSejarah = document.getElementById('input-sejarah');
const inVisi = document.getElementById('input-visi');
const inMisi = document.getElementById('input-misi');

// Load Data
async function loadProfilAdmin() {
    const data = await getProfil(); // from data.js
    if(inSejarah) inSejarah.value = data.sejarah || '';
    if(inVisi) inVisi.value = data.visi || '';
    if(inMisi) inMisi.value = data.misi || '';
}

if(formProfil) {
    formProfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newData = {
            sejarah: inSejarah.value,
            visi: inVisi.value,
            misi: inMisi.value
        };
        await saveProfil(newData);
        alert('Profil berhasil disimpan!');
    });
}

/* =========================================
   UMKM Management
   ========================================= */
const tableBody = document.getElementById('umkm-table-body');
const modal = document.getElementById('umkm-modal');
const btnCloseModal = document.getElementById('close-modal');
const btnAdd = document.getElementById('btn-add-umkm');
const formUmkm = document.getElementById('form-umkm');
const modalTitle = document.getElementById('modal-title');

// Helper function to format/sanitize WhatsApp number
function formatWhatsAppNumber(num) {
    if (!num) return '';
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
}

// Form inputs
const uId = document.getElementById('umkm-id');
const uNama = document.getElementById('u-nama');
const uKategori = document.getElementById('u-kategori');
const uPenjual = document.getElementById('u-penjual');
const uWhatsapp = document.getElementById('u-whatsapp');
const uHarga = document.getElementById('u-harga');
const uGambar = document.getElementById('u-gambar');
const uBadge = document.getElementById('u-badge');
const uDeskripsi = document.getElementById('u-deskripsi');

async function renderUmkmAdmin() {
    if(!tableBody) return;
    const umkmList = await getUMKM();
    tableBody.innerHTML = '';
    
    if(umkmList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada data UMKM.</td></tr>';
        return;
    }

    umkmList.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${item.gambar}" alt="${item.nama}" class="umkm-thumb"></td>
            <td><strong>${item.nama}</strong><br><small style="color:#64748b;">${item.penjual} (WA: ${item.whatsapp || '6281234567890'})</small></td>
            <td>${item.kategori}</td>
            <td>${item.harga}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary" onclick="editUmkm(${item.id})"><i class='bx bx-edit'></i> Edit</button>
                    <button class="btn btn-danger" onclick="deleteUmkm(${item.id})"><i class='bx bx-trash'></i> Hapus</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openModal(isEdit = false) {
    if(!modal) return;
    modal.classList.add('show');
    if(!isEdit) {
        modalTitle.textContent = 'Tambah Produk UMKM';
        formUmkm.reset();
        uId.value = '';
        uGambar.required = true;
        const previewContainer = document.getElementById('u-gambar-preview-container');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
    } else {
        modalTitle.textContent = 'Edit Produk UMKM';
    }
}

function closeModal() {
    if(modal) modal.classList.remove('show');
}

if(btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
if(btnAdd) btnAdd.addEventListener('click', () => openModal(false));

window.addEventListener('click', (e) => {
    if(modal && e.target === modal) closeModal();
});

// Save or Update
if(formUmkm) {
    formUmkm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let umkmList = await getUMKM();
        
        const idVal = uId.value;
        let gambarDataUrl = '';
        const file = uGambar.files[0];
        
        if (file) {
            const fileType = file.type;
            const fileName = file.name.toLowerCase();
            const isJpg = fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
            if (!isJpg) {
                alert('File harus berupa format JPG (.jpg atau .jpeg)!');
                return;
            }
            
            try {
                gambarDataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Gagal membaca file.'));
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                alert('Gagal mengunggah foto. Silakan coba lagi.');
                return;
            }
        } else if (idVal) {
            const item = umkmList.find(u => u.id === parseInt(idVal));
            if (item) {
                gambarDataUrl = item.gambar;
            }
        }
        
        if (!gambarDataUrl) {
            alert('Foto produk wajib diunggah!');
            return;
        }
        
        const newData = {
            id: idVal ? parseInt(idVal) : Date.now(),
            nama: uNama.value,
            kategori: uKategori.value,
            penjual: uPenjual.value,
            whatsapp: formatWhatsAppNumber(uWhatsapp.value),
            harga: uHarga.value,
            gambar: gambarDataUrl,
            badge: uBadge.value,
            deskripsi: uDeskripsi.value
        };

        if (idVal) {
            const index = umkmList.findIndex(u => u.id === parseInt(idVal));
            if(index !== -1) umkmList[index] = newData;
        } else {
            umkmList.push(newData);
        }

        await saveUMKM(umkmList);
        await renderUmkmAdmin();
        closeModal();
        alert('Data UMKM berhasil disimpan!');
    });
}

if (uGambar) {
    uGambar.addEventListener('change', () => {
        const file = uGambar.files[0];
        if (file) {
            const fileType = file.type;
            const fileName = file.name.toLowerCase();
            const isJpg = fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
            if (!isJpg) {
                alert('File harus berupa format JPG (.jpg atau .jpeg)!');
                uGambar.value = '';
                const previewContainer = document.getElementById('u-gambar-preview-container');
                if (previewContainer) previewContainer.style.display = 'none';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewContainer = document.getElementById('u-gambar-preview-container');
                const previewImg = document.getElementById('u-gambar-preview');
                if (previewContainer && previewImg) {
                    previewImg.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

window.editUmkm = async function(id) {
    const umkmList = await getUMKM();
    const item = umkmList.find(u => u.id === id);
    if(item) {
        uId.value = item.id;
        uNama.value = item.nama;
        uKategori.value = item.kategori;
        uPenjual.value = item.penjual;
        uWhatsapp.value = item.whatsapp || '';
        uHarga.value = item.harga;
        
        const previewContainer = document.getElementById('u-gambar-preview-container');
        const previewImg = document.getElementById('u-gambar-preview');
        if (previewContainer && previewImg) {
            previewImg.src = item.gambar;
            previewContainer.style.display = 'block';
        }
        
        uGambar.required = false;
        uGambar.value = '';
        uBadge.value = item.badge || '';
        uDeskripsi.value = item.deskripsi || '';
        openModal(true);
    }
}

window.deleteUmkm = async function(id) {
    if(confirm('Yakin ingin menghapus produk ini?')) {
        let umkmList = await getUMKM();
        umkmList = umkmList.filter(u => u.id !== id);
        await saveUMKM(umkmList);
        await renderUmkmAdmin();
    }
}

/* =========================================
   Admin Accounts Management
   ========================================= */
const adminsTableBody = document.getElementById('admins-table-body');
const formAddAdmin = document.getElementById('form-add-admin');
const formChangePassword = document.getElementById('form-change-password');
const currentUserDisplay = document.getElementById('current-user-display');
const currentUsername = sessionStorage.getItem('adminUsername') || 'admin';

async function renderAdminsAdmin() {
    if(!adminsTableBody) return;
    const admins = await getAdmins();
    adminsTableBody.innerHTML = '';
    
    if (currentUserDisplay) {
        currentUserDisplay.textContent = currentUsername;
    }

    admins.forEach(admin => {
        const tr = document.createElement('tr');
        const deleteBtn = admin.username === currentUsername 
            ? `<span style="color: #94a3b8; font-size: 0.85rem;">(Anda)</span>` 
            : `<button class="btn btn-danger" onclick="deleteAdmin('${admin.username}')"><i class='bx bx-trash'></i> Hapus</button>`;

        tr.innerHTML = `
            <td><strong>${admin.username}</strong></td>
            <td>${deleteBtn}</td>
        `;
        adminsTableBody.appendChild(tr);
    });
}

if (formAddAdmin) {
    formAddAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('new-admin-username').value.trim();
        const newPassword = document.getElementById('new-admin-password').value;

        if (!newUsername || !newPassword) return;

        let admins = await getAdmins();
        if (admins.find(a => a.username === newUsername)) {
            alert('Username sudah digunakan! Silakan pilih yang lain.');
            return;
        }

        admins.push({ username: newUsername, password: newPassword });
        await saveAdmins(admins);
        
        formAddAdmin.reset();
        await renderAdminsAdmin();
        alert('Admin baru berhasil ditambahkan!');
    });
}

if (formChangePassword) {
    formChangePassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;

        let admins = await getAdmins();
        const userIndex = admins.findIndex(a => a.username === currentUsername);

        if (userIndex !== -1) {
            if (admins[userIndex].password !== oldPassword) {
                alert('Password lama salah!');
                return;
            }
            
            admins[userIndex].password = newPassword;
            await saveAdmins(admins);
            
            formChangePassword.reset();
            alert('Password berhasil diubah!');
        } else {
            alert('Terjadi kesalahan. Pengguna tidak ditemukan.');
        }
    });
}

window.deleteAdmin = async function(username) {
    if (username === currentUsername) {
        alert('Anda tidak bisa menghapus akun Anda sendiri.');
        return;
    }
    
    if (confirm(`Yakin ingin menghapus admin "${username}"?`)) {
        let admins = await getAdmins();
        admins = admins.filter(a => a.username !== username);
        await saveAdmins(admins);
        await renderAdminsAdmin();
    }
}

/* =========================================
   Pesan Masuk Management
   ========================================= */

async function updatePesanBadge() {
    const messages = await getMessages();
    const unread = messages.filter(m => !m.dibaca).length;
    const badge = document.getElementById('pesan-badge');
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

async function renderPesanAdmin() {
    const container = document.getElementById('pesan-list');
    if (!container) return;
    
    const messages = await getMessages();
    const hapusSemua = document.getElementById('btn-hapus-semua-pesan');
    const countLabel = document.getElementById('pesan-count-label');

    if (countLabel) {
        const unread = messages.filter(m => !m.dibaca).length;
        countLabel.textContent = messages.length > 0
            ? `(${messages.length} pesan, ${unread} belum dibaca)`
            : '';
    }

    if (hapusSemua) {
        hapusSemua.style.display = messages.length > 0 ? 'inline-flex' : 'none';
    }

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; color: #94a3b8;">
                <i class='bx bx-envelope-open' style="font-size: 4rem; margin-bottom: 16px; display: block;"></i>
                <p style="font-size: 1.1rem;">Belum ada pesan masuk.</p>
            </div>`;
        updatePesanBadge();
        return;
    }

    const sorted = [...messages].reverse();
    container.innerHTML = '';

    sorted.forEach(msg => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${msg.dibaca ? '#f8fafc' : '#f0fdf4'};
            border: 1px solid ${msg.dibaca ? '#e2e8f0' : '#bbf7d0'};
            border-left: 4px solid ${msg.dibaca ? '#cbd5e1' : '#059669'};
            border-radius: 10px;
            padding: 20px 24px;
            margin-bottom: 14px;
            transition: 0.2s;
        `;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; flex-wrap:wrap;">
                        ${!msg.dibaca ? '<span style="background:#059669;color:white;font-size:0.7rem;padding:2px 9px;border-radius:50px;font-weight:700;">BARU</span>' : ''}
                        <strong style="font-size:1rem; color:#0f172a;">${msg.nama}</strong>
                        <span style="color:#94a3b8; font-size:0.85rem;">&lt;${msg.email}&gt;</span>
                    </div>
                    <div style="font-size:1rem; font-weight:600; color:#1e293b; margin-bottom:6px;">
                        📋 ${msg.judul}
                    </div>
                    <div style="color:#475569; font-size:0.95rem; line-height:1.7; margin-bottom:10px; white-space:pre-wrap;">
                        ${msg.pesan}
                    </div>
                    <div style="font-size:0.82rem; color:#94a3b8;">
                        <i class='bx bx-time-five'></i> ${msg.tanggal}
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
                    ${!msg.dibaca ? `<button class="btn btn-success" onclick="tandaiBacaPesan(${msg.id})" style="font-size:0.82rem; padding:7px 14px;"><i class='bx bx-check'></i> Tandai Dibaca</button>` : ''}
                    <button class="btn btn-danger" onclick="hapusPesan(${msg.id})" style="font-size:0.82rem; padding:7px 14px;"><i class='bx bx-trash'></i> Hapus</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    updatePesanBadge();
}

window.tandaiBacaPesan = async function(id) {
    let messages = await getMessages();
    const idx = messages.findIndex(m => m.id === id);
    if (idx !== -1) {
        messages[idx].dibaca = true;
        await saveMessages(messages);
        await renderPesanAdmin();
    }
};

window.hapusPesan = async function(id) {
    if (confirm('Hapus pesan ini?')) {
        let messages = await getMessages();
        messages = messages.filter(m => m.id !== id);
        await saveMessages(messages);
        await renderPesanAdmin();
    }
};

window.hapusSemuaPesan = async function() {
    if (confirm('Hapus SEMUA pesan masuk? Tindakan ini tidak dapat dibatalkan.')) {
        await saveMessages([]);
        await renderPesanAdmin();
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfilAdmin();
    await renderUmkmAdmin();
    await renderAdminsAdmin();
    await updatePesanBadge();
});

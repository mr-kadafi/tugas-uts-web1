document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // CEK STATUS LOGIN
    // ==========================================

    const statusLogin = sessionStorage.getItem("isLogin");
    const userLogin = JSON.parse(
        sessionStorage.getItem("userLogin") || "null"
    );

    if (statusLogin !== "true" || !userLogin) {
        window.location.replace("index.html");
        return;
    }

    const KEY_KATALOG = "dataKatalogBukuBookstore";
    const katalogDefault = dataKatalogBuku.map(function (buku) {
        return Object.assign({}, buku);
    });

    function bacaKatalogTersimpan(nilai) {
        if (nilai === null) {
            return katalogDefault.map(function (buku) {
                return Object.assign({}, buku);
            });
        }

        const katalog = JSON.parse(nilai);
        if (!Array.isArray(katalog)) {
            throw new Error("Format data katalog tersimpan tidak valid.");
        }

        return katalog;
    }

    try {
        const katalogTersimpan = localStorage.getItem(KEY_KATALOG);
        if (katalogTersimpan !== null) {
            dataKatalogBuku = bacaKatalogTersimpan(katalogTersimpan);
        }
    } catch (error) {
        console.error("Gagal membaca data katalog untuk dashboard:", error);
    }

    // ==========================================
    // TEMA TERANG / GELAP
    // ==========================================

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = themeToggle.querySelector("i");
    const themeLabel = themeToggle.querySelector("span");

    function terapkanTema(tema) {
        const temaGelap = tema === "dark";

        document.body.dataset.theme = temaGelap ? "dark" : "light";
        themeToggle.setAttribute("aria-pressed", String(temaGelap));
        themeToggle.setAttribute(
            "aria-label",
            temaGelap ? "Aktifkan tema terang" : "Aktifkan tema gelap"
        );
        themeIcon.className = temaGelap
            ? "bi bi-sun-fill"
            : "bi bi-moon-stars-fill";
        themeLabel.textContent = temaGelap ? "Tema Terang" : "Tema Gelap";
    }

    let temaTersimpan = "light";
    try {
        temaTersimpan = localStorage.getItem("temaBookstore") || "light";
    } catch (error) {
        console.error("Gagal membaca preferensi tema:", error);
    }
    terapkanTema(temaTersimpan);

    themeToggle.addEventListener("click", function () {
        const temaBaru = document.body.dataset.theme === "dark" ? "light" : "dark";
        terapkanTema(temaBaru);

        try {
            localStorage.setItem("temaBookstore", temaBaru);
        } catch (error) {
            console.error("Gagal menyimpan preferensi tema:", error);
        }
    });

    // ==========================================
    // INFORMASI PENGGUNA
    // ==========================================

    document.getElementById("sidebarUserName").textContent = userLogin.nama;
    document.getElementById("navbarUserName").textContent = userLogin.nama;
    document.getElementById("sidebarUserRole").textContent = userLogin.role;

    // ==========================================
    // TANGGAL DAN WAKTU
    // ==========================================

    const tanggalSekarang = new Date();

    const formatTanggal = tanggalSekarang.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("currentDate").textContent = formatTanggal;


    function getSapaan() {
        const jam = new Date().getHours();

        if (jam >= 4 && jam < 11) {
            return "Selamat Pagi";
        } else if (jam >= 11 && jam < 15) {
            return "Selamat Siang";
        } else {
            return "Selamat Sore";
        }
    }

    // ==========================================
    // ELEMEN UTAMA
    // ==========================================

    const mainContent = document.getElementById("mainContent");
    const pageTitle = document.getElementById("pageTitle");
    const menuLinks = document.querySelectorAll(".menu-link[data-page]");

    // ==========================================
    // HALAMAN DASHBOARD
    // ==========================================

    function tampilkanDashboard() {

        const totalBuku = typeof dataKatalogBuku !== "undefined"
            ? dataKatalogBuku.length
            : 0;

        const totalStok = typeof dataKatalogBuku !== "undefined"
            ? dataKatalogBuku.reduce(function (total, buku) {
                return total + Number(buku.stok || 0);
            }, 0)
            : 0;

        const totalPengguna = typeof dataPengguna !== "undefined"
            ? dataPengguna.length
            : 0;

        mainContent.innerHTML = `

            <div class="page-heading">
                <h4>Dashboard</h4>
                <p>Ringkasan informasi dan aktivitas Bookstore.</p>
            </div>

            <div class="welcome-card">
                <div>
                    <h3>${getSapaan()}, ${userLogin.nama}!</h3>
                    <p>Selamat datang di Bookstore Management System. Kelola informasi buku dan pemesanan dengan mudah.</p>
                </div>
                <div class="welcome-icon">
                    <i class="bi bi-book-half"></i>
                </div>
            </div>

            <div class="row">

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Katalog Buku</span>
                            <h3>${totalBuku}</h3>
                        </div>
                        <div class="stat-icon green">
                            <i class="bi bi-book"></i>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Stok Buku</span>
                            <h3>${totalStok.toLocaleString("id-ID")}</h3>
                        </div>
                        <div class="stat-icon green">
                            <i class="bi bi-box-seam"></i>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Pengguna</span>
                            <h3>${totalPengguna}</h3>
                        </div>
                        <div class="stat-icon green">
                            <i class="bi bi-people"></i>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Status Sistem</span>
                            <h3 style="font-size: 19px;">Aktif</h3>
                        </div>
                        <div class="stat-icon green">
                            <i class="bi bi-check-circle"></i>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    window.addEventListener("storage", function (event) {
        if (event.key !== KEY_KATALOG) {
            return;
        }

        try {
            dataKatalogBuku = bacaKatalogTersimpan(event.newValue);
        } catch (error) {
            console.error("Gagal memperbarui katalog dashboard:", error);
            return;
        }

        const halamanAktif = window.location.hash.replace("#", "");
        if (!halamanAktif || halamanAktif === "dashboard") {
            tampilkanDashboard();
        }
    });

    // ==========================================
    // HALAMAN MENU LAIN
    // ==========================================



    async function tampilkanHalaman(page) {

        const halaman = {
            stok: {
                judul: "Informasi Stok/Katalog",
                file: "stok.html"
            },

            checkout: {
                judul: "Pemesanan",
                deskripsi: "Kelola data pemesanan buku, informasi pemesan, dan pembayaran.",
                file: "checkout.html"
            },

            tracking: {
                judul: "Informasi Pengiriman",
                deskripsi: "Lacak status pengiriman pesanan.",
                file: "tracking.html"
            },

            laporan: {
                judul: "Laporan Pemesanan",
                deskripsi: "Informasi laporan pemesanan buku.",
                icon: "bi-file-earmark-bar-graph"
            },

            transaksi: {
                judul: "History Transaksi",
                deskripsi: "Riwayat transaksi pemesanan buku.",
                icon: "bi-receipt"
            },

            profil: {
                judul: "Profil Saya",
                deskripsi: "Informasi akun pengguna yang sedang login.",
                icon: "bi-person-circle"
            }
        };

        // DASHBOARD
        if (page === "dashboard") {
            tampilkanDashboard();
            pageTitle.textContent = "Dashboard";
            return;
        }

        const dataHalaman = halaman[page];

        if (!dataHalaman) {
            tampilkanDashboard();
            return;
        }

        pageTitle.textContent = dataHalaman.judul;

        // ==========================================
        // HALAMAN STOK / KATALOG
        // ==========================================

        if (page === "stok") {

            mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-success"></div>
                <p class="text-muted mt-2">Memuat katalog buku...</p>
            </div>
        `;

            try {

                const response = await fetch(dataHalaman.file);

                if (!response.ok) {
                    throw new Error("Halaman katalog tidak ditemukan.");
                }

                const html = await response.text();

                mainContent.innerHTML = html;

                if (typeof initHalamanStok === "function") {
                    initHalamanStok();
                } else {
                    throw new Error("Fungsi initHalamanStok tidak ditemukan.");
                }

            } catch (error) {

                console.error("Gagal memuat katalog:", error);

                mainContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;

            }

            return;
        }

        // ==========================================
        // HALAMAN PEMESANAN / CHECKOUT
        // ==========================================

        if (page === "checkout") {

            mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-success"></div>
                <p class="text-muted mt-2">Memuat halaman pemesanan...</p>
            </div>
        `;

            try {

                const response = await fetch(dataHalaman.file);

                if (!response.ok) {
                    throw new Error("Halaman pemesanan tidak ditemukan.");
                }

                const html = await response.text();

                mainContent.innerHTML = html;

                if (typeof initHalamanCheckout === "function") {
                    initHalamanCheckout();
                } else {
                    throw new Error("Fungsi initHalamanCheckout tidak ditemukan.");
                }

            } catch (error) {

                console.error("Gagal memuat pemesanan:", error);

                mainContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;

            }

            return;
        }

        // ==========================================
        // HALAMAN TRACKING PENGIRIMAN
        // ==========================================

        if (page === "tracking") {

            mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-success"></div>
                <p class="text-muted mt-2">Memuat informasi pengiriman...</p>
            </div>
        `;

            try {

                const response = await fetch(dataHalaman.file);

                if (!response.ok) {
                    throw new Error("Halaman tracking tidak ditemukan.");
                }

                const html = await response.text();

                mainContent.innerHTML = html;

                if (typeof initHalamanTracking === "function") {
                    initHalamanTracking();
                } else {
                    throw new Error("Fungsi initHalamanTracking tidak ditemukan. Periksa js/tracking.js.");
                }

            } catch (error) {

                console.error("Gagal memuat tracking:", error);

                mainContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;

            }

            return;
        }

        // ==========================================
        // RIWAYAT TRANSAKSI
        // ==========================================

        if (page === "transaksi") {
            let daftarPesanan = [];

            try {
                const tersimpan = localStorage.getItem("dataPemesananBookstore");
                daftarPesanan = tersimpan ? JSON.parse(tersimpan) : [];
                if (!Array.isArray(daftarPesanan)) {
                    throw new Error("Format data pemesanan tidak valid.");
                }
            } catch (error) {
                console.error("Gagal membaca riwayat transaksi:", error);
                mainContent.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Riwayat transaksi tidak dapat dibaca. Periksa penyimpanan browser.
                    </div>
                `;
                return;
            }

            const totalNilai = daftarPesanan.reduce(function (total, pesanan) {
                return total + Number(pesanan.total || 0);
            }, 0);

            mainContent.innerHTML = `
                <div class="page-heading">
                    <h4>History Transaksi</h4>
                    <p>Riwayat seluruh pemesanan yang tersimpan di browser ini.</p>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="stat-card">
                            <div class="stat-info"><span>Total Transaksi</span><h3>${daftarPesanan.length}</h3></div>
                            <div class="stat-icon green"><i class="bi bi-receipt"></i></div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="stat-card">
                            <div class="stat-info"><span>Total Nilai Pemesanan</span><h3>${totalNilai.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</h3></div>
                            <div class="stat-icon green"><i class="bi bi-wallet2"></i></div>
                        </div>
                    </div>
                </div>
                <div class="content-card">
                    <div class="content-card-header"><h6><i class="bi bi-clock-history me-2 text-success"></i>Daftar Transaksi</h6></div>
                    <div class="content-card-body">
                        <div class="table-responsive">
                            <table class="table table-dashboard table-hover align-middle">
                                <thead><tr><th>Nomor DO</th><th>Tanggal</th><th>Pemesan</th><th>Buku</th><th>Total</th><th>Status</th></tr></thead>
                                <tbody id="tabelRiwayatTransaksi"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            const tabelRiwayat = document.getElementById("tabelRiwayatTransaksi");
            daftarPesanan.slice().reverse().forEach(function (pesanan) {
                const baris = document.createElement("tr");
                [
                    pesanan.nomorDO || pesanan.nomor || "-",
                    pesanan.tanggal || "-",
                    pesanan.nama || "-",
                    (pesanan.buku || "-") + " (" + (pesanan.jumlah || 0) + ")",
                    Number(pesanan.total || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }),
                    pesanan.status || "-"
                ].forEach(function (nilai) {
                    const kolom = document.createElement("td");
                    kolom.textContent = nilai;
                    baris.appendChild(kolom);
                });
                tabelRiwayat.appendChild(baris);
            });

            if (daftarPesanan.length === 0) {
                const barisKosong = document.createElement("tr");
                const kolomKosong = document.createElement("td");
                kolomKosong.colSpan = 6;
                kolomKosong.className = "text-center text-muted py-4";
                kolomKosong.textContent = "Belum ada transaksi. Buat pemesanan untuk melihat riwayatnya.";
                barisKosong.appendChild(kolomKosong);
                tabelRiwayat.appendChild(barisKosong);
            }

            return;
        }

        // ==========================================
        // LAPORAN PEMESANAN
        // ==========================================

        if (page === "laporan") {
            let daftarPesanan = [];

            try {
                const tersimpan = localStorage.getItem("dataPemesananBookstore");
                daftarPesanan = tersimpan ? JSON.parse(tersimpan) : [];
                if (!Array.isArray(daftarPesanan)) {
                    throw new Error("Format data pemesanan tidak valid.");
                }
            } catch (error) {
                console.error("Gagal membaca laporan pemesanan:", error);
                mainContent.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Laporan pemesanan tidak dapat dibaca. Periksa penyimpanan browser.
                    </div>
                `;
                return;
            }

            const totalNilai = daftarPesanan.reduce(function (total, pesanan) {
                return total + Number(pesanan.total || 0);
            }, 0);
            const jumlahLunas = daftarPesanan.filter(function (pesanan) {
                return pesanan.status === "Lunas";
            }).length;
            const jumlahMenunggu = daftarPesanan.filter(function (pesanan) {
                return pesanan.status === "Menunggu Pembayaran";
            }).length;

            mainContent.innerHTML = `
                <div class="page-heading">
                    <h4>Laporan Pemesanan</h4>
                    <p>Ringkasan transaksi berdasarkan data pemesanan di browser ini.</p>
                </div>
                <div class="row">
                    <div class="col-md-4"><div class="stat-card"><div class="stat-info"><span>Total Pesanan</span><h3>${daftarPesanan.length}</h3></div><div class="stat-icon green"><i class="bi bi-cart-check"></i></div></div></div>
                    <div class="col-md-4"><div class="stat-card"><div class="stat-info"><span>Menunggu Pembayaran</span><h3>${jumlahMenunggu}</h3></div><div class="stat-icon yellow"><i class="bi bi-clock-history"></i></div></div></div>
                    <div class="col-md-4"><div class="stat-card"><div class="stat-info"><span>Nilai Pesanan Lunas</span><h3>${daftarPesanan.filter(function (pesanan) { return pesanan.status === "Lunas"; }).reduce(function (total, pesanan) { return total + Number(pesanan.total || 0); }, 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</h3></div><div class="stat-icon green"><i class="bi bi-wallet2"></i></div></div></div>
                </div>
                <div class="content-card">
                    <div class="content-card-header"><h6><i class="bi bi-file-earmark-bar-graph me-2 text-success"></i>Ringkasan Nilai Pemesanan</h6></div>
                    <div class="content-card-body">
                        <p class="mb-1">Jumlah pesanan lunas: <strong>${jumlahLunas}</strong></p>
                        <p class="mb-1">Jumlah pesanan menunggu pembayaran: <strong>${jumlahMenunggu}</strong></p>
                        <p class="mb-0">Total seluruh nilai pesanan: <strong class="text-success">${totalNilai.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</strong></p>
                    </div>
                </div>
            `;
            return;
        }

        // ==========================================
        // HALAMAN PROFIL
        // ==========================================

        if (page === "profil") {

            mainContent.innerHTML = `
            <div class="page-heading">
                <h4>Profil Saya</h4>
                <p>Informasi akun pengguna yang sedang login.</p>
            </div>

            <div class="content-card">
                <div class="content-card-header">
                    <h6>Informasi Pengguna</h6>
                </div>

                <div class="content-card-body">

                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="user-avatar">
                            <i class="bi bi-person-fill"></i>
                        </div>

                        <div>
                            <h6 class="mb-1">${userLogin.nama}</h6>
                            <span class="text-muted small">${userLogin.role}</span>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3 text-muted">ID Pengguna</div>
                        <div class="col-md-9">${userLogin.id}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3 text-muted">Nama Lengkap</div>
                        <div class="col-md-9">${userLogin.nama}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3 text-muted">Email</div>
                        <div class="col-md-9">${userLogin.email}</div>
                    </div>

                    <div class="row">
                        <div class="col-md-3 text-muted">Role</div>
                        <div class="col-md-9">${userLogin.role}</div>
                    </div>

                </div>
            </div>
        `;

            return;
        }

        // ==========================================
        // HALAMAN YANG BELUM DIKEMBANGKAN
        // ==========================================

        mainContent.innerHTML = `
        <div class="page-heading">
            <h4>${dataHalaman.judul}</h4>
            <p>${dataHalaman.deskripsi}</p>
        </div>

        <div class="content-card">
            <div class="content-card-body text-center py-5">
                <i class="bi ${dataHalaman.icon} text-success"
                   style="font-size: 45px;"></i>

                <h5 class="mt-3 mb-2">${dataHalaman.judul}</h5>

                <p class="text-muted mb-0">
                    Halaman ini akan dikembangkan pada tahap berikutnya.
                </p>
            </div>
        </div>
    `;
    }


    // ==========================================
    // NAVIGASI TANPA RELOAD
    // ==========================================

    function bukaHalaman(page) {

        tampilkanHalaman(page);

        // Atur menu aktif pada sidebar.
        menuLinks.forEach(function (link) {
            link.classList.toggle(
                "active",
                link.dataset.page === page
            );
        });

        // Simpan halaman pada URL hash.
        // Perubahan hash tidak memuat ulang seluruh halaman.
        if (window.location.hash !== "#" + page) {
            history.replaceState(null, "", "#" + page);
        }

        // Tutup sidebar otomatis di perangkat mobile.
        document.querySelector(".app-wrapper")
            .classList.remove("mobile-sidebar-open");
    }

    // Event delegation agar menu yang dibuat secara dinamis tetap berfungsi.
    document.addEventListener("click", function (event) {

        const link = event.target.closest("[data-page]");

        if (!link) {
            return;
        }

        event.preventDefault();

        const page = link.dataset.page;
        bukaHalaman(page);
    });

    // ==========================================
    // SIDEBAR TOGGLE
    // ==========================================

    const sidebarToggle = document.getElementById("sidebarToggle");
    const appWrapper = document.querySelector(".app-wrapper");

    sidebarToggle.addEventListener("click", function () {

        if (window.innerWidth <= 768) {
            appWrapper.classList.toggle("mobile-sidebar-open");
        } else {
            appWrapper.classList.toggle("sidebar-collapsed");
        }

    });

    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function () {

        Swal.fire({
            icon: "question",
            title: "Logout?",
            text: "Apakah Anda yakin ingin keluar dari aplikasi?",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
            cancelButtonText: "Batal",
            confirmButtonColor: "#198754",
            cancelButtonColor: "#6c757d"
        }).then(function (result) {

            if (result.isConfirmed) {
                sessionStorage.removeItem("isLogin");
                sessionStorage.removeItem("userLogin");

                window.location.replace("index.html");
            }

        });

    });

    // ==========================================
    // TAMPILKAN HALAMAN PERTAMA
    // ==========================================

    const halamanAwal = window.location.hash.replace("#", "");

    if (halamanAwal) {
        bukaHalaman(halamanAwal);
    } else {
        bukaHalaman("dashboard");
    }

});

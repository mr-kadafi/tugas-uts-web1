document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // PENYIMPANAN DATA PENGGUNA
    // ==========================================

    const KEY_PENGGUNA = "dataPenggunaBookstore";

    // Ambil data pengguna dari localStorage.
    // Jika belum ada, gunakan data awal dari data.js.
    let penggunaTersimpan = localStorage.getItem(KEY_PENGGUNA);

    if (penggunaTersimpan) {
        try {
            dataPengguna = JSON.parse(penggunaTersimpan);
        } catch (error) {
            console.error("Data pengguna tidak valid:", error);
            localStorage.removeItem(KEY_PENGGUNA);
        }
    }

    // Simpan data pengguna ke localStorage.
    function simpanDataPengguna() {
        localStorage.setItem(
            KEY_PENGGUNA,
            JSON.stringify(dataPengguna)
        );
    }

    // ==========================================
    // FUNGSI BANTU
    // ==========================================

    function validasiEmail(email) {
        const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return polaEmail.test(email);
    }

    function tampilkanError(pesan) {
        Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: pesan,
            confirmButtonColor: "#198754"
        });
    }

    function tampilkanSukses(pesan) {
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: pesan,
            confirmButtonColor: "#198754"
        });
    }

    function tutupModal(idModal) {
        const modalElement = document.getElementById(idModal);

        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }
        }
    }

    // ==========================================
    // LOGIN
    // ==========================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                tampilkanError("Email dan password wajib diisi.");
                return;
            }

            if (!validasiEmail(email)) {
                tampilkanError("Format email tidak valid.");
                return;
            }

            const pengguna = dataPengguna.find(function (user) {
                return user.email.toLowerCase() === email.toLowerCase()
                    && user.password === password;
            });

            if (!pengguna) {
                tampilkanError(
                    "Email/password yang anda masukkan salah."
                );
                return;
            }

            // Simpan status login dan informasi pengguna.
            sessionStorage.setItem("isLogin", "true");

            sessionStorage.setItem(
                "userLogin",
                JSON.stringify({
                    id: pengguna.id,
                    nama: pengguna.nama,
                    email: pengguna.email,
                    role: pengguna.role
                })
            );

            // Notifikasi sukses dan langsung pindah halaman.
            Swal.fire({
                icon: "success",
                title: "Login Berhasil!",
                text: "Selamat datang, " + pengguna.nama + ".",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(function () {
                window.location.href = "dashboard.html";
            });
        });
    }

    // ==========================================
    // TAMPIL / SEMBUNYIKAN PASSWORD
    // ==========================================

    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const passwordInput = document.getElementById("password");
            const passwordIcon = document.getElementById("passwordIcon");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                passwordIcon.classList.replace("bi-eye", "bi-eye-slash");
            } else {
                passwordInput.type = "password";
                passwordIcon.classList.replace("bi-eye-slash", "bi-eye");
            }
        });
    }

    // ==========================================
    // LUPA PASSWORD
    // ==========================================

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("forgotEmail").value.trim();
            const password = document.getElementById("newPassword").value;
            const confirmPassword =
                document.getElementById("confirmPassword").value;

            if (!email || !password || !confirmPassword) {
                tampilkanError("Semua kolom wajib diisi.");
                return;
            }

            if (!validasiEmail(email)) {
                tampilkanError("Format email tidak valid.");
                return;
            }

            const pengguna = dataPengguna.find(function (user) {
                return user.email.toLowerCase() === email.toLowerCase();
            });

            if (!pengguna) {
                tampilkanError("Email tidak ditemukan.");
                return;
            }

            if (password.length < 6) {
                tampilkanError("Password minimal terdiri dari 6 karakter.");
                return;
            }

            if (password !== confirmPassword) {
                tampilkanError("Konfirmasi password tidak sesuai.");
                return;
            }

            // Ubah password dan simpan secara permanen di browser.
            pengguna.password = password;
            simpanDataPengguna();

            tutupModal("forgotPasswordModal");
            forgotPasswordForm.reset();

            tampilkanSukses(
                "Password berhasil diperbarui. Silakan login kembali."
            );
        });
    }

    // ==========================================
    // DAFTAR AKUN
    // ==========================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const nama = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password =
                document.getElementById("registerPassword").value;
            const confirmPassword =
                document.getElementById("registerConfirmPassword").value;

            if (!nama || !email || !password || !confirmPassword) {
                tampilkanError("Semua kolom wajib diisi.");
                return;
            }

            if (nama.length < 3) {
                tampilkanError("Nama minimal terdiri dari 3 karakter.");
                return;
            }

            if (!validasiEmail(email)) {
                tampilkanError("Format email tidak valid.");
                return;
            }

            const emailSudahAda = dataPengguna.some(function (user) {
                return user.email.toLowerCase() === email.toLowerCase();
            });

            if (emailSudahAda) {
                tampilkanError("Email sudah terdaftar.");
                return;
            }

            if (password.length < 6) {
                tampilkanError("Password minimal terdiri dari 6 karakter.");
                return;
            }

            if (password !== confirmPassword) {
                tampilkanError("Konfirmasi password tidak sesuai.");
                return;
            }

            // Buat akun baru.
            const idBaru = dataPengguna.length > 0
                ? Math.max(...dataPengguna.map(user => Number(user.id))) + 1
                : 1;

            const penggunaBaru = {
                id: idBaru,
                nama: nama,
                email: email,
                password: password,
                role: "User"
            };

            // Masukkan ke array dan simpan ke localStorage.
            dataPengguna.push(penggunaBaru);
            simpanDataPengguna();

            tutupModal("registerModal");
            registerForm.reset();

            Swal.fire({
                icon: "success",
                title: "Pendaftaran Berhasil!",
                text: "Akun berhasil dibuat. Silakan login menggunakan akun baru.",
                confirmButtonColor: "#198754"
            }).then(function () {
                // Isi email secara otomatis pada halaman login.
                document.getElementById("email").value = email;
                document.getElementById("password").focus();
            });
        });
    }

    // ==========================================
    // RESET FORM KETIKA MODAL DITUTUP
    // ==========================================

    const forgotModal = document.getElementById("forgotPasswordModal");

    if (forgotModal) {
        forgotModal.addEventListener("hidden.bs.modal", function () {
            if (forgotPasswordForm) {
                forgotPasswordForm.reset();
            }
        });
    }

    const registerModal = document.getElementById("registerModal");

    if (registerModal) {
        registerModal.addEventListener("hidden.bs.modal", function () {
            if (registerForm) {
                registerForm.reset();
            }
        });
    }

    // ==========================================
    // RIWAYAT TRANSAKSI STANDALONE
    // ==========================================

    const historyBody = document.getElementById("historyBody");

    if (historyBody) {
        const userLogin = JSON.parse(sessionStorage.getItem("userLogin") || "null");

        if (sessionStorage.getItem("isLogin") !== "true" || !userLogin) {
            window.location.replace("index.html");
            return;
        }

        const userName = document.getElementById("userName");
        const userRole = document.getElementById("userRole");
        const userInitial = document.getElementById("userInitial");

        userName.textContent = userLogin.nama;
        userRole.textContent = userLogin.role;
        userInitial.textContent = userLogin.nama.charAt(0).toUpperCase();

        let daftarPesanan = [];
        let dataTrackingTersimpan = {};

        try {
            const pesananTersimpan = localStorage.getItem("dataPemesananBookstore");
            daftarPesanan = pesananTersimpan ? JSON.parse(pesananTersimpan) : [];
            if (!Array.isArray(daftarPesanan)) {
                throw new Error("Format data pemesanan tidak valid.");
            }

            const trackingTersimpan = localStorage.getItem("dataTrackingBookstore");
            dataTrackingTersimpan = trackingTersimpan
                ? JSON.parse(trackingTersimpan)
                : {};
        } catch (error) {
            console.error("Gagal membaca data riwayat:", error);
            document.getElementById("historyEmpty").textContent =
                "Riwayat transaksi tidak dapat dibaca dari penyimpanan browser.";
            document.getElementById("historyEmpty").classList.remove("d-none");
            return;
        }

        const formatRupiah = function (nilai) {
            return Number(nilai || 0).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            });
        };
        const totalNilai = daftarPesanan.reduce(function (total, pesanan) {
            return total + Number(pesanan.total || 0);
        }, 0);

        document.getElementById("historyCount").textContent = daftarPesanan.length;
        document.getElementById("historyValue").textContent = formatRupiah(totalNilai);

        daftarPesanan.slice().reverse().forEach(function (pesanan) {
            const tracking = dataTrackingTersimpan[pesanan.nomorDO] || {};
            const baris = document.createElement("tr");
            const nilaiKolom = [
                pesanan.nomorDO || pesanan.nomor || "-",
                pesanan.tanggal || "-",
                pesanan.nama || "-",
                tracking.ekspedisi || "-",
                formatRupiah(pesanan.total),
                pesanan.status || "-"
            ];

            nilaiKolom.forEach(function (nilai, index) {
                const kolom = document.createElement("td");
                kolom.textContent = nilai;
                if (index === 5) {
                    const badge = document.createElement("span");
                    badge.className = "status-badge " +
                        (pesanan.status === "Lunas" ? "status-success" : "status-warning");
                    badge.textContent = nilai;
                    kolom.textContent = "";
                    kolom.appendChild(badge);
                }
                baris.appendChild(kolom);
            });

            historyBody.appendChild(baris);
        });

        document.getElementById("historyEmpty").classList.toggle(
            "d-none",
            daftarPesanan.length > 0
        );

        const logoutLink = document.querySelector("[data-logout]");
        if (logoutLink) {
            logoutLink.addEventListener("click", function (event) {
                event.preventDefault();
                if (window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
                    sessionStorage.removeItem("isLogin");
                    sessionStorage.removeItem("userLogin");
                    window.location.replace("index.html");
                }
            });
        }
    }

});

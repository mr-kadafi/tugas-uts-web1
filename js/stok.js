function initHalamanStok() {

    // ==========================================
    // ELEMEN HALAMAN
    // ==========================================

    const tabelKatalog = document.getElementById("tabelKatalogBuku");
    const formTambah = document.getElementById("formTambahBuku");
    const tombolTambah = document.getElementById("btnTambahBuku");
    const inputSearch = document.getElementById("searchBuku");

    if (!tabelKatalog || !formTambah) {
        console.error("Elemen halaman katalog tidak ditemukan.");
        return;
    }
    // ==========================================
    // AMBIL DATA BUKU DARI LOCAL STORAGE
    // ==========================================

    const dataTersimpan = localStorage.getItem("dataKatalogBukuBookstore");

    if (dataTersimpan) {
        try {
            const dataBuku = JSON.parse(dataTersimpan);

            if (Array.isArray(dataBuku)) {
                dataKatalogBuku = dataBuku;
            }
        } catch (error) {
            console.error("Gagal membaca data buku:", error);
        }
    }

    // ==========================================
    // FORMAT RUPIAH
    // ==========================================

    function formatRupiah(angka) {
        return Number(angka).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        });
    }

    // ==========================================
    // FORMAT PATH COVER
    // Gambar disimpan langsung di folder img/
    // ==========================================

    function getCoverPath(cover) {

        if (!cover) {
            return "";
        }

        return cover.replace(/^assets\/img\//, "img/").replace(/\.JPG$/i, ".jpg");
    }

    // ==========================================
    // TAMPILKAN DATA BUKU
    // ==========================================

    function tampilkanDataBuku(data) {

        tabelKatalog.innerHTML = "";

        if (data.length === 0) {
            const barisKosong = document.createElement("tr");
            const kolomKosong = document.createElement("td");

            kolomKosong.colSpan = 8;
            kolomKosong.className = "text-center text-muted py-4";
            kolomKosong.textContent = "Data buku tidak ditemukan.";

            barisKosong.appendChild(kolomKosong);
            tabelKatalog.appendChild(barisKosong);

            document.getElementById("jumlahDataBuku").textContent =
                "Menampilkan 0 data buku.";

            return;
        }

        data.forEach(function (buku, index) {

            const baris = document.createElement("tr");

            // Nomor
            const kolomNo = document.createElement("td");
            kolomNo.textContent = index + 1;

            // Cover
            const kolomCover = document.createElement("td");
            const gambar = document.createElement("img");

            gambar.src = getCoverPath(buku.cover);
            gambar.alt = buku.namaBarang;
            gambar.className = "book-cover";

            gambar.onerror = function () {
                kolomCover.textContent = "No Cover";
                kolomCover.className = "text-muted small";
            };

            kolomCover.appendChild(gambar);

            // Kode buku
            const kolomKode = document.createElement("td");
            kolomKode.textContent = buku.kodeBarang;

            // Judul buku
            const kolomJudul = document.createElement("td");
            kolomJudul.textContent = buku.namaBarang;

            // Kategori
            const kolomKategori = document.createElement("td");
            kolomKategori.textContent = buku.jenisBarang || "-";

            // Edisi
            const kolomEdisi = document.createElement("td");
            kolomEdisi.textContent = buku.edisi;

            // Stok
            const kolomStok = document.createElement("td");
            const badgeStok = document.createElement("span");
            const jumlahStok = Number(buku.stok);

            badgeStok.className = jumlahStok <= 20
                ? "status-badge status-danger"
                : "status-badge status-success";

            badgeStok.textContent = jumlahStok.toLocaleString("id-ID");

            kolomStok.appendChild(badgeStok);

            // Harga
            const kolomHarga = document.createElement("td");

            kolomHarga.textContent =
                typeof buku.harga === "number"
                    ? formatRupiah(buku.harga)
                    : buku.harga;

            // Gabungkan semua kolom
            baris.append(
                kolomNo,
                kolomCover,
                kolomKode,
                kolomJudul,
                kolomKategori,
                kolomEdisi,
                kolomStok,
                kolomHarga
            );

            tabelKatalog.appendChild(baris);

        });

        document.getElementById("jumlahDataBuku").textContent =
            "Menampilkan " + data.length + " data buku.";
    }

    // ==========================================
    // RINGKASAN DATA STOK
    // ==========================================

    function perbaruiRingkasan() {

        const totalJenis = dataKatalogBuku.length;

        const totalStok = dataKatalogBuku.reduce(function (total, buku) {
            return total + Number(buku.stok || 0);
        }, 0);

        const jumlahStokMenipis = dataKatalogBuku.filter(function (buku) {
            return Number(buku.stok || 0) <= 20;
        }).length;

        document.getElementById("totalJenisBuku").textContent =
            totalJenis;

        document.getElementById("totalStokBuku").textContent =
            totalStok.toLocaleString("id-ID");

        document.getElementById("stokMenipis").textContent =
            jumlahStokMenipis;
    }

    // ==========================================
    // PENCARIAN BUKU
    // ==========================================

    if (inputSearch) {

        inputSearch.addEventListener("input", function () {

            const kataKunci = this.value.toLowerCase().trim();

            const hasilPencarian = dataKatalogBuku.filter(function (buku) {

                return buku.kodeBarang.toLowerCase().includes(kataKunci) ||
                    buku.namaBarang.toLowerCase().includes(kataKunci);

            });

            tampilkanDataBuku(hasilPencarian);

        });

    }

    // ==========================================
    // BUKA MODAL TAMBAH BUKU
    // ==========================================

    if (tombolTambah) {

        tombolTambah.addEventListener("click", function () {

            const modalElement = document.getElementById("modalTambahBuku");

            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

            modal.show();

        });

    }

    // ==========================================
    // TAMBAH DATA BUKU
    // ==========================================

    formTambah.addEventListener("submit", function (event) {

        event.preventDefault();

        const kode = document.getElementById("kodeBuku").value.trim();
        const judul = document.getElementById("judulBuku").value.trim();
        const kategori = document.getElementById("kategoriBuku").value;
        const edisi = document.getElementById("edisiBuku").value.trim();
        const stok = Number(document.getElementById("jumlahStok").value);
        const harga = Number(document.getElementById("hargaBuku").value);
        const namaCover = document.getElementById("coverBuku").value.trim();

        // Validasi input
        if (!kode || !judul || !kategori || !edisi) {
            Swal.fire({
                icon: "warning",
                title: "Data Belum Lengkap",
                text: "Silakan lengkapi seluruh data buku.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Validasi kode buku
        const kodeSudahAda = dataKatalogBuku.some(function (buku) {
            return buku.kodeBarang.toLowerCase() === kode.toLowerCase();
        });

        if (kodeSudahAda) {
            Swal.fire({
                icon: "warning",
                title: "Kode Buku Sudah Ada",
                text: "Gunakan kode buku yang berbeda.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Validasi stok dan harga
        if (!Number.isFinite(stok) || !Number.isFinite(harga) || stok < 0 || harga < 0) {
            Swal.fire({
                icon: "warning",
                title: "Data Tidak Valid",
                text: "Stok dan harga harus berupa angka positif atau nol.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Buat objek buku baru dengan struktur data.js
        const bukuBaru = {
            kodeBarang: kode,
            namaBarang: judul,
            jenisBarang: kategori,
            edisi: edisi,
            stok: stok,
            harga: harga,
            cover: namaCover ? "img/" + namaCover : ""
        };

        // Masukkan data ke array
        dataKatalogBuku.push(bukuBaru);

        // Simpan data buku ke localStorage
        localStorage.setItem(
            "dataKatalogBukuBookstore",
            JSON.stringify(dataKatalogBuku)
        );

        // Tampilkan ulang seluruh tabel
        tampilkanDataBuku(dataKatalogBuku);

        // Perbarui ringkasan
        perbaruiRingkasan();

        // Reset pencarian
        if (inputSearch) {
            inputSearch.value = "";
        }

        // Tutup modal
        const modalElement = document.getElementById("modalTambahBuku");
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        modal.hide();

        // Reset form
        formTambah.reset();

        // Notifikasi berhasil
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data buku berhasil ditambahkan.",
            confirmButtonColor: "#198754"
        });

    });

    // ==========================================
    // TAMPILKAN DATA AWAL
    // ==========================================

    tampilkanDataBuku(dataKatalogBuku);
    perbaruiRingkasan();

}
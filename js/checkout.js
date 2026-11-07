function initHalamanCheckout() {

    const tabelPemesanan = document.getElementById("tabelPemesanan");
    const formPemesanan = document.getElementById("formPemesanan");

    if (!tabelPemesanan || !formPemesanan) {
        return;
    }

    // ==========================================
    // DATA PEMESANAN
    // ==========================================

    const KEY_PEMESANAN = "dataPemesananBookstore";

    let dataPemesanan = [];

    try {
        const dataTersimpan = localStorage.getItem(KEY_PEMESANAN);
        dataPemesanan = dataTersimpan ? JSON.parse(dataTersimpan) : [];

        if (!Array.isArray(dataPemesanan)) {
            dataPemesanan = [];
        }
    } catch (error) {
        console.error("Gagal membaca data pemesanan:", error);
        dataPemesanan = [];
    }

    try {
        const trackingTersimpan = localStorage.getItem("dataTrackingBookstore");
        if (trackingTersimpan) {
            const trackingParsed = JSON.parse(trackingTersimpan);
            if (!trackingParsed || typeof trackingParsed !== "object" || Array.isArray(trackingParsed)) {
                throw new Error("Format data tracking tidak valid.");
            }
            dataTracking = Object.assign({}, dataTracking, trackingParsed);
        }
    } catch (error) {
        console.error("Gagal membaca data tracking tersimpan:", error);
    }

    // Ambil katalog yang mungkin sudah tersimpan
    const katalogTersimpan = localStorage.getItem("dataKatalogBukuBookstore");

    if (katalogTersimpan) {
        try {
            const dataKatalog = JSON.parse(katalogTersimpan);

            if (Array.isArray(dataKatalog)) {
                dataKatalogBuku = dataKatalog;
            }
        } catch (error) {
            console.error("Gagal membaca katalog:", error);
        }
    }

    // ==========================================
    // ELEMEN
    // ==========================================

    const modalElement = document.getElementById("modalPemesanan");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const selectBuku = document.getElementById("bukuPesanan");
    const inputJumlah = document.getElementById("jumlahPesanan");
    const inputHarga = document.getElementById("hargaSatuan");
    const inputTotal = document.getElementById("totalPembayaran");
    const inputSearch = document.getElementById("searchPemesanan");

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

    function angkaHarga(harga) {
        if (typeof harga === "number") {
            return harga;
        }

        return Number(String(harga || "0").replace(/[^0-9]/g, ""));
    }

    // ==========================================
    // SIMPAN DATA
    // ==========================================

    function simpanData() {
        localStorage.setItem(KEY_PEMESANAN, JSON.stringify(dataPemesanan));
    }

    // ==========================================
    // DROPDOWN BUKU
    // ==========================================

    function isiPilihanBuku() {

        selectBuku.innerHTML = '<option value="">-- Pilih Buku --</option>';

        dataKatalogBuku.forEach(function (buku) {

            const kode = buku.kodeBarang || buku.kode;
            const nama = buku.namaBarang || buku.judul;

            const option = document.createElement("option");

            option.value = kode;
            option.textContent = kode + " - " + nama;

            selectBuku.appendChild(option);

        });

    }

    // ==========================================
    // CARI BUKU BERDASARKAN KODE
    // ==========================================

    function cariBuku(kode) {
        return dataKatalogBuku.find(function (buku) {
            return (buku.kodeBarang || buku.kode) === kode;
        });
    }

    // ==========================================
    // HITUNG TOTAL PEMBAYARAN
    // ==========================================

    function hitungTotal() {

        const buku = cariBuku(selectBuku.value);
        const jumlah = Number(inputJumlah.value) || 0;

        if (!buku) {
            inputHarga.value = "";
            inputTotal.value = "";
            return;
        }

        const harga = angkaHarga(buku.harga);

        inputHarga.value = formatRupiah(harga);
        inputTotal.value = formatRupiah(harga * jumlah);

    }

    selectBuku.addEventListener("change", hitungTotal);
    inputJumlah.addEventListener("input", hitungTotal);

    // ==========================================
    // RINGKASAN PEMESANAN
    // ==========================================

    function perbaruiRingkasan() {

        document.getElementById("totalPemesanan").textContent =
            dataPemesanan.length;

        document.getElementById("menungguPembayaran").textContent =
            dataPemesanan.filter(function (pesanan) {
                return pesanan.status === "Menunggu Pembayaran";
            }).length;

        document.getElementById("pemesananLunas").textContent =
            dataPemesanan.filter(function (pesanan) {
                return pesanan.status === "Lunas";
            }).length;

    }

    // ==========================================
    // TAMPILKAN DATA PEMESANAN
    // ==========================================

    function tampilkanPemesanan(data) {

        tabelPemesanan.innerHTML = "";

        if (data.length === 0) {

            const baris = document.createElement("tr");
            const kolom = document.createElement("td");

            kolom.colSpan = 9;
            kolom.className = "text-center text-muted py-4";
            kolom.textContent = "Belum ada data pemesanan.";

            baris.appendChild(kolom);
            tabelPemesanan.appendChild(baris);

        } else {

            data.forEach(function (pesanan, index) {

                const baris = document.createElement("tr");

                const isiKolom = [
                    index + 1,
                    pesanan.nomor,
                    pesanan.nama,
                    pesanan.buku,
                    pesanan.jumlah,
                    formatRupiah(pesanan.total),
                    pesanan.metode
                ];

                isiKolom.forEach(function (isi) {

                    const kolom = document.createElement("td");
                    kolom.textContent = isi;
                    baris.appendChild(kolom);

                });

                // Status pembayaran
                const kolomStatus = document.createElement("td");
                const badge = document.createElement("span");

                badge.className = pesanan.status === "Lunas"
                    ? "status-badge status-success"
                    : "status-badge status-danger";

                badge.textContent = pesanan.status;

                kolomStatus.appendChild(badge);
                baris.appendChild(kolomStatus);

                // Tombol aksi
                const kolomAksi = document.createElement("td");

                const tombolEdit = document.createElement("button");
                tombolEdit.type = "button";
                tombolEdit.className = "btn btn-sm btn-outline-success";
                tombolEdit.innerHTML = '<i class="bi bi-pencil-square"></i>';
                tombolEdit.title = "Ubah pemesanan";

                tombolEdit.addEventListener("click", function () {
                    bukaEditPemesanan(pesanan.id);
                });

                kolomAksi.appendChild(tombolEdit);
                baris.appendChild(kolomAksi);

                tabelPemesanan.appendChild(baris);

            });

        }

        document.getElementById("jumlahDataPemesanan").textContent =
            "Menampilkan " + data.length + " data pemesanan.";

        perbaruiRingkasan();

    }

    // ==========================================
    // BUKA MODAL TAMBAH
    // ==========================================

    document.getElementById("btnTambahPemesanan").addEventListener("click", function () {

        formPemesanan.reset();

        document.getElementById("idPemesanan").value = "";
        document.getElementById("judulModalPemesanan").innerHTML =
            '<i class="bi bi-cart-plus text-success me-2"></i>Tambah Pemesanan';

        inputJumlah.value = 1;

        isiPilihanBuku();
        hitungTotal();

        modal.show();

    });

    // ==========================================
    // BUKA MODAL EDIT
    // ==========================================

    function bukaEditPemesanan(id) {

        const pesanan = dataPemesanan.find(function (item) {
            return item.id === id;
        });

        if (!pesanan) {
            return;
        }

        formPemesanan.reset();
        isiPilihanBuku();

        document.getElementById("idPemesanan").value = pesanan.id;
        document.getElementById("namaPemesan").value = pesanan.nama;
        document.getElementById("emailPemesan").value = pesanan.email;
        document.getElementById("teleponPemesan").value = pesanan.telepon;
        document.getElementById("alamatPemesan").value = pesanan.alamat;
        selectBuku.value = pesanan.kodeBuku;
        inputJumlah.value = pesanan.jumlah;
        document.getElementById("metodePembayaran").value = pesanan.metode;
        document.getElementById("statusPembayaran").value = pesanan.status;

        document.getElementById("judulModalPemesanan").innerHTML =
            '<i class="bi bi-pencil-square text-success me-2"></i>Ubah Pemesanan';

        hitungTotal();
        modal.show();

    }

    // ==========================================
    // SIMPAN / UBAH PEMESANAN
    // ==========================================

    formPemesanan.addEventListener("submit", function (event) {

        event.preventDefault();

        const id = document.getElementById("idPemesanan").value;
        const kodeBuku = selectBuku.value;
        const buku = cariBuku(kodeBuku);

        if (!buku) {
            Swal.fire({
                icon: "warning",
                title: "Buku Belum Dipilih",
                text: "Silakan pilih buku terlebih dahulu.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        const jumlah = Number(inputJumlah.value);

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            Swal.fire({
                icon: "warning",
                title: "Jumlah Tidak Valid",
                text: "Jumlah pesanan minimal 1 buku.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        const stokBuku = Number(buku.stok || 0);

        if (jumlah > stokBuku) {
            Swal.fire({
                icon: "warning",
                title: "Stok Tidak Mencukupi",
                text: "Jumlah pesanan melebihi stok buku yang tersedia.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        const harga = angkaHarga(buku.harga);
        const pesananLama = id
            ? dataPemesanan.find(function (item) {
                return item.id === id;
            })
            : null;
        const nomorDO = pesananLama && pesananLama.nomorDO
            ? pesananLama.nomorDO
            : "DO-" + Date.now();
        const tanggalSekarang = new Date();
        const tanggalKirim = [
            tanggalSekarang.getFullYear(),
            String(tanggalSekarang.getMonth() + 1).padStart(2, "0"),
            String(tanggalSekarang.getDate()).padStart(2, "0")
        ].join("-");

        const dataBaru = {
            id: id || "PSN" + Date.now(),
            nomor: id
                ? dataPemesanan.find(function (item) {
                    return item.id === id;
                }).nomor
                : "ORD-" + Date.now(),
            nomorDO: nomorDO,
            tanggal: tanggalKirim,

            nama: document.getElementById("namaPemesan").value.trim(),
            email: document.getElementById("emailPemesan").value.trim(),
            telepon: document.getElementById("teleponPemesan").value.trim(),
            alamat: document.getElementById("alamatPemesan").value.trim(),

            kodeBuku: kodeBuku,
            buku: buku.namaBarang || buku.judul,
            jumlah: jumlah,
            harga: harga,
            total: harga * jumlah,

            metode: document.getElementById("metodePembayaran").value,
            status: document.getElementById("statusPembayaran").value
        };

        const waktuPeristiwa = [
            tanggalKirim,
            String(tanggalSekarang.getHours()).padStart(2, "0") + ":" +
            String(tanggalSekarang.getMinutes()).padStart(2, "0") + ":" +
            String(tanggalSekarang.getSeconds()).padStart(2, "0")
        ].join(" ");
        const trackingLama = dataTracking[nomorDO];

        dataTracking[nomorDO] = {
            nomorDO: nomorDO,
            nama: dataBaru.nama,
            status: trackingLama ? trackingLama.status : "Diproses",
            ekspedisi: trackingLama ? trackingLama.ekspedisi : "JNE",
            tanggalKirim: trackingLama ? trackingLama.tanggalKirim : tanggalKirim,
            paket: trackingLama ? trackingLama.paket : "REG",
            total: formatRupiah(dataBaru.total),
            perjalanan: trackingLama
                ? trackingLama.perjalanan
                : [{
                    waktu: waktuPeristiwa,
                    keterangan: "Pesanan dibuat dan sedang diproses."
                }]
        };

        if (id) {

            const index = dataPemesanan.findIndex(function (item) {
                return item.id === id;
            });

            if (index !== -1) {
                dataPemesanan[index] = dataBaru;
            }

        } else {

            dataPemesanan.push(dataBaru);

        }

        simpanData();
        localStorage.setItem("dataTrackingBookstore", JSON.stringify(dataTracking));
        tampilkanPemesanan(dataPemesanan);

        modal.hide();
        formPemesanan.reset();

        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: id
                ? "Data pemesanan berhasil diperbarui."
                : "Pemesanan berhasil ditambahkan.",
            timer: 1500,
            showConfirmButton: false
        });

    });

    // ==========================================
    // PENCARIAN PEMESANAN
    // ==========================================

    inputSearch.addEventListener("input", function () {

        const kataKunci = this.value.toLowerCase().trim();

        const hasil = dataPemesanan.filter(function (pesanan) {

            return pesanan.nomor.toLowerCase().includes(kataKunci) ||
                pesanan.nama.toLowerCase().includes(kataKunci) ||
                pesanan.buku.toLowerCase().includes(kataKunci);

        });

        tampilkanPemesanan(hasil);

    });

    // ==========================================
    // TAMPILKAN DATA AWAL
    // ==========================================

    isiPilihanBuku();
    tampilkanPemesanan(dataPemesanan);

}
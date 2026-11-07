/* ==========================================
   HALAMAN INFORMASI PENGIRIMAN / TRACKING
========================================== */

function initHalamanTracking() {

    const formTracking = document.getElementById("formTracking");
    const inputNomorDO = document.getElementById("nomorDO");
    const hasilTracking = document.getElementById("hasilTracking");
    const pesanTracking = document.getElementById("pesanTracking");

    // Pastikan elemen halaman tersedia
    if (!formTracking || !inputNomorDO || !hasilTracking) {
        return;
    }

    // Mencegah hasil lama tetap tampil saat halaman dibuka kembali
    hasilTracking.style.display = "none";
    pesanTracking.innerHTML = "";

    // Format tanggal
    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        const bagianTanggal = tanggal.split("-");

        if (bagianTanggal.length !== 3) {
            return tanggal;
        }

        const tanggalObj = new Date(
            Number(bagianTanggal[0]),
            Number(bagianTanggal[1]) - 1,
            Number(bagianTanggal[2])
        );

        return tanggalObj.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    // Format tanggal dan waktu riwayat
    function formatWaktu(waktu) {
        if (!waktu) return "-";

        const bagian = waktu.split(" ");
        const tanggal = bagian[0] || "";
        const jam = bagian[1] || "";

        return formatTanggal(tanggal) + (jam ? " pukul " + jam : "");
    }

    // Menentukan status pengiriman
    function tentukanStatus(pesanan) {

        const riwayat = pesanan.perjalanan || [];

        const sudahDiterima = riwayat.some(item =>
            item.keterangan.toLowerCase().includes("selesai antar") ||
            /\bditerima oleh\b/.test(item.keterangan.toLowerCase())
        );

        if (
            sudahDiterima ||
            pesanan.status.toLowerCase() === "selesai" ||
            pesanan.status.toLowerCase() === "diterima"
        ) {
            return {
                label: "Selesai Dikirim",
                persentase: 100,
                kelas: "status-selesai"
            };
        }

        if (
            pesanan.status.toLowerCase().includes("perjalanan") ||
            pesanan.status.toLowerCase().includes("dikirim")
        ) {
            return {
                label: "Dalam Perjalanan",
                persentase: 65,
                kelas: "status-perjalanan"
            };
        }

        return {
            label: pesanan.status || "Sedang Diproses",
            persentase: 30,
            kelas: "status-proses"
        };
    }

    // Menampilkan pesan
    function tampilkanPesan(pesan, jenis) {

        pesanTracking.innerHTML = `
            <div class="alert alert-${jenis} py-2 mb-0 small" role="alert">
                ${pesan}
            </div>
        `;
    }

    // Menampilkan riwayat perjalanan
    function tampilkanRiwayat(perjalanan) {

        const tempatRiwayat = document.getElementById("riwayatTracking");

        tempatRiwayat.innerHTML = "";

        if (!perjalanan || perjalanan.length === 0) {
            tempatRiwayat.innerHTML = `
                <p class="text-muted small mb-0">
                    Belum tersedia riwayat perjalanan paket.
                </p>
            `;
            return;
        }

        // Riwayat terbaru ditampilkan paling atas
        const daftarRiwayat = [...perjalanan].reverse();

        daftarRiwayat.forEach((item, index) => {

            const elemen = document.createElement("div");
            elemen.className = "tracking-timeline-item";

            const marker = document.createElement("div");
            marker.className = "tracking-timeline-marker";
            marker.innerHTML = index === 0
                ? '<i class="bi bi-check-lg"></i>'
                : '<i class="bi bi-geo-alt"></i>';

            const konten = document.createElement("div");
            konten.className = "tracking-timeline-content";

            const judul = document.createElement("h6");
            judul.textContent = index === 0
                ? "Pembaruan Terakhir"
                : "Riwayat Pengiriman";

            const keterangan = document.createElement("p");
            keterangan.textContent = item.keterangan || "-";

            const waktu = document.createElement("small");
            waktu.innerHTML = `<i class="bi bi-clock me-1"></i>`;

            const teksWaktu = document.createTextNode(
                formatWaktu(item.waktu)
            );

            waktu.appendChild(teksWaktu);

            konten.appendChild(judul);
            konten.appendChild(keterangan);
            konten.appendChild(waktu);

            elemen.appendChild(marker);
            elemen.appendChild(konten);

            tempatRiwayat.appendChild(elemen);
        });
    }

    // Menampilkan detail pengiriman
    function tampilkanDetail(pesanan) {

        const status = tentukanStatus(pesanan);

        document.getElementById("hasilNomorDO").textContent =
            pesanan.nomorDO || "-";

        document.getElementById("hasilNamaPemesan").textContent =
            pesanan.nama || "-";

        document.getElementById("hasilEkspedisi").textContent =
            pesanan.ekspedisi || "-";

        document.getElementById("hasilTanggalKirim").textContent =
            formatTanggal(pesanan.tanggalKirim);

        document.getElementById("hasilJenisPaket").textContent =
            pesanan.paket || "-";

        document.getElementById("hasilTotalPembayaran").textContent =
            pesanan.total || "-";

        // Badge status
        const badge = document.getElementById("badgeStatusTracking");

        badge.textContent = status.label;
        badge.className = "badge " + status.kelas;

        // Progress bar
        const progressBar = document.getElementById("progressBarTracking");

        progressBar.style.width = status.persentase + "%";
        progressBar.setAttribute("aria-valuenow", status.persentase);

        document.getElementById("persentaseTracking").textContent =
            status.persentase + "%";

        // Riwayat perjalanan
        tampilkanRiwayat(pesanan.perjalanan);

        // Tampilkan hasil
        hasilTracking.style.display = "block";
        pesanTracking.innerHTML = "";
    }

    // Proses pencarian
    formTracking.onsubmit = function (event) {

        event.preventDefault();

        const nomorDO = inputNomorDO.value.trim();

        if (!nomorDO) {
            hasilTracking.style.display = "none";
            tampilkanPesan(
                "Silakan masukkan nomor Delivery Order terlebih dahulu.",
                "warning"
            );
            return;
        }

        let dataPesanan = Object.assign({}, dataTracking || {});

        try {
            const trackingTersimpan = localStorage.getItem("dataTrackingBookstore");
            if (trackingTersimpan) {
                dataPesanan = Object.assign(dataPesanan, JSON.parse(trackingTersimpan));
            }
        } catch (error) {
            console.error("Gagal membaca data tracking tersimpan:", error);
            tampilkanPesan("Data tracking tersimpan tidak dapat dibaca.", "danger");
            return;
        }

        const pesanan = dataPesanan[nomorDO];

        if (!pesanan) {

            hasilTracking.style.display = "none";

            tampilkanPesan(
                "Nomor Delivery Order <strong>" +
                nomorDO +
                "</strong> tidak ditemukan. Periksa kembali nomor yang dimasukkan.",
                "danger"
            );

            return;
        }

        tampilkanDetail(pesanan);
    };

    // Bersihkan pesan ketika pengguna mulai mengetik
    inputNomorDO.oninput = function () {
        pesanTracking.innerHTML = "";
    };

}
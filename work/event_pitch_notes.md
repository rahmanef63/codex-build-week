# TemanUsaha AI - Catatan Pitch Build Week Jakarta

## Positioning untuk Juri

**Pitch satu kalimat:** TemanUsaha AI adalah asisten usaha percakapan untuk UMKM Indonesia yang mengubah bahasa sehari-hari menjadi pembaruan produk, stok, pesanan, pelanggan, dan tugas, sambil menjelaskan data yang dipakai, tindakan yang dilakukan, hal yang perlu diverifikasi, dan cara memberi instruksi yang lebih baik.

**Masalah dan pengguna:** Pemilik UMKM mengelola usaha dari chat, ingatan, dan catatan terpisah; pencatatan terlambat dan keputusan stok mudah salah. Pengguna utama adalah pemilik usaha mikro yang bekerja sendiri atau dengan tim kecil dan tidak ingin belajar software operasional yang rumit.

**Workflow yang dinilai:** pengguna berbicara dalam Bahasa Indonesia -> AI memahami maksud -> GPT Action membaca atau memperbarui data -> dashboard menampilkan perubahan -> AI memberi ringkasan literasi dan meminta verifikasi bila perlu.

**Kecocokan dengan kriteria:**
- **Practical AI product:** menyelesaikan pekerjaan operasional nyata, bukan sekadar chatbot tanya jawab.
- **Working demo:** satu alur utuh dari percakapan ke perubahan data yang terlihat.
- **Responsible and inclusive AI:** Bahasa Indonesia natural, transparansi pada setiap aksi, konfirmasi untuk aksi berisiko, dan jalur koreksi manusia.
- **Continuation potential:** fondasi dapat diperluas ke WhatsApp, multi-user, laporan, dan integrasi marketplace setelah validasi kebutuhan.
- **Penggunaan OpenAI:** custom GPT menjadi antarmuka dan reasoning layer; GPT Actions mengeksekusi workflow; Codex/GPT-5.6 membantu membangun dan menguji produk.

**Pembeda utama:** bukan banyaknya fitur administrasi, melainkan *actionable AI literacy*: pengguna selalu tahu apa yang AI pahami, lakukan, dan belum bisa jamin.

## Demo Story Maksimal 3 Menit

**0:00-0:25 - Hook**  
"Bu Rina menjual sambal rumahan. Pesanan datang lewat chat, stok ada di kepala, dan malam hari ia harus mencatat ulang semuanya." Tunjukkan dashboard awal dengan stok dan pesanan yang sudah sederhana.

**0:25-1:15 - Percakapan menjadi tindakan**  
Ketik: "Tambahkan pesanan Bu Sari: 3 sambal original dan 2 sambal teri. Bayar nanti saat dikirim besok." AI menampilkan interpretasi terstruktur lalu meminta konfirmasi. Setelah disetujui, GPT Action membuat pesanan dan mengurangi stok. Dashboard berubah langsung.

**1:15-1:55 - Literasi AI dalam workflow**  
Sorot respons tetap:
- Info yang digunakan: nama pelanggan, produk, jumlah, pembayaran, tanggal kirim.
- Tindakan: pesanan dibuat dan stok dikurangi.
- Perlu diverifikasi: identitas "Bu Sari" dan tanggal pengiriman.
- Instruksi berikutnya: sertakan nomor pelanggan atau tanggal pasti untuk mengurangi ambiguitas.

Lalu koreksi lewat chat: "Bukan besok, kirim 20 Juli." Tunjukkan data diperbarui tanpa membuka form.

**1:55-2:30 - Nilai praktis**  
Tanya: "Apa yang harus saya kerjakan hari ini dan stok apa yang menipis?" AI membaca data aktual, menjawab singkat, dan membuat satu tugas setelah konfirmasi.

**2:30-2:55 - Penutup**  
"TemanUsaha AI membuat pencatatan usaha semudah mengirim chat, tetapi tetap transparan dan berada di bawah kendali pemilik usaha." Tampilkan dashboard sebagai bukti aksi dan sebutkan kelanjutan paling masuk akal: uji dengan UMKM nyata lalu integrasi kanal chat yang mereka gunakan.

**2:55-3:00 - End card**  
Nama proyek, repo, dan satu kalimat pitch. Jangan lewat tiga menit.

## Tradeoff Build Hari Ini

### Wajib Jadi
- Satu data store sederhana dengan data demo stabil.
- GPT Actions untuk **lihat data**, **buat pesanan**, **ubah tanggal/status pesanan**, dan **buat tugas**.
- Dashboard read-only atau nyaris read-only yang langsung memperlihatkan produk, stok, pesanan, dan tugas.
- Konfirmasi sebelum write, validasi input dasar, pesan gagal yang jelas, dan format literasi AI konsisten.
- Satu skenario demo yang dapat di-reset dan dijalankan ulang.

### Potong Hari Ini
- CRUD lengkap untuk pelanggan, catatan, dan semua entitas.
- Login, multi-user, role, sinkronisasi real-time kompleks, analitik, voice, WhatsApp, marketplace, pembayaran, dan deployment enterprise.
- Otomatisasi tanpa konfirmasi dan prediksi stok berbasis data palsu.
- UI dekoratif; cukup dashboard bersih yang membuktikan perubahan data.

**Urutan kerja:** alur demo end-to-end -> error handling dan reset data -> rekam video -> README dan submit -> polish visual jika masih ada waktu. Bekukan fitur paling lambat sekitar 13:00 agar ada waktu untuk rehearsal dan rekaman sebelum acara selesai pukul 15:00.

## Risiko yang Harus Dihindari

- **Demo terlihat seperti chatbot biasa:** perubahan harus tampak di dashboard dan berasal dari Action nyata.
- **Scope meledak:** empat Action yang andal lebih kuat daripada delapan modul setengah jadi.
- **Aksi salah atau ambigu:** tampilkan interpretasi dan minta konfirmasi sebelum mengubah stok, pesanan, atau pelanggan.
- **Klaim berlebihan:** jangan menyatakan saran bisnis sebagai fakta; tunjukkan sumber data internal dan batasannya.
- **Data pribadi bocor:** gunakan data sintetis di demo, minimalkan data pelanggan, dan jangan tampilkan kredensial/log sensitif.
- **Literasi AI terasa seperti disclaimer:** buat pendek, spesifik terhadap aksi, dan membantu pengguna memberi instruksi berikutnya.
- **Ketergantungan internet/demo:** siapkan data reset, prompt cadangan, video rekaman, dan screenshot hasil akhir.
- **Presentasi terlalu lama:** satu pengguna, satu masalah, satu workflow utama, satu bukti hasil.

## Checklist Final

- Working project dapat dibuka dan alur utama lolos rehearsal.
- Video YouTube kurang dari 3 menit.
- Repo dan README menjelaskan setup, arsitektur singkat, limitasi, serta penggunaan Codex/GPT-5.6.
- Cantumkan session ID dari `/feedback`.
- Submit ke Devpost sebelum **21 Juli 2026, 17:00 PT**; jangan mengandalkan menit terakhir.
- Hari acara: **Hellolive, Centennial Tower Level 29, Jakarta; 09:00-15:00**.

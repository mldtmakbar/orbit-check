# Orbit Instagram Check

![alt text](image-1.png)

Dashboard ringan untuk membandingkan followers dan following Instagram, lalu menemukan akun yang belum follow back.

Dashboard ini tidak meminta password Instagram dan tidak mengirim data ke backend. File ZIP atau JSON diproses langsung di browser pengguna.

## Fitur

- Membaca satu file ZIP hasil Instagram Data Download.
- Membaca file `followers_*.json` dan `following.json` secara manual.
- Mendukung beberapa file followers seperti `followers_1.json`, `followers_2.json`, dan seterusnya.
- Membaca data tambahan Instagram: blocked profiles, close friends, following hashtags, hide story from, pending requests, recent requests, recently unfollowed, removed suggestions, dan restricted profiles.
- Menampilkan jumlah followers, following, mutual, dan akun yang belum follow back.
- Menampilkan jumlah dan daftar untuk setiap kategori data Instagram tambahan.
- Mencari username dan mengurutkan daftar A-Z atau Z-A.
- Membuka profil Instagram dari daftar hasil.
- Reset data dan membersihkan file yang dipilih.
- Tidak menyimpan data Instagram setelah halaman ditutup atau di-refresh.

## Yang diperlukan

- Browser modern seperti Chrome, Edge, Firefox, atau Safari.
- File ZIP atau JSON dari fitur resmi Instagram Data Download.
- Koneksi internet saat pertama kali membuka dashboard karena library pembaca ZIP dimuat dari jsDelivr.

Dashboard ini adalah aplikasi static client-side. Tidak perlu React atau backend untuk menjalankannya.

## Cara mendapatkan data Instagram

1. Buka Instagram dan masuk ke akunmu.
2. Buka **Settings and activity**.
3. Masuk ke **Accounts Center**.
4. Pilih **Your information and permissions**.
5. Pilih **Download your information**.
6. Pilih akun Instagram yang ingin diproses.
7. Pilih **Some of your information** jika tersedia.
8. Pilih **Followers and following**.
9. Pilih format **JSON**.
10. Minta atau buat file download.
11. Setelah Instagram menyiapkan file, download ZIP tersebut ke komputer.

Nama menu Instagram dapat berubah. Gunakan fitur download informasi resmi Instagram dan jangan memasukkan password ke dashboard ini.

## Cara menggunakan dashboard

### Cara paling mudah: upload ZIP

1. Buka URL dashboard.
2. Klik area **Upload satu file ZIP**.
3. Pilih ZIP hasil download Instagram.
4. Tunggu sampai status berubah menjadi **ZIP berhasil dibaca**.
5. Klik **Analisis jaringan**.

Dashboard akan mencari file followers dan following di dalam ZIP, termasuk file yang berada di subfolder.

### Cara manual: upload JSON

1. Klik area **Followers**, lalu pilih satu atau beberapa file `followers_*.json`.
2. Klik area **Following**, lalu pilih `following.json`.
3. Opsional, klik **Data Instagram lainnya**, lalu pilih satu atau beberapa JSON tambahan.
4. Klik **Analisis jaringan**.

Jika hasil sebelumnya masih terlihat, klik **Reset analysis**. Refresh halaman juga akan menghapus state analisis dan tidak membaca file otomatis.

## Instalasi lokal

Tidak ada instalasi package yang wajib dilakukan.

1. Download project dari GitHub melalui **Code → Download ZIP**.
2. Extract ZIP ke folder lokal.
3. Buka `index.html` dengan browser.
4. Upload ZIP atau JSON Instagram melalui dashboard.

Untuk development, project juga dapat dijalankan melalui static server apa pun. Tidak diperlukan database atau backend.

## Mengakses lewat GitHub Pages

Dashboard dapat digunakan langsung melalui link GitHub Pages yang dibagikan oleh pemilik aplikasi. Tidak perlu menginstal aplikasi atau membuat akun tambahan.

Jika dashboard dibagikan dalam bentuk file project:

1. Buka halaman repository GitHub.
2. Klik tombol **Code**.
3. Pilih **Download ZIP**.
4. Extract file ZIP tersebut.
5. Buka `index.html`.

Jika tersedia, gunakan URL GitHub Pages karena lebih praktis daripada mendownload file satu per satu.

## Privasi dan batasan

- Dashboard hanya menganalisis data yang dipilih pengguna.
- Dashboard tidak melakukan scraping Instagram.
- Dashboard tidak meminta login Instagram.
- Dashboard tidak dapat mengambil data hanya berdasarkan username.
- Library ZIP dimuat dari jsDelivr. Selain library tersebut, tidak ada upload data ke server.
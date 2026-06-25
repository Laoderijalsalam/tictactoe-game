# Tic Tac Toe

Aplikasi web Tic Tac Toe untuk dua pemain pada satu perangkat. Game dibuat dengan HTML, CSS, dan JavaScript murni tanpa package game siap pakai.

## Tech Stack

- HTML5
- CSS3
- JavaScript

## Cara Menjalankan

Tidak ada dependency yang perlu di-install.

1. Clone repository ini.
2. Buka file `index.html` langsung di browser.

Opsional, jalankan local server:

```bash
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Fitur Utama

- Setup game untuk mengisi nama Player X dan Player O.
- Board Tic Tac Toe 3 x 3.
- Player X selalu mulai lebih dulu.
- Pergantian giliran otomatis.
- Cell yang sudah terisi tidak bisa diubah.
- Board terkunci setelah game selesai.
- Deteksi pemenang horizontal, vertikal, dan diagonal.
- Deteksi draw saat board penuh tanpa pemenang.
- Reset game mengosongkan board dan mengembalikan giliran ke Player X.
- Tampilan responsif untuk mobile, tablet, dan desktop.

## Fitur Bonus

- Scoreboard untuk kemenangan X, kemenangan O, dan draw.
- Highlight pada winning line.
- Input nama pemain.
- Game history per langkah.
- Undo untuk mengembalikan langkah terakhir saat game masih berjalan.
- Play Again modal saat game selesai.
- Keyboard shortcut: angka 1-9 untuk memilih cell, `R` untuk restart, dan `N` untuk ronde baru.
- Toggle tema light/dark.

## Struktur Proyek

```text
.
├── index.html
├── styles.css
├── main.js
└── README.md
```

## Screenshot

Screenshot dapat ditambahkan setelah aplikasi dijalankan di browser.

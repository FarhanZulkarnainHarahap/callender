<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=gradient&customColorList=13,18,20,26&text=Season%20Calendar%20Web&fontAlign=50&fontAlignY=38&fontSize=42&desc=Next.js%20Pixel%20Weather%20Calendar&descAlign=50&descAlignY=62&animation=twinkling" alt="Season Calendar Web animated header" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Press+Start+2P&size=16&duration=2800&pause=900&color=F5B840&center=true&vCenter=true&width=800&lines=Kalender+musim+dengan+foto+harian;Pixel+font+dan+glassmorphism+UI;Klik+tanggal%2C+tulis+deskripsi%2C+simpan+ke+database" alt="Typing animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111111" alt="React" />
  <img src="https://img.shields.io/badge/Pixel%20Font-Press%20Start%202P-E65788?style=for-the-badge" alt="Pixel font" />
  <img src="https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide Icons" />
</p>

## Preview

Frontend ini adalah kalender musim bergaya pixel dengan background foto yang berubah berdasarkan musim dan tanggal. Klik tanggal untuk membuka sidebar detail, tambah deskripsi, lalu simpan ke API.

```txt
Spring  -> 4 foto harian
Summer  -> 4 foto harian
Autumn  -> 4 foto harian
Winter  -> 4 foto harian
```

## Fitur

- Tampilan fullscreen dengan background seasonal artwork.
- Font pixel menggunakan `Press Start 2P`.
- Kalender bulanan dengan tanggal aktif dan marker deskripsi.
- Sidebar modal ketika tanggal diklik.
- Form deskripsi hari yang menyimpan ke database melalui API.
- Fallback lokal jika API belum tersedia.
- Efek partikel, overlay cuaca, dan visual berbeda per hari.
- Responsif untuk desktop dan mobile.

## Struktur

```txt
web/
├─ app/
│  ├─ globals.css
│  ├─ layout.jsx
│  └─ page.jsx
├─ components/
│  └─ SeasonCalendar.jsx
├─ lib/
│  └─ localCalendar.js
├─ public/
│  └─ seasons/
│     ├─ spring.png ... spring-4.png
│     ├─ summer.png ... summer-4.png
│     ├─ autumn.png ... autumn-4.png
│     └─ winter.png ... winter-4.png
└─ package.json
```

## Environment

Buat file `.env.local` di folder `web`.

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Menjalankan

```bash
npm install
npm run dev
```

Web akan berjalan di:

```txt
http://localhost:3000
```

Jika port 3000 sudah dipakai:

```bash
npm run dev -- -p 3100
```

## Integrasi API

Frontend membaca kalender dari:

```http
GET /api/calendar?year=2026&month=5&selectedDate=2026-05-29
```

Frontend menyimpan deskripsi hari ke:

```http
PUT /api/day/2026-05-29/description
Content-Type: application/json

{
  "content": "Hari ini terasa hangat dan cerah."
}
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan lint Next.js |

## Aset

Semua gambar musim tersimpan di:

```txt
public/seasons
```

API akan mengirim path gambar lewat `artwork.base`, lalu web memasangnya sebagai background utama.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=90&section=footer&color=gradient&customColorList=13,18,20,26" alt="Footer wave" />
</p>

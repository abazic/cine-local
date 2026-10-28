# Progress Report — Cine Local
**Proyek: Website katalog bergaya Netflix yang berjalan di localhost**

**Status saat ini:** Semua fase selesai kecuali pemutaran video. Aplikasi berjalan penuh di `localhost:3000` dengan katalog live, watchlist, riwayat, filter genre, pagination, dan tampilan responsif mobile.

---

## 1. Ringkasan progres

| Komponen | Status | Keterangan |
|---|---|---|
| Proyek Next.js | ✅ Selesai | Berjalan di `localhost:3000` |
| UI bergaya Netflix | ✅ Selesai | Navbar, hero banner, katalog, kartu poster, halaman detail |
| Data demo | ✅ Selesai | 6 film demo untuk pengujian UI (disembunyikan dari katalog live) |
| Parser katalog HTML | ✅ Selesai | `lib/providers/html-parser.ts` — judul, poster, tahun, genre, slug |
| Parser halaman detail | ✅ Selesai | `lib/providers/html-detail-parser.ts` — judul, poster, tahun, genre, sinopsis, kind |
| Parser episode | ✅ Selesai | Dari embedded JSON `<script type="application/json">` |
| HTML provider | ✅ Selesai | `lib/providers/html-provider.ts` dengan `fetchHtml`, `getCatalog`, `search`, `getDetails`, pagination |
| Dual provider | ✅ Selesai | LK21 (`CINE_LK21_URL`) dan NontonDrama (`CINE_NONTONDRAMA_URL`) di `.env.local` |
| Registry terpadu | ✅ Selesai | `lib/providers/registry.ts` — `getUnifiedCatalog`, `getGenreCatalog`, `getPagedCatalog` |
| Routing internal | ✅ Selesai | Kartu film mengarah ke `/title/[id]` bukan URL situs asli |
| Halaman detail | ✅ Selesai | Menampilkan poster, judul, tahun, genre, sinopsis, daftar episode |
| Suspense | ✅ Selesai | `app/page.tsx` dan `app/search/page.tsx` sudah dibungkus `<Suspense>` |
| Hero banner | ✅ Selesai | Rotasi otomatis 6 detik, poster live dengan blur + brightness, dots navigator |
| Pencarian | ✅ Selesai | Mencari dari semua provider, deduplikasi hasil |
| Watchlist | ✅ Selesai | `localStorage`, hook `useWatchlist`, halaman `/watchlist` |
| Riwayat tontonan | ✅ Selesai | `localStorage`, hook `useHistory`, halaman `/history`, `HistoryTracker` otomatis di halaman detail |
| Filter genre | ✅ Selesai | Baris per genre (Drama, Action, Horror, Romance, Comedy) dari endpoint `/genre/{nama}` |
| Pagination katalog | ✅ Selesai | Tombol "Muat Lebih" via Server Action, pola `/page/N` |
| Caching server | ✅ Selesai | `unstable_cache` Next.js, revalidasi 1 jam per provider dan per genre |
| Tampilan responsif mobile | ✅ Selesai | Hamburger menu, kartu lebih kecil, judul hero lebih kecil |
| `.env.example` | ✅ Selesai | Didokumentasikan dan di-commit dengan `git add -f` |
| Pemutaran video | ⏳ Belum | Belum dikerjakan |
| TypeScript check | ✅ Lolos | `npx tsc --noEmit` bersih |

---

## 2. Struktur repository saat ini

```text
cine-local/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ✅ Suspense + CatalogContent + GenreRow + LoadMore
│   ├── globals.css
│   ├── search/
│   │   └── page.tsx                ✅ Suspense + SearchResults dari semua provider
│   ├── title/
│   │   └── [id]/
│   │       └── page.tsx            ✅ Detail film + daftar episode + HistoryTracker
│   ├── watchlist/
│   │   └── page.tsx                ✅ Daftar watchlist dari localStorage
│   └── history/
│       └── page.tsx                ✅ Riwayat tontonan dari localStorage
│
├── components/
│   ├── Navbar.tsx                  ✅ Hamburger menu mobile + link Beranda/Daftar Saya/Riwayat
│   ├── HeroBanner.tsx              ✅ Rotasi otomatis, blur background, dots navigator
│   ├── MovieCard.tsx               ✅ Link ke /title/[id], ukuran responsif
│   ├── SearchBar.tsx               ✅ Form ke /search?q=
│   ├── WatchlistButton.tsx         ✅ Toggle watchlist
│   ├── HistoryTracker.tsx          ✅ Client component, catat riwayat saat buka detail
│   └── LoadMore.tsx                ✅ Client component, pagination via Server Action
│
├── lib/
│   ├── providers/
│   │   ├── types.ts                ✅ Movie, Episode, MovieProvider (getCatalog dengan page)
│   │   ├── registry.ts             ✅ getUnifiedCatalog, getGenreCatalog, getPagedCatalog
│   │   ├── demo.ts                 ✅ 6 film demo
│   │   ├── html-provider.ts        ✅ fetchHtml + unstable_cache + pagination + genre
│   │   ├── html-parser.ts          ✅ Parser katalog
│   │   └── html-detail-parser.ts   ✅ Parser detail + episode
│   └── storage/
│       ├── watchlist.ts            ✅ Hook useWatchlist (localStorage)
│       └── history.ts              ✅ Hook useHistory (localStorage, maks 50 entri)
│
├── scripts/
│   └── test-detail.ts              ✅ Tes parser detail dan episode
│
├── .env.local                      ✅ CINE_LK21_URL + CINE_NONTONDRAMA_URL (tidak di-commit)
└── .env.example                    ✅ Didokumentasikan
```

---

## 3. Variabel environment

```env
CINE_LK21_URL=https://tv12.lk21official.cc
CINE_NONTONDRAMA_URL=https://tv9.nontondrama.my
```

Catalog URL yang digunakan:
- LK21: `${CINE_LK21_URL}/loadmore/latest-movies/page/1`
- NontonDrama: `${CINE_NONTONDRAMA_URL}/loadmore/latest-series/page/1`

Genre URL: `${baseUrl}/genre/{nama}` (drama, action, horror, romance, comedy)
Pagination: URL katalog dengan `/page/N`

---

## 4. Tipe data yang sudah terdefinisi

```ts
export type Episode = {
  season: number;
  episode: number;
  title: string;
  slug: string;
};

export type Movie = {
  id: string;           // slug dari URL, misal: "doctor-x-age-white-mafia-2026"
  providerId: string;   // "lk21" | "nontondrama" | "demo"
  title: string;
  poster: string | null;
  overview: string | null;
  year: number | null;
  genres: string[];
  detailUrl: string;
  kind?: "movie" | "series";
  episodes?: Episode[];
};
```

---

## 5. Yang perlu dikerjakan selanjutnya

| Prioritas | Fitur | Catatan |
|---|---|---|
| P3 | Pemutaran video | Belum ada sumber yang diverifikasi |
| P3 | Pengujian end-to-end | Alur lengkap dari katalog sampai detail |

---

## 6. Catatan penting

- **Izin penggunaan:** metadata (judul, poster, sinopsis) dari LK21 dan NontonDrama diambil untuk keperluan katalog pribadi lokal. Untuk keperluan belajar dan tidak untuk disebarluaskan. 
- **Pemutaran video:** belum dikerjakan. Belum ada extractor stream yang dibuat. Player hanya akan diimplementasikan untuk sumber media yang jelas izinnya.
- **Cache:** `unstable_cache` menyimpan katalog dan detail selama 1 jam. Restart dev server akan menghapus cache.
- **`.env.local` tidak di-commit** ke git (sudah ada di `.gitignore`).
- **Genre endpoint:** `/loadmore/latest-{genre}/page/1` mengembalikan "Invalid type" — gunakan `/genre/{nama}` sebagai gantinya.

## 7. Temuan Ekstraksi Stream Video (Update Hari Ini)

### A. Analisis Pemutar Video Situs Sumber
- Situs sumber menggunakan **JW Player** untuk menayangkan video.
- Tag `<video>` utama di dalam DOM memuat URL berskema `blob:` (misal: `blob:https://efw29.org/...`), yang merupakan *stream buffer* sementara berbasis JavaScript di browser lokal dan tidak bisa diputar langsung secara eksternal.

### B. Metode Ekstraksi Stream HLS (.m3u8)
- Melalui inspeksi **Firefox Developer Tools (Tab Network)** dengan filter `.m3u8` atau `playlist`, berhasil didapatkan URL asli manifes HLS (*Master Playlist*).
- **Contoh URL Master Playlist yang ditemukan:**
  `https://edge2-waw-sprintcdn.r66nv9ed.com/hls2/03/12223/d9hlxr0z46y3_x/master.m3u8?t=zzYcFz3LoikGYeIGWDmxSZHam2ne3NHTHW23YHeuIUU&s=1792930049&e=10800&f=61117812&srv=1055&asn=8452&sp=5500&p=0`
- **Contoh URL Variant Stream:**
  `https://edge2-waw-sprintcdn.r66nv9ed.com/hls2/03/12223/d9hlxr0z46y3_x/index-v1-a1.m3u8?...`

### C. Karakteristik & Tantangan URL Stream
1. **Token Kedaluwarsa:** URL `.m3u8` dilengkapi parameter keamanan/token (`t=...`, `s=...`, `e=...`) yang hanya berlaku sementara (misal: 3 jam). Token harus diperbarui secara dinamis dari situs sumber saat pemutaran.
2. **Kebutuhan HLS Player Client-side:** Pemutaran di Next.js memerlukan pemutar video yang mendukung protokol HLS (seperti `hls.js` atau `react-player`) karena sebagian besar browser desktop (Chrome/Firefox) tidak mendukung format `.m3u8` secara *native*.
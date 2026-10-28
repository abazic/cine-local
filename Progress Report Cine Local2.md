# Progress Report — Cine Local
**Proyek: Website katalog bergaya Netflix yang berjalan di localhost**

**Status saat ini:** Fase 1, 2, 3, dan 4 (caching) selesai. Langkah berikutnya adalah riwayat tontonan, filter genre, dan penyempurnaan UI.

---

## 1. Ringkasan progres

| Komponen | Status | Keterangan |
|---|---|---|
| Proyek Next.js | ✅ Selesai | Berjalan di `localhost:3000` |
| UI bergaya Netflix | ✅ Selesai | Navbar, hero banner, katalog, kartu poster, halaman detail |
| Data demo | ✅ Selesai | 6 film demo untuk pengujian UI |
| Parser katalog HTML | ✅ Selesai | `lib/providers/html-parser.ts` — judul, poster, tahun, genre, slug |
| Parser halaman detail | ✅ Selesai | `lib/providers/html-detail-parser.ts` — judul, poster, tahun, genre, sinopsis, kind |
| Parser episode | ✅ Selesai | Dari embedded JSON `<script type="application/json">` |
| HTML provider | ✅ Selesai | `lib/providers/html-provider.ts` dengan `fetchHtml`, `getCatalog`, `search`, `getDetails` |
| Dual provider | ✅ Selesai | LK21 (`CINE_LK21_URL`) dan NontonDrama (`CINE_NONTONDRAMA_URL`) di `.env.local` |
| Registry terpadu | ✅ Selesai | `lib/providers/registry.ts` — menggabungkan semua provider, deduplikasi |
| Routing internal | ✅ Selesai | Kartu film mengarah ke `/title/[id]` bukan URL situs asli |
| Halaman detail | ✅ Selesai | Menampilkan poster, judul, tahun, genre, sinopsis, daftar episode |
| Suspense | ✅ Selesai | `app/page.tsx` dan `app/search/page.tsx` sudah dibungkus `<Suspense>` |
| Hero banner | ✅ Selesai | Menampilkan poster dari katalog live, link ke halaman internal |
| Pencarian | ✅ Selesai | Mencari dari semua provider, deduplikasi hasil |
| Watchlist | ✅ Selesai | `localStorage`, hook `useWatchlist`, halaman `/watchlist` |
| Caching server | ✅ Selesai | `unstable_cache` Next.js, revalidasi 1 jam per provider |
| Pemutaran video | ⏳ Belum | Belum dikerjakan |
| Riwayat tontonan | ⏳ Belum | Masih dalam rencana |
| Filter genre/tahun | ⏳ Belum | Masih dalam rencana |
| Pagination katalog | ⏳ Belum | Pola URL `/loadmore/.../page/N` sudah diketahui |
| TypeScript check | ✅ Lolos | `npx tsc --noEmit` bersih |

---

## 2. Struktur repository saat ini

```text
cine-local/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ✅ Suspense + CatalogContent
│   ├── globals.css
│   ├── search/
│   │   └── page.tsx                ✅ Suspense + SearchResults dari semua provider
│   ├── title/
│   │   └── [id]/
│   │       └── page.tsx            ✅ Detail film + daftar episode
│   └── watchlist/
│       └── page.tsx                ✅ Daftar watchlist dari localStorage
│
├── components/
│   ├── Navbar.tsx                  ✅ Link ke /watchlist
│   ├── HeroBanner.tsx              ✅ Poster live, link internal
│   ├── MovieCard.tsx               ✅ Link ke /title/[id]
│   ├── SearchBar.tsx               ✅ Form ke /search?q=
│   └── WatchlistButton.tsx         ✅ Toggle watchlist
│
├── lib/
│   ├── providers/
│   │   ├── types.ts                ✅ Movie, Episode, MovieProvider
│   │   ├── registry.ts             ✅ Dual provider + getUnifiedCatalog
│   │   ├── demo.ts                 ✅ 6 film demo
│   │   ├── html-provider.ts        ✅ fetchHtml + unstable_cache
│   │   ├── html-parser.ts          ✅ Parser katalog
│   │   └── html-detail-parser.ts   ✅ Parser detail + episode
│   └── storage/
│       └── watchlist.ts            ✅ Hook useWatchlist (localStorage)
│
├── scripts/
│   └── test-detail.ts              ✅ Tes parser detail dan episode
│
├── .env.local                      ✅ CINE_LK21_URL + CINE_NONTONDRAMA_URL (tidak di-commit)
└── .env.example                    (belum dibuat)
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
| P1 | Riwayat tontonan | `localStorage`, mirip dengan watchlist |
| P1 | Filter genre di halaman utama | Pakai endpoint `/loadmore/latest-{genre}/page/1` |
| P2 | Pagination katalog | Load more dengan pola `/page/N` |
| P2 | `.env.example` | Dokumentasi variabel environment |
| P2 | Hero banner rotasi otomatis | `useState` + `setInterval`, client component |
| P3 | Pemutaran video | Belum ada sumber yang diverifikasi |
| P3 | Pengujian end-to-end | Alur lengkap dari katalog sampai detail |
| P3 | Tampilan responsif mobile | Belum diuji di layar kecil |

---

## 6. Catatan penting

- **Izin penggunaan:** metadata (judul, poster, sinopsis) dari LK21 dan NontonDrama diambil untuk keperluan katalog pribadi lokal. Belum ada konfirmasi formal izin penggunaan dari kedua situs. Jangan gunakan untuk produksi publik.
- **Pemutaran video:** belum dikerjakan. Tidak ada extractor stream yang dibuat. Player hanya akan diimplementasikan untuk sumber media yang jelas izinnya.
- **Cache:** `unstable_cache` menyimpan katalog dan detail selama 1 jam. Restart dev server akan menghapus cache.
- **`.env.local` tidak di-commit** ke git (sudah ada di `.gitignore`).

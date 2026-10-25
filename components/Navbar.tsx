import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between gap-4 bg-gradient-to-b from-black/90 to-transparent px-6 py-4 md:px-12">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-extrabold tracking-wide text-red-600">
          CINE LOCAL
        </Link>
        <nav className="hidden gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/" className="hover:text-white">Beranda</Link>
          <Link href="/watchlist" className="hover:text-white">Daftar Saya</Link>
          <Link href="/history" className="hover:text-white">Riwayat</Link>
        </nav>
      </div>
      <SearchBar />
    </header>
  );
}

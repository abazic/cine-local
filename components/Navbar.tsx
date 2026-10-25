"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/90 to-transparent px-6 py-4 md:px-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold tracking-wide text-red-600">
            CINE LOCAL
          </Link>
          <nav className="hidden gap-6 text-sm text-zinc-300 md:flex">
            <Link href="/" className="hover:text-white">Beranda</Link>
            <Link href="/watchlist" className="hover:text-white">Daftar Saya</Link>
            <Link href="/history" className="hover:text-white">Riwayat</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 md:hidden"
            aria-label="Menu"
          >
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mt-3 flex flex-col gap-3 text-sm text-zinc-300 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-white">Beranda</Link>
          <Link href="/watchlist" onClick={() => setMenuOpen(false)} className="hover:text-white">Daftar Saya</Link>
          <Link href="/history" onClick={() => setMenuOpen(false)} className="hover:text-white">Riwayat</Link>
        </nav>
      )}
    </header>
  );
}

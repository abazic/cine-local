export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" method="GET" role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari judul..."
        className="w-36 rounded bg-zinc-900/80 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-white md:w-56"
      />
    </form>
  );
}

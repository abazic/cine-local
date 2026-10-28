import { getFreshStreamUrl } from "../lib/providers/stream-extractor";

const detailUrl = process.argv[2];

if (!detailUrl) {
  console.error("Gunakan: npx tsx scripts/debug-stream.ts <URL_DETAIL>");
  process.exit(1);
}

async function main() {
  const startedAt = Date.now();
  const result = await getFreshStreamUrl(detailUrl);

  console.log("=== HASIL DIAGNOSTIK STREAM ===");
  console.log("Waktu (ms):", Date.now() - startedAt);
  console.log("URL ditemukan:", Boolean(result));

  if (result) {
    try {
      console.log("Tipe:", result.type);
      const url = new URL(result.url);
      console.log("Protokol:", url.protocol);
      console.log("Host:", url.host);
      console.log("Jenis:", /\.m3u8(?:$|[?#])/i.test(url.href) ? "HLS" : "Bukan HLS langsung");
    } catch {
      console.log("Format hasil: bukan URL absolut yang valid");
    }
  }
}

main().catch((error) => {
  console.error("Diagnostik gagal:", error instanceof Error ? error.message : "Kesalahan tidak diketahui");
  process.exitCode = 1;
});

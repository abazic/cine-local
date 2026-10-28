export type StreamResult =
  | { type: "hls"; url: string }
  | { type: "embed"; url: string; framable: boolean };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Menangkap https://... maupun https:\/\/... (escape JSON)
const M3U8_REGEX = /https?:(?:\\?\/){2}[^\s"'<>]+?\.m3u8(?:\?[^\s"'<>]*)?/i;

// Membersihkan escape HTML dan JSON dari URL yang ditemukan di halaman
function cleanUrl(raw: string): string {
  return raw
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/");
}

async function fetchText(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10_000
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.error(`Gagal fetch ${url}:`, err);
    return null;
  }
}

// Cek apakah halaman embed mengizinkan dirender di iframe dari origin lain
async function isFramable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return false;
    if (res.headers.get("x-frame-options")) return false;
    const csp = res.headers.get("content-security-policy") ?? "";
    if (/frame-ancestors/i.test(csp)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getFreshStreamUrl(detailUrl: string): Promise<StreamResult | null> {
  const html = await fetchText(detailUrl, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!html) return null;

  // 1. m3u8 langsung di halaman utama
  const direct = html.match(M3U8_REGEX);
  if (direct) return { type: "hls", url: cleanUrl(direct[0]) };

  // 2. iframe src (\s sebelum src agar data-src tidak ikut)
  const iframeMatch = html.match(/<iframe\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/i);
  if (!iframeMatch) return null;

  let embedUrl: string;
  try {
    embedUrl = new URL(cleanUrl(iframeMatch[1]), detailUrl).toString();
  } catch {
    return null;
  }

  // 3. Cari m3u8 di dalam halaman embed
  const embedHtml = await fetchText(embedUrl, {
    headers: { "User-Agent": UA, Referer: detailUrl },
  });
  const fromEmbed = embedHtml?.match(M3U8_REGEX);
  if (fromEmbed) return { type: "hls", url: cleanUrl(fromEmbed[0]) };

  // 4. Embed sebagai iframe, hanya jika memang boleh di-frame
  return { type: "embed", url: embedUrl, framable: await isFramable(embedUrl) };
}

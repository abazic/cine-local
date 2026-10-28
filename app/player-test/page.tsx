
import VideoPlayer from "@/components/VideoPlayer";

export default function PlayerTestPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-4 text-xl font-bold">HLS Player Test</h1>
      <VideoPlayer
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      />
    </main>
  );
}
